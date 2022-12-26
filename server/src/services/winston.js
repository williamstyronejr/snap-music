const winston = require('winston');

const { SERVERLESS } = process.env;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'warn' : 'warn';
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const fileTransport = new winston.transports.File({
  level: 'error',
  filename: '../app.log',
});

const transports = [new winston.transports.Console()];
if (SERVERLESS === 'true') transports.push(fileTransport);

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

module.exports = logger;
