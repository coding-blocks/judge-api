import * as request from 'request'
import {expect} from 'chai'
import app, {config} from '../src/server'
import {RunRequestBody, RunResponse} from '../src/routes/api/run'
import * as debug from 'debug'

const log = debug('test:judgeapi:runs')

describe('/api/runs', () => {

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
    let stdin = `World`

    request.post(`http://${config.HOST}:${config.PORT}/api/runs`,
      {
        json: <RunRequestBody> {
          source: (new Buffer(source).toString('base64')),
          lang: 'cpp',
          stdin: (new Buffer(stdin).toString('base64'))
        }
      },
      (err, resp, body) => {
        log(body)
        expect(body.stdout).to.eq('SGVsbG8gV29ybGQ=')
        done()
      })
  })

})

