import app from './app.js';
import { connectDB } from './utils/db.util.js';
import { logger } from './logging/user.logger.js';
import './grpc-server.js';

const PORT = process.env.PORT || 3002;

const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            logger.info(`User-service running on port ${PORT}`);
            console.log(`User service running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();