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
    const source = `
      #include <iostream>
      using namespace std;
      int main () {
          char in[20];
          cin>>in;
          cout<<in;
          return 0;
      }`

    let stdin = 'OURSTDOUTDATA'

    request.post(`api/runs`,
      {
        baseUrl: reqOptions.baseUrl,
        headers: reqOptions.headers,
        json: {
          source: (new Buffer(source).toString('base64')),
          lang: 'cpp',
          stdin: (new Buffer(stdin).toString('base64'))
        }
      },
      (err, resp, body) => {
        log(body)
        expect(new Buffer(body.stdout, 'base64').toString()).to.eq(stdin)
        done()
      })
  })
})

