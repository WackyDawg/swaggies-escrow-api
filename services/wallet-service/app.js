import express from 'express';
import client from 'prom-client';
import { httpLogger, errorLogger, logger } from './logging/wallet.logger.js';
import walletRouter from './routes/wallet.route.js';
import escrowRouter from './routes/escrow.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use(errorLogger);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/escrow', escrowRouter);


app.get('/', (req, res) => {
    res.json({
        "Service Name": "wallet-service"
    })
})

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
})

app.use((err, req, res, next) => {
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});


export default app;