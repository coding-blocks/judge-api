import {RunResponse} from '../../src/routes/api/run'
import * as amqp from 'amqplib/callback_api'
import {Channel, Connection} from 'amqplib/callback_api'
import app, {config} from '../../src/server'
import * as debug from 'debug'

const log = debug('test:mock:queue')
const jobQ = 'job_queue'
const successQ = 'success_queue'

before((done) => {
  amqp.connect(`amqp://${config.AMQP.USER}:${config.AMQP.PASS}@${config.AMQP.HOST}:${config.AMQP.PORT}`,
    (err, connection) => {
      if (err) throw err

      connection.createChannel((err2, channel) => {

        channel.assertQueue(successQ)
        channel.assertQueue(jobQ)
        channel.consume(jobQ, (msg) => {
          let job = JSON.parse(msg.content.toString())
          log(job)
          let config = JSON.parse((new Buffer(job.source, 'base64')).toString())
          let stdin = JSON.parse((new Buffer(job.stdin, 'base64')).toString())

          setTimeout(() => {
            channel.sendToQueue(successQ, (new Buffer(JSON.stringify(<RunResponse>{
              id: job.id,
              stderr: config.STDERR ? stdin : undefined,
              stdout: config.STDOUT ? stdin : undefined
            }))))
            channel.ack(msg)
          }, config.TIME_TAKEN * 1000)

        })
        done()


      })
    })
})