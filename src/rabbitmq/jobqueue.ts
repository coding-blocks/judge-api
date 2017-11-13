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

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err;
  else {
    connection.createChannel((err, channel) =>{
      channel.assertQueue(jobQ, {durable: true})
      jobChannel = channel
    })
  }
})

function queueJob(job: any) {
  return jobChannel.sendToQueue(jobQ, new Buffer(JSON.stringify(job)), {persistent: true})
}

export {
  queueJob
}