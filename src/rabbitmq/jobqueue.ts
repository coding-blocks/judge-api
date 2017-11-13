import * as amqp from 'amqplib/callback_api'
import {Channel, Connection} from 'amqplib/callback_api'

export interface SubmissionJob {
  id: number
  source: string,
  lang: string,
  testcases: [{input: string, output: string}],
  getstdout: boolean
}

export interface RunJob {
  id: number
  source: string,
  stdin: string
}

export type JudgeJob = RunJob | SubmissionJob

let jobQ = 'jobqueue'
let jobChannel: Channel

/**
 * Connect to RabbitMQ and save channel to
 * @link {jobChannel}
 */
amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err;

  connection.createChannel((err, channel) =>{
    if (err) throw err;

    channel.assertQueue(jobQ, {durable: true})
    jobChannel = channel
  })
})

/**
 * Put a new job on the queue
 * @param {SubmissionJob} job
 * @returns {boolean} true if job was put on queue successfully
 */
function queueJob(job: any) {
  return jobChannel.sendToQueue(jobQ, new Buffer(JSON.stringify(job)), {persistent: true})
}

export {
  queueJob
}