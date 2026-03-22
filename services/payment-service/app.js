import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './utils/db.utils.js';
import { logger } from './logging/payment.logger.js';
import './grpc-server.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 3005;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            logger.info(`[Payment-Service] running on port ${PORT}`);
            console.log(`[Payment-Service] running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();