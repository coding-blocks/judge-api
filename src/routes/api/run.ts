import {Response, Router, Request} from 'express'
import axios from 'axios'

import {SubmissionAttributes, Submissions} from '../../db/models'
import {RunJob, queueJob, successListener} from '../../rabbitmq/jobqueue'
import {isInvalidRunRequest} from '../../validators/SubmissionValidators'
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
      axios.post(job.callback, result)
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
 * @apiParam {String(Base64)} input [Optional] stdin input for the program (encoded in base64)
 *
 * @apiUse AvailableLangs
 *
 * @apiSuccess {Number} id Submission id
 * @apiSuccess {String(Base64)} stdout Output of stdout of execution (encoded in base64)
 * @apiSuccess {String(Base64)} stderr Output of stderr of execution (encoded in base64)
 * @apiSuccess {Number} statuscode Result of operation
 *
 * @apiSuccessExample {JSON} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": 10,
 *    "statuscode": 0,
 *    "stdout": "NA0KMg0KMw=="
 *    "stderr": "VHlwZUVycm9y"
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
  }).then((submission: SubmissionAttributes) => {

    let queued = queueJob(<RunJob>{
      id: submission.id,
      source: req.body.source,
      lang: req.body.lang,
      stdin: req.body.stdin
    })

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
        res.sendStatus(200)
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
  Submissions.update({
    end_time: new Date()
  }, {
    where: {
      id: result.id
    }
  })
})

export {route}