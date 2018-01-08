import app from './server'
import config = require('../config')
import * as debug from 'debug'
import {db} from './db/models'

const log = debug('judge:api')

db.sync({})
  .then(() => {
    log('Database Synced')
    app.listen(config.PORT, () => {
      log(`Server started on http://localhost:${config.PORT}`)
    })
  })
  .catch((err) => console.error(err))

