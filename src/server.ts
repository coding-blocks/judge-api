import express = require('express')
import dbg = require('debug')
import config = require('../config')

const debug = dbg('server')

const app = express()

app.listen(config.DEFAULT_PORT, () => {
  debug(`Server started on http://localhost:${config.DEFAULT_PORT}`)
})