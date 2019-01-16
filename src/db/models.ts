import * as Sequelize from 'sequelize'
import config = require('../../config')
import dbg = require('debug')
import {DefineAttributes} from 'sequelize'

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
}, {
  timestamps: false
})
export type LangsAttributes = { lang_slug: string, lang_name:string, lang_version: string }

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
  results: Sequelize.ARRAY(Sequelize.INTEGER),
  outputs: Sequelize.ARRAY(Sequelize.STRING)
}, {
  paranoid: true, // We do not want to lose any submission data
  timestamps: false // Start and end times are already logged
})
export type SubmissionAttributes = {
  id?: number
  lang: string
  start_time: Date
  end_time?: Date
  results?: Array<number>
  outputs?: Array<string>
}

const ApiKeys = db.define('apikeys', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  key: {
    type: Sequelize.STRING(32),
    unique: true,
    allowNull: false
  },
  whitelist_domains: {
    type: Sequelize.ARRAY(Sequelize.STRING)
  },
  whitelist_ips: {
    type: Sequelize.ARRAY(Sequelize.STRING)
  }
})

export type ApiKeyAttrs  = {
  id: number,
  key: string,
  whitelist_domains: string[] | undefined
  whitelist_ips: string[] | undefined
}

Submissions.belongsTo(ApiKeys)

export {
  Langs, Submissions, ApiKeys, db
}