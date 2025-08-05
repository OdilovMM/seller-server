const {createLogger, format, transports} = require('winston');
const {combine, timestamp, printf, colorize} = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const env = process.env.NODE_ENV || 'development';

const logFormat = printf(({level, message, timestamp})=> {
    return `${timestamp} [${level}] : ${message}`
})

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        env === 'development' ? colorize() : json(),
        env === 'development' ? logFormat : json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ]
})

logger.add(new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
}));

module.exports = logger;