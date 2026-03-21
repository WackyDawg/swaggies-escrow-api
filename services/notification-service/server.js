import app from './app.js';
import './grpc-server.js';
import { logger } from './logging/notification.logger.js';


const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    logger.info(`[${process.env.SERVICE_NAME || 'notification-service'}] running on http://127.0.0.1:${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
});