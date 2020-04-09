import * as http from 'http'
import app from '../../src/server'
import { Server } from 'http'
import DB from '../../src/models'
import * as debug from 'debug'
import config = require('../../config')

let server: Server
const log = debug('test:judge:api')

before((done) => {
  DB.sequelize.sync()
    .then(() => {
      log('DB Synced')
      server = http.createServer(app)
      server.listen(config.PORT, () => {
        log('Server started')
        done()
      })
    })
})

after((done) => {
  DB.sequelize.close()
  server.close(done)
})