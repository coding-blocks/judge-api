const
  Winston = require ('winston'),
  ExpressWinston = require ('express-winston'),
  WinstonGraylog2 = require ('winston-graylog2')
;

const GRAYLOG_HOST = process.env.GRAYLOG_HOST || 'graylog.cb.lk',
  GRAYLOG_PORT = process.env.GRAYLOG_PORT || 12201,
  NODE_ENV = process.env.NODE_ENV || 'development'
;

const GrayLogger = new WinstonGraylog2 ({
  name: 'JudgeApi',
  level: 'debug',
  silent: false,
  handleExceptions: false,

  prelog: function (msg) {
    return msg.trim ()
  },

  graylog: {
    servers: [{ host: GRAYLOG_HOST, port: GRAYLOG_PORT }],
    facility: 'JudgeApi',
    bufferSize: 1400
  },

  staticMeta: {
    env: NODE_ENV
  }
})

const ExpressLogger = ExpressWinston.logger ({
  transports: [GrayLogger],
  meta: true,
  format: Winston.format.combine(
    Winston.format.colorize(),
    Winston.format.json(),
    Winston.format.metadata(),
  ),
  msg: "HTTP {{req.method}} {{req.url}}",
  requestWhitelist: ['headers', 'query', 'body'],
  responseWhitelist: ['body'],
  expressFormat: true,
  colorize: false
})

const Logger = Winston.createLogger({
  exitOnError: false,
  transports: [GrayLogger]
});

module.exports = {
  Logger,
  ExpressLogger
}
