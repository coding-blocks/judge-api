import {Response, Router, Request} from 'express'
import {SubmissionAttributes, Submissions} from '../../db/models'
import {RunJob, queueJob, successListener} from '../../rabbitmq/jobqueue'
import {isInvalidRunRequest} from '../../validators/SubmissionValidators'
import config = require('../../../config')
import axios from 'axios'

const route: Router = Router()

export type RunRequestBody = {
  source: string, //Base64 encoded
  lang: string,
  stdin: string,
  mode: string,
  callbackUrl: string
}

export type RunPool = {
  res: Response,
  callbackUrl: string,
  mode: string
}

export interface RunRequest extends Request {
  body: RunRequestBody
}

export interface RunResponse {
  id: number,
  stdout: string,
  stderr: string
}

const runPool: {[x: number]: RunPool} = {}

function getRunPool(req: RunRequest, res: RunResponse) {
  switch(req.body.mode) {
    case 'sync':
      return({
        mode: 'sync',
        res: res,
        callbackUrl: ''
      })
    case 'poll':
      return({
        mode: 'poll',
        res: res,
        callbackUrl: ''
      })
    case 'callback':
      return({
        mode: 'callback',
        res: res,
        callbackUrl: req.body.callbackUrl
      })
  }
}

// Polling function

function pollJobResult (id) {
    axios.get(`/api/run/${id}`).then((req,res) => {
        let { statusCode } = res;
        let error;

        if (stauscode !== 200) {
            error = new Error(`Request Failed: ${statusCode}`)
        }

        if (error) {
          console.error(error.message)
          res.resume()
        }
        else {
          let raw = ''
          res.on('data', (data) => { raw += data })
          res.on('end', () => {
            try {
              let parsedData = JSON.parse(raw)
              switch(raw) {
                case 'running':
                  setTimeout(pollJobResult, 2000)
                  break;
                case 'success':
                  // return response of `/api/run/${id}`
                  break;
              }
            } catch (e) {
                console.error(e.message)
            }
          })
        }
    })
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
    mode: req.body.mode,
    start_time: new Date()
  }).then((submission: SubmissionAttributes) => {

    let queued = queueJob(<RunJob>{
      id: submission.id,
      source: req.body.source,
      lang: req.body.lang,
      stdin: req.body.stdin
    })
    // Put into pool and wait for judge-worker to respond
    runPool[submission.id] = getRunPool(req, res)

    setTimeout(() => {
      if (runPool[submission.id]) {

        let error = {
          id: submission.id,
          code: 408,
          message: "Compile/Run timed out",
        }

        switch(runPool[submission.id].mode) {
          case 'sync':
            runPool[submission.id].status(408).json(error)
            break;
          case 'poll':
            // some logic
            break;
          case 'callback':
            axios.post(runPool[submission.id].callbackUrl, error)
            break;
        }
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
    switch(runPool[result.id].mode) {
      case 'sync':
        runPool[result.id].status(200).json(result)
        break;
      case 'poll':
        // return path to output file, save it to database
        break;
      case 'callback':
        axios.post(runPool[result.id].callbackUrl, result)
        break;
    }
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