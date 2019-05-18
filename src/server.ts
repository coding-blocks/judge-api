import express = require('express')
import dbg = require('debug')
import path = require ('path')
import Raven = require('raven')
import apiRoute from './routes/api'

const DSN = process.env.DSN
const debug = dbg('server:main')
const app = express()

Raven.config(DSN).install()
app.use(Raven.requestHandler())
app.use(Raven.errorHandler())

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/docs', express.static(path.join(__dirname, '../docs')))

app.use('/api', apiRoute)

export default app