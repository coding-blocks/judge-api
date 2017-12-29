import {Response, Router} from 'express'
import {SubmissionAttributes, Submissions} from '../../db/models'
import {RunJob, queueJob, successListener} from '../../rabbitmq/jobqueue'
import {config} from '../../server'
import {isInvalidRunRequest} from '../../validators/SubmissionValidators'

const route: Router = Router()

export type RunRequestBody = {
  source: string, //Base64 encoded
  lang: string,
  stdin: string
}
export interface RunRequest extends Request {
  body: RunRequestBody
}

export interface RunResponse {
  id: number,
  stdout: string,
  stderr: string
}

const runPool: {[x: number]: Response} = {}

/**
 * @api {post} /run POST /run
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
      message: 'Invalid run request',
      err: invalidRequest
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
    runPool[submission.id] = res
    setTimeout(() => {
      if (runPool[submission.id]) {
        runPool[submission.id].status(567).json({
          code: 567,
          message: "Compile/Run timed out",
        })
        delete runPool[submission.id]
      }
    }, config.RUN.TIMEOUT)

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
    runPool[result.id].status(200).json(result)
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