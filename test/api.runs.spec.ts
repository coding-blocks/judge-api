import * as request from 'request'
import {expect} from 'chai'
import app, {config} from '../src/server'
import {RunRequestBody, RunResponse} from '../src/routes/api/run'
import * as amqp from 'amqplib/callback_api'
import {Channel, Connection} from 'amqplib/callback_api'
import * as http from 'http'
import {Server} from 'http'

let jobQ = 'job_queue'
let successQ = 'success_queue'

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err

  connection.createChannel((err2, channel) => {

    channel.assertQueue(successQ);
    channel.assertQueue(jobQ);
    channel.consume(jobQ, (msg) => {
      let job = JSON.parse(msg.content.toString())
      channel.sendToQueue(successQ, (new Buffer(JSON.stringify(<RunResponse>{
        id: job.id,
        stderr: 'stderr',
        stdout: 'stdout'
      }))))
      channel.ack(msg)
    })


  })
})

let server: Server

describe('/api/runs', () => {
  before((done) => {
    server = http.createServer(app)
    server.listen(config.PORT, done)
  })


  it('POST works with correct submission', (done) => {
    let source = `
    #include <iostream>
    using namespace std;
    int main () {
        char in[10];
        cin>>in;
        cout<<"Hello "<<in;
        return 0;
    }
    `
    let stdin = `World`;

    request.post(`http://localhost:${config.PORT}/api/runs`,
      {
        json: <RunRequestBody> {
          source: (new Buffer(source).toString('base64')),
          lang: 'cpp',
          stdin: (new Buffer(stdin).toString('base64'))
        }
      },
      (err, resp, body) => {
      expect(body.stderr).to.eq('stderr')
      done()
    })
  })

  after((done) => {
    server.close(done)
  })
})

