import express = require('express')
import dbg = require('debug')
import path = require ('path')
import apiRoute from './routes/api'

const debug = dbg('server:main')

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/docs', express.static(path.join(__dirname, '../docs')))

app.use('/api', apiRoute)

export default app