import * as Sequelize from 'sequelize'
import * as path from 'path'
import * as fs from 'fs'
import config = require('../../config')
import dbg = require('debug')

const basename  = path.basename(module.filename);
const db: any = {}
const dbModel = {}
const debug = dbg('judge:models')

const sequelize = new Sequelize(config.DB.DATABASE, config.DB.USERNAME, config.DB.PASSWORD, {
  dialect: 'postgres',
  host: config.DB.HOST,
  logging: debug,
  pool: {
    max: 10,
    idle: 10000
  }
})

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (['.js', '.ts'].includes(file.slice(-3)));
  })
  .forEach(function(file) {
    var model = require(path.join(__dirname, file)).define(sequelize);
    dbModel[model.name] = require(path.join(__dirname, file))
    db[model.name] = model;
  });

Object.keys(dbModel).forEach(function(modelName) {
  if(dbModel[modelName].associate){
    dbModel[modelName].associate(db)
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db
