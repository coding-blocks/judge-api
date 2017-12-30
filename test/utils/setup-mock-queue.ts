import {RunResponse} from '../../src/routes/api/run'
import * as amqp from 'amqplib/callback_api'
import {Channel, Connection} from 'amqplib/callback_api'
import app, {config} from '../../src/server'

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
          channel.sendToQueue(successQ, (new Buffer(JSON.stringify(<RunResponse>{
            id: job.id,
            stderr: 'stderr',
            stdout: 'stdout'
          }))))
          channel.ack(msg)
        })
        done()


      })
    })
})