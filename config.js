const secrets = require('./secrets.json')
exports = module.exports = {
  RUN: {
    TIMEOUT: 10000,
  },
  PORT: process.env.PORT || 3737,
  DB: {
    DATABASE: secrets.DB_DATABASE,
    USERNAME: secrets.DB_USERNAME,
    PASSWORD: secrets.DB_PASSWORD,
    HOST: process.env.DB_HOST || secrets.DB_HOST
  },
  RABBITMQ: {
    HOST: process.env.RABBITMQ_HOST || 'localhost'
  }
}