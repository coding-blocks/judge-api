import * as request from 'request'
import {expect} from 'chai'
import app from '../src/server'
import * as debug from 'debug'
import config = require('../config')
import {CoreOptions} from 'request'


const log = debug('test:judgeapi:langs')
const reqOptions: CoreOptions = {
  baseUrl: `http://${config.HOST}:${config.PORT}/`,
  headers: {
    'Authorization': 'Bearer 7718330d2794406c980bdbded6c9dc1d'
  }
}

describe('/api/langs', () => {

  it('GET', (done) => {
    request.get(`api/langs`, reqOptions, (err, resp, bodyStr) => {
      log(bodyStr)
      let body = JSON.parse(bodyStr)
      let langs = body.map(l => l.lang_slug)
      expect(langs.indexOf('c')).to.not.eq(-1)
      done()
    })
  })

})


