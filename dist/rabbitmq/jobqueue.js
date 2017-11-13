"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = require("amqplib/callback_api");
let jobQ = 'jobqueue';
let jobChannel;
amqp.connect('amqp://localhost', (err, connection) => {
    if (err)
        throw err;
    else {
        connection.createChannel((err, channel) => {
            channel.assertQueue(jobQ, { durable: true });
            jobChannel = channel;
        });
    }
});
function queueJob(job) {
    return jobChannel.sendToQueue(jobQ, new Buffer(JSON.stringify(job)), { persistent: true });
}
exports.queueJob = queueJob;
//# sourceMappingURL=jobqueue.js.map