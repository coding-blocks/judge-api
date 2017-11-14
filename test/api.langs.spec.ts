import * as request from 'request'
import {expect} from 'chai'
import app, {config} from '../src/server'
import {Http2Server} from 'http2'

let server: Http2Server



describe('/api/langs', () => {
  before((done) => {
    server = app.listen(config.PORT, done)
  })

  it('GET', (done) => {
    request.get(`http://localhost:${config.PORT}/api/langs`, (err, resp, bodyStr) => {
      let body = JSON.parse(bodyStr)
      expect(body[0].lang_slug).to.eq('c')
      done()
    })
  })

  after((done) => {
    server.close(done)
  })
})


