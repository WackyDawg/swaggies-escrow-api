import app from './app.js';
import { logger } from './logging/gateway.logger.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
       
        app.listen(PORT, () => {
            logger.info(`[Api-gateway] running on port ${PORT}`);
            console.log(`[Api-gateway] running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();