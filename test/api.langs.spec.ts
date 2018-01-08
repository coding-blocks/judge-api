import * as request from 'request'
import {expect} from 'chai'
import app from '../src/server'
import * as debug from 'debug'
import config = require('../config')


const log = debug('test:judgeapi:langs')

describe('/api/langs', () => {

  it('GET', (done) => {
    request.get(`http://${config.HOST}:${config.PORT}/api/langs`, (err, resp, bodyStr) => {
      log(bodyStr)
      let body = JSON.parse(bodyStr)
      let langs = body.map(l => l.lang_slug)
      expect(langs.indexOf('c')).to.not.eq(-1)
      done()
    })
  })

})


