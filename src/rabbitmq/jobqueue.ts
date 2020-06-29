import * as amqp from 'amqplib/callback_api'
import { Channel, Connection } from 'amqplib/callback_api'
import { EventEmitter } from 'events'
const debug = require('debug')('judge:api:jobqueue')
const config = require('../../config')

export interface SubmissionJob {
  id: number
  source: string,
  lang: string,
  timelimit: number,
  scenario: string,
  testcases: [{
    id: number,
    stdin: string,
    stodut: string
  }],
}

export interface RunJob {
  id: number
  source: string,
  lang: string,
  stdin: string,
  timelimit: number,
  scenario: string
}

export interface ProjectJob {
  id: number
  source: string,
  lang: string,
  problem: string,
  timelimit: number,
  scenario: string,
  config: string
}

export type JudgeJob = RunJob | SubmissionJob | ProjectJob

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

    connection.createChannel((err, channel) => {
      if (err) throw err

      channel.assertQueue(jobQ, { durable: true })
      channel.assertQueue(successQ, { durable: true })
      jobChannel = channel
      jobChannel.consume(successQ, (msg) => {
        debug(`SUCCESS:CONSUME: msg.content = ${msg.content.toString()}`)

        const payload = JSON.parse(msg.content.toString())
        let eventName;
        switch(payload.scenario) {
          case 'run':
            eventName = 'run_result'
            break
          case 'submit':
            eventName = 'submit_result'
            break
          case 'project':
            eventName = 'project_result'
            break
        }
        successListener.emit(eventName, payload)
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
  return jobChannel.sendToQueue(jobQ, Buffer.from(JSON.stringify(job)), { persistent: true })
}
export {
  queueJob,
  successListener
}