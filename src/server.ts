import express = require('express')
import dbg = require('debug')
import config = require('../config')
import * as path from 'path'
import apiRoute from './routes/api'

const debug = dbg('server')

const app = express()
app.use('/docs', express.static(path.join(__dirname, '../docs')))

app.use('/api', apiRoute)

app.listen(config.PORT, () => {
  debug(`Server started on http://localhost:${config.PORT}`)
})