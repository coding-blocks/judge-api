exports = module.exports = {
  RUN: {
    TIMEOUT: process.env.RUN_TIMEOUT || 10000,
  },

  // Domain/Host on which judge-api is hosted
  HOST: process.env.JUDGEAPI_HOST || 'localhost',
  // Port on which this app will run
  PORT: process.env.JUDGEAPI_PORT || 3737,

  // Database config for a postgresql db (docker based or native)
  DB: {
    DATABASE: process.env.DB_NAME || 'judgeapi',
    USERNAME: process.env.DB_USER|| 'judgeapi',
    PASSWORD: process.env.DB_PASS|| 'judgeapi',
    HOST: process.env.DB_HOST || 'localhost'
  },

  // Rabbit MQ queue - the other end of which is attached
  // to judge-taskmaster
  AMQP: {
    USER: process.env.AMQP_USER || 'codingblocks',
    PASS: process.env.AMQP_PASS || 'codingblocks',
    HOST: process.env.AMQP_HOST || 'localhost',
    PORT: process.env.AMQP_PORT || 5672
  },

  S3: {
    endpoint: process.env.S3_ENDPOINT || 'localhost',
    port: process.env.S3_PORT || 9000,
    ssl: process.env.S3_SSL || false,
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    bucket: process.env.S3_BUCKET || 'judge-submissions',
    region: process.env.S3_REGION || 'us-east-1'
  }
}