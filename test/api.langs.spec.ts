import * as request from 'request'
import {expect} from 'chai'
import app, {config} from '../src/server'
import * as http from 'http'
import {Server} from 'http'

let server: Server


describe('/api/langs', () => {
  before((done) => {
    server = http.createServer(app)
    server.listen(config.PORT, done)  })

  it('GET', (done) => {
    request.get(`http://${config.HOST}:${config.PORT}/api/langs`, (err, resp, bodyStr) => {
      let body = JSON.parse(bodyStr)
      expect(body[0].lang_slug).to.eq('c')
      done()
    })
  })

  after((done) => {
    server.close(done)
  })
})


