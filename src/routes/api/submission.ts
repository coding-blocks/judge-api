import {Router} from 'express'

const route: Router = Router()

/**
 * @api {post} /submission POST /submission
 * @apiDescription Check a code with given testcases
 * @apiName PostSubmission
 * @apiGroup Submission
 * @apiVersion 0.0.1
 *
 * @apiParam {URL} source URL of file containing the source code to run
 * @apiParam {Enum} lang Language of code to execute
 * @apiParam {Array(Object)} testcases Array of urls of input and output testcases
 * @apiParam {Boolean} getstdout Defines if the results will carry value of stdout and stderr (default: false)
 * @apiParam {URL} callbackurl An url which we will call (POST) with the judgement results
 *
 * @apiUse AvailableLangs
 * @apiParamExample {Array} testcases
 *  [
 *    {"input": "http://file.cb.lk/1872634.txt", "output": "http://file.cb.lk/151312.txt"},
 *    {"input": "http://file.cb.lk/1827312.txt", "output": "http://file.cb.lk/123121.txt"},
 *    {"input": "http://file.cb.lk/1314114.txt", "output": "http://file.cb.lk/513123.txt"}
 *  ]
 *
 * @apiSuccess {Number} judgement_id
 * @apiSuccess {Boolean} accepted
 * @apiSuccess {URL} callbackurl The url we will POST back the result to
 * @apiSuccessExample Success-Example:
 * HTTP/1.1 200 OK
 * {
 *  "judgement_id": 22,
 *  "accepted": true,
 *  "callbackurl": "http://app.cb.lk/judgement/result"
 * }
 *
 * @apiSuccess (Callback) {Number} judgement_id
 * @apiSuccess (Callback) {Array} results Array of object with results
 * (with optionally stderr and stdout inside them if `getstdout` was set **true** in request)
 * @apiSuccessExample Callback Body:
 * HTTP/1.1 POST
 * {
 *  "judgement_id": 22,
 *  "results": [
 *    {"statuscode": 0, "stdout": "JB81jv=", "stderr": "TnVsbFBvaW50Zng2KB2jbaRpb24="},
 *    {"statuscode": 0, "stdout": "Mbj15A=", "stderr": "TnVsbFBvabjg12bfjGNlcHRpb24="},
 *    {"statuscode": 0, "stdout": "UV131b=", "stderr": "TnVsbFBvaW50ZXJFeGNlcHRpb24="},
 *   ]
 * }
 */
route.post('/', (req, res, next) => {

})

export {route}