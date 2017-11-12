import * as Sequelize from 'sequelize'
import config = require('../../config')
import dbg = require('debug')

const debug = dbg('judge:db')

const DataTypes = (<any>Sequelize).DataTypes

const db = new Sequelize(config.DB.DATABASE, config.DB.USERNAME, config.DB.PASSWORD, {
  logging: debug
})

const Langs = db.define('langs', {
  lang_slug: {
    type: DataTypes.String(10),
    primaryKey: true
  },
  lang_name: DataTypes.STRING,
  lang_version: DataTypes.STRING
})

const Submissions = db.define('submissions', {
  start_time: DataTypes.DATE,
  end_time: DataTypes.DATE,
  results: DataTypes.ARRAY(DataTypes.NUMBER)
})

const ApiKeys = db.define('apikeys', {
  key: DataTypes
})

Submissions.belongsTo(ApiKeys)
Submissions.belongsTo(Langs)

export {
  Langs, Submissions, ApiKeys
}