import app from './server'
import * as debug from 'debug'
import DB from 'models'

const config = require('../config')
const log = debug('judge:api')

DB.sequelize.sync({})
  .then(() => {
    log('Database Synced')
    app.listen(config.PORT, () => {
      log(`Server started on http://localhost:${config.PORT}`)
    })
  })
  .catch((err) => console.error(err))

