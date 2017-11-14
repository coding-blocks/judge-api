import * as amqp from 'amqplib/callback_api'
import {Channel, Connection} from 'amqplib/callback_api'
import {EventEmitter} from 'events'
import {RunResponse} from '../routes/api/run'


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
  lang: string,
  stdin: string
}

export type JudgeJob = RunJob | SubmissionJob

let jobQ = 'job_queue'
let successQ = 'success_queue'
let jobChannel: Channel
let successListener = new EventEmitter()

/**
 * Connect to RabbitMQ and save channel to
 * @link {jobChannel}
 */
amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err

  connection.createChannel((err, channel) =>{
    if (err) throw err

    channel.assertQueue(jobQ, {durable: true})
    channel.assertQueue(successQ, {durable: true})
    jobChannel = channel
    jobChannel.consume(successQ, (msg) => {
      successListener.emit('success', JSON.parse(msg.content.toString()))
      jobChannel.ack(msg)
    })
  })
})

/**
 * Put a new job on the queue
 * @param {JudgeJob} job
 * @returns {boolean} true if job was put on queue successfully
 */
function queueJob(job: JudgeJob) {
  return jobChannel.sendToQueue(jobQ, new Buffer(JSON.stringify(job)), {persistent: true})
}
export {
  queueJob,
  successListener
}