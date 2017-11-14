import {Response, Router} from 'express'
import {SubmissionAttributes, Submissions} from '../../db/models'
import {RunJob, queueJob} from '../../rabbitmq/jobqueue'

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
  // TODO: Validate parameters of submission request (like source should be url)
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

  }).catch(err => {
    res.status(501).json({
      code: 501,
      message: "Could not accept submission",
      error: err
    })
  })
})

export {route}