"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../../db/models");
const jobqueue_1 = require("../../rabbitmq/jobqueue");
const SubmissionValidators_1 = require("../../validators/SubmissionValidators");
const config = require("../../../config");
const route = express_1.Router();
exports.route = route;
const runPool = {};
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
    const invalidRequest = SubmissionValidators_1.isInvalidRunRequest(req);
    if (invalidRequest) {
        return res.status(501).json({
            code: 501,
            message: invalidRequest.message,
            err: invalidRequest.stack
        });
    }
    models_1.Submissions.create({
        lang: req.body.lang,
        start_time: new Date()
    }).then((submission) => {
        let queued = jobqueue_1.queueJob({
            id: submission.id,
            source: req.body.source,
            lang: req.body.lang,
            stdin: req.body.stdin
        });
        // Put into pool and wait for judge-worker to respond
        runPool[submission.id] = res;
        setTimeout(() => {
            if (runPool[submission.id]) {
                runPool[submission.id].status(408).json({
                    code: 408,
                    message: "Compile/Run timed out",
                });
                delete runPool[submission.id];
            }
        }, config.RUN.TIMEOUT);
    }).catch(err => {
        res.status(501).json({
            code: 501,
            message: "Could not accept submission",
            error: err
        });
    });
});
/**
 * Hear on the success queue, and send back the run response
 */
jobqueue_1.successListener.on('success', (result) => {
    if (runPool[result.id]) {
        runPool[result.id].status(200).json(result);
        delete runPool[result.id];
    }
    models_1.Submissions.update({
        end_time: new Date()
    }, {
        where: {
            id: result.id
        }
    });
});
//# sourceMappingURL=run.js.map