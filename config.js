exports = module.exports = {
  RUN: {
    TIMEOUT: process.env.RUN_TIMOUT || 10000,
  },
  HOST: process.env.JUDGEAPI_HOST || 'localhost',
  PORT: process.env.JUDGEAPI_PORT || 3737,
  DB: {
    DATABASE: process.env.DB_NAME || 'judgeapi',
    USERNAME: process.env.DB_USER|| 'judgeapi',
    PASSWORD: process.env.DB_PASS|| 'judgeapi',
    HOST: process.env.DB_HOST || 'localhost'
  },
  AMQP: {
    USER: process.env.AMQP_USER || 'codingblocks',
    PASS: process.env.AMQP_PASS || 'codingblocks',
    HOST: process.env.AMQP_HOST || 'localhost',
    PORT: process.env.AMQP_PORT || 5672
  }
}