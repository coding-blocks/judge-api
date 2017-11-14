import * as request from 'request'
import {expect} from 'chai'
import app, {config} from '../src/server'
import {Http2Server} from 'http2'
import {RunRequestBody} from '../src/routes/api/run'

let server: Http2Server

describe('/api/runs', () => {
  before((done) => {
    server = app.listen(config.PORT, done)
  })


  it('POST', (done) => {
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
          lang: "cpp",
          stdin: (new Buffer(stdin).toString('base64'))
        }
      },
      (err, resp, bodyStr) => {
      let body = JSON.parse(bodyStr)
      expect(body[0].lang_slug).to.eq('c')
      done()
    })
  })

  after((done) => {
    server.close(done)
  })
})

