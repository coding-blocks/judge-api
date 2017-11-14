"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = require("amqplib/callback_api");
let jobQ = 'jobqueue';
let jobChannel;
/**
 * Connect to RabbitMQ and save channel to
 * @link {jobChannel}
 */
amqp.connect('amqp://localhost', (err, connection) => {
    if (err)
        throw err;
    connection.createChannel((err, channel) => {
        if (err)
            throw err;
        channel.assertQueue(jobQ, { durable: true });
        jobChannel = channel;
    });
});
/**
 * Put a new job on the queue
 * @param {JudgeJob} job
 * @returns {boolean} true if job was put on queue successfully
 */
function queueJob(job) {
    return jobChannel.sendToQueue(jobQ, new Buffer(JSON.stringify(job)), { persistent: true });
}
exports.queueJob = queueJob;
//# sourceMappingURL=jobqueue.js.map