import {config} from '../../src/server'
import * as http from 'http'
import app from '../../src/server'
import {Server} from 'http'
import {db} from '../../src/db/models'
import * as debug from 'debug'

let server: Server
const log = debug('test:judge:api')

before((done) => {
  db.sync()
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
  db.close()
  server.close(done)
})