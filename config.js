const secrets = require('./secrets.json')
exports = module.exports = {
  PORT: process.env.PORT || 3737,
  DB: {
    DATABASE: secrets.DB_DATABASE,
    USERNAME: secrets.DB_USERNAME,
    PASSWORD: secrets.DB_PASSWORD,
    HOST: secrets.DB_HOST
  }
}