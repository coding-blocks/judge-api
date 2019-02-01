import {Response, Router, Request} from 'express'
import axios from 'axios'

import {SubmissionAttributes, Submissions, db} from '../../db/models'
import {RunJob, queueJob, successListener} from '../../rabbitmq/jobqueue'
import {isInvalidRunRequest} from '../../validators/SubmissionValidators'
import {upload} from '../../utils/s3'
import {normalizeRunJob} from '../../utils'
import config = require('../../../config')

const route: Router = Router()

export type RunRequestBody = {
  source: string, //Base64 encoded
  lang: string,
  stdin: string,
  mode: string,
  callback?: string
}
export interface RunRequest extends Request {
  body: RunRequestBody
}

export interface RunResponse {
  id: number,
  stdout: string,
  stderr: string
}

export type RunPoolElement = {
  mode: string,
  res: Response,
  callback?: string
}

const runPool: {[x: number]: RunPoolElement} = {}

const handleTimeoutForSubmission = function (submissionId: number) {
  const job = runPool[submissionId]
  const errorResponse = {
    id: submissionId,
    code: 408,
    message: "Compile/Run timed out",
  }

  switch (job.mode) {
    case 'sync': 
      job.res.status(408).json(errorResponse)
      break;
    case 'callback':
      axios.post(job.callback, errorResponse)
  }
}

const handleSuccessForSubmission = function (result: RunResponse) {
  const job = runPool[result.id]
  switch (job.mode) {
    case 'sync':
      job.res.status(200).json(result)
      break;
    case 'callback':
      // send a post request to callback 
      (async () => {
        // 1. upload the result to s3 and get the url
        const code = result.stderr ? 400 : 200
        const {url} = await upload(result)

        // 2. save the url in db
        await Submissions.update(<any>{
          outputs: [url]
        }, {
          where: {
            id: result.id
          }
        })

        // make the callback request
        await axios.post(job.callback, {id: result.id, code, outputs: [url]})
      })()
      break;
  }
}

/**
 * Returns a runPoolElement for request
 */
const getRunPoolElement = function (body: RunRequestBody, res: Response): RunPoolElement {
  switch (body.mode) {
    case 'sync':
      return ({
        mode: 'sync',
        res
      })
    case 'callback':
      return ({
        mode: 'callback',
        res,
        callback: body.callback
      })
  }
}

/**
 * @api {post} /runs POST /runs
 * @apiDescription Run a code and get its output
 * @apiName PostRun
 * @apiGroup Run
 * @apiVersion 0.0.1
 *
 * @apiParam {String(Base64)} source source code to run (encoded in base64)
 * @apiParam {Enum} lang Language of code to execute
 * @apiParam {String(Base64)} stdin [Optional] stdin input for the program (encoded in base64)
 * @apiParam {Enum} mode [Optional] mode for request. Default = `sync`, see: https://github.com/coding-blocks/judge-api/issues/16
 * @apiParam {String)} callback [Optional] callback url for request. Required for `mode = callback`
 * @apiParam {String)} enc [Optional] Encoding type for stdin and source. Can be `url`|`base64`. Default = 'base64' 
 *
 * @apiUse AvailableLangs
 *
 * @apiSuccess {Number} id Submission id
 * @apiSuccess {String(Base64)} stdout Output of stdout of execution (encoded in base64)
 * @apiSuccess {String(Base64)} stderr Output of stderr of execution (encoded in base64)
 * @apiSuccess {Number} statuscode Result of operation
 *
 * @apiSuccessExample {JSON} Success-Response(mode=sync):
 *  HTTP/1.1 200 OK
 *  {
 *    "id": 10,
 *    "statuscode": 0,
 *    "stdout": "NA0KMg0KMw=="
 *    "stderr": "VHlwZUVycm9y"
 *  }
 *  @apiSuccessExample {JSON} Success-Response(mode=callback):
 *  HTTP/1.1 200 OK
 *  {
 *    "id": 10
 *  }
 * 
 *  @apiSuccessExample {JSON} Body for Callback(mode=callback):
 *  HTTP/1.1 200 OK
 *  {
 *    "id": 10,
 *    "code": 200,
 *    "outputs": ["http://localhost/judge-submissions/file.json"]
 *  }
 */
route.post('/', (req, res, next) => {
  const invalidRequest = isInvalidRunRequest(req)
  if (invalidRequest) {
    return res.status(501).json({
      code: 501,
      message: (<Error>invalidRequest).message,
      err: (<Error>invalidRequest).stack
    })
  }
  Submissions.create(<SubmissionAttributes>{
    lang: req.body.lang,
    start_time: new Date()
  }).then(async (submission: SubmissionAttributes) => {

    const job: RunJob = await normalizeRunJob({
      id: submission.id,
      source: req.body.source,
      lang: req.body.lang,
      stdin: req.body.stdin
    }, req.body.enc)

    let queued = queueJob(job)

    // Put into pool and wait for judge-worker to respond
    runPool[submission.id] = getRunPoolElement(req.body, res)

    setTimeout(() => {
      if (runPool[submission.id]) {
        handleTimeoutForSubmission(submission.id)
        delete runPool[submission.id]
      }
    }, config.RUN.TIMEOUT)

    switch (req.body.mode) {
      case 'callback':
        res.json({
          id: submission.id
        })
    }

  }).catch(err => {
    res.status(501).json({
      code: 501,
      message: "Could not accept submission",
      error: err
    })
  })
})

/**
 * Hear on the success queue, and send back the run response
 */
successListener.on('success', (result: RunResponse) => {
  if (runPool[result.id]) {
    handleSuccessForSubmission(result)
    delete runPool[result.id]
  }
  Submissions.update(<any>{
    end_time: new Date()
  }, {
    where: {
      id: result.id
    }
  })
})

export {route}