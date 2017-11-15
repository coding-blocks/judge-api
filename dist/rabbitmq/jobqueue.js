"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = require("amqplib/callback_api");
const events_1 = require("events");
const server_1 = require("../server");
let jobQ = 'job_queue';
let successQ = 'success_queue';
let jobChannel;
let successListener = new events_1.EventEmitter();
exports.successListener = successListener;
/**
 * Connect to RabbitMQ and save channel to
 * @link {jobChannel}
 */
amqp.connect(`amqp://${server_1.config.RABBITMQ.HOST}`, (err, connection) => {
    if (err)
        throw err;
    connection.createChannel((err, channel) => {
        if (err)
            throw err;
        channel.assertQueue(jobQ, { durable: true });
        channel.assertQueue(successQ, { durable: true });
        jobChannel = channel;
        jobChannel.consume(successQ, (msg) => {
            successListener.emit('success', JSON.parse(msg.content.toString()));
            jobChannel.ack(msg);
        });
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