import * as request from 'request'
import { expect } from 'chai'
import app from '../src/server'
import * as debug from 'debug'
import config = require('../config')
import { CoreOptions } from 'request'


const log = debug('test:judgeapi:runs')

const reqOptions: CoreOptions = {
  baseUrl: `http://${config.HOST}:${config.PORT}/`,
  headers: {
    'Authorization': 'Bearer 7718330d2794406c980bdbded6c9dc1d'
  }
}

describe('/api/runs', () => {

  it('POST stdout with correct submission', (done) => {
    let source = {
      TIME_TAKEN: 2,
      STDERR: false,
      STDOUT: true
    }
    let stdin = 'OUR STDOUT DATA'

    request.post(`api/runs`,
      {
        baseUrl: reqOptions.baseUrl,
        headers: reqOptions.headers,
        json: {
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

  it('POST stderr with incorrect submission', (done) => {
    let source = {
      TIME_TAKEN: 2,
      STDERR: true,
      STDOUT: false
    }
    let stdin = 'OUR STDOUT DATA'

    request.post(`api/runs`,
      {
        baseUrl: reqOptions.baseUrl,
        headers: reqOptions.headers,
        json: {
          source: (new Buffer(JSON.stringify(source)).toString('base64')),
          lang: 'cpp',
          stdin: (new Buffer(stdin).toString('base64'))
        }
      },
      (err, resp, body) => {
        log(body)
        expect(body.stderr).to.eq(stdin)
        done()
      })
  })

  it('POST timeout with > 10s submission', (done) => {
    let source = {
      TIME_TAKEN: 11,
      STDERR: true,
      STDOUT: false
    }
    let stdin = 'OUR STDOUT DATA'

    request.post(`api/runs`,
      {
        baseUrl: reqOptions.baseUrl,
        headers: reqOptions.headers,
        json: {
          source: (new Buffer(JSON.stringify(source)).toString('base64')),
          lang: 'cpp',
          stdin: (new Buffer(stdin).toString('base64'))
        }
      },
      (err, resp, body) => {
        log(body)
        expect(body.code).to.eq(408)
        done()
      })
  })

})

