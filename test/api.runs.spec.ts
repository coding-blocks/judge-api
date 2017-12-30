import * as request from 'request'
import {expect} from 'chai'
import app, {config} from '../src/server'
import {RunRequestBody, RunResponse} from '../src/routes/api/run'
import * as debug from 'debug'

const log = debug('test:judgeapi:runs')

describe('/api/runs', () => {

  it('POST works with correct submission', (done) => {
    let source = {
      TIME_TAKEN: 2,
      STDERR: false,
      STDOUT: true
    }
    let stdin = 'OUR STDOUT DATA'

    request.post(`http://${config.HOST}:${config.PORT}/api/runs`,
      {
        json: <RunRequestBody> {
          source: (new Buffer(JSON.stringify(source)).toString('base64')),
          lang: 'cpp',
          stdin: (new Buffer(stdin).toString('base64'))
        }
      },
      (err, resp, body) => {
        log(body)
        expect(body.stdout).to.eq(stdin)
        done()
      })
  })

})

