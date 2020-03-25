import * as amqp from 'amqplib/callback_api'
import {Channel, Connection} from 'amqplib/callback_api'
import {EventEmitter} from 'events'
import {RunResponse} from '../routes/api/run'
const debug = require('debug')('judge:api:jobqueue')
import config = require('../../config')

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
  stdin: string,
  timelimit: number
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
amqp.connect(`amqp://${config.AMQP.USER}:${config.AMQP.PASS}@${config.AMQP.HOST}:${config.AMQP.PORT}`,
  (err, connection) => {
    if (err) throw err

    connection.createChannel((err, channel) =>{
      if (err) throw err

      channel.assertQueue(jobQ, {durable: true})
      channel.assertQueue(successQ, {durable: true})
      jobChannel = channel
      jobChannel.consume(successQ, (msg) => {
        debug(`SUCCESS:CONSUME: msg.content = ${msg.content.toString()}`)
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
  return jobChannel.sendToQueue(jobQ, Buffer.from(JSON.stringify(job)), {persistent: true})
}
export {
  queueJob,
  successListener
}