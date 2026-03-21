import winston from 'winston';
import expressWinston from 'express-winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        return log;
    })
);

const logsDir = path.join(__dirname, '../logs');

export const appLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: process.env.SERVICE_NAME || 'wallet-service' },
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
            level: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
        }),

        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ],
    exitOnError: false
});

export const httpLogger = expressWinston.logger({
    winstonInstance: appLogger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: false,
    colorize: false,
    ignoreRoute: (req, res) => {
        return req.url === '/health' || req.url === '/ping';
    },

    skip: (req, res) => {
        if (process.env.NODE_ENV === 'production') {
            return res.statusCode < 400;
        }
        return false;
    },

    statusLevels: true,
    level: (req, res) => {
        let level = 'info';
        if (res.statusCode >= 100) level = 'info';
        if (res.statusCode >= 400) level = 'warn';
        if (res.statusCode >= 500) level = 'error';
        return level;
    },
    requestWhitelist: [
        'url',
        'method',
        'httpVersion',
        'originalUrl',
        'query'
    ],
    responseWhitelist: [
        'statusCode',
        'responseTime'
    ],
    headerBlacklist: ['authorization', 'cookie']
});

export const errorLogger = expressWinston.errorLogger({
    winstonInstance: appLogger,
    meta: true,
    msg: 'Error: {{err.message}}',
    blacklistedMetaFields: ['trace', 'authorization', 'cookie']
});

export const logger = {
    info: (message, meta = {}) => appLogger.info(message, meta),
    warn: (message, meta = {}) => appLogger.warn(message, meta),
    error: (message, meta = {}) => appLogger.error(message, meta),
    debug: (message, meta = {}) => appLogger.debug(message, meta),
    http: (message, meta = {}) => appLogger.http(message, meta)
};

export const morganStream = {
    write: (message) => {
        appLogger.http(message.trim());
    }
};