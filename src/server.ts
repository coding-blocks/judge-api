import express = require('express')
import dbg = require('debug')
import config = require('../config')
import * as path from 'path'

const debug = dbg('server')

const app = express()
app.use('/docs', express.static(path.join(__dirname, '../docs')))

app.listen(config.PORT, () => {
  debug(`Server started on http://localhost:${config.PORT}`)
})