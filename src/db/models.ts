import * as Sequelize from 'sequelize'
import config = require('../../config')
import dbg = require('debug')

const debug = dbg('judge:db')

const db = new Sequelize(config.DB.DATABASE, config.DB.USERNAME, config.DB.PASSWORD, {
  dialect: 'postgres',
  host: config.DB.HOST,
  logging: debug,
  pool: {
    max: 10,
    idle: 10000
  }
})

const Langs = db.define('langs', {
  lang_slug: {
    type: Sequelize.STRING(10),
    primaryKey: true
  },
  lang_name: Sequelize.STRING(10),
  lang_version: Sequelize.STRING(5)
})

const Submissions = db.define('submissions', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  lang: {
    type: Sequelize.STRING(10),
    references: {
      model: Langs,
      key: 'lang_slug'
    }
  },
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  results: Sequelize.ARRAY(Sequelize.INTEGER)
})
export type SubmissionAttributes = {
  id?: number
  lang: string
  start_time: Date
  end_time?: Date
  results?: Array<number>
}

const ApiKeys = db.define('apikeys', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  key: Sequelize.STRING(64)
})

Submissions.belongsTo(ApiKeys)

db.sync({})
  .then(() => debug('Database Synced'))
  .catch((err) => console.error(err))

export {
  Langs, Submissions, ApiKeys
}