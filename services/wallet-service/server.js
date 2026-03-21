import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './utils/db.utils.js';
import { logger } from './logging/wallet.logger.js';
// import { initMonnify } from './utils/monnify.auth.js'
import './grpc-server.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 3003;

const startServer = async () => {
    try {
        await connectDB();
        //await initMonnify();

        app.listen(PORT, () => {
            logger.info(`[Wallet-Service] running on port ${PORT}`);
            console.log(`[Wallet-Service] running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();