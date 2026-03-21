import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/auth.routes.js';
import { httpLogger, errorLogger, logger } from './logging/auth.logger.js';
import mongoose from "mongoose";
import client from 'prom-client';


dotenv.config({ path: './.env' });

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(httpLogger);

app.get('/health', async (req, res) => {
    const healthStatus = {
        status: 'ok',
        database: 'unavailable',
        uptime: process.uptime(),
        timestamp: Date.now()
    };

    try {
        await mongoose.connection.db.admin().ping();
        healthStatus.database = 'available';
    } catch (error) {
        console.error('Database connection failed:', error.message);
        healthStatus.status = 'degraded';
        healthStatus.database = 'error';
        return res.status(503).json(healthStatus);
    }

    res.status(200).json(healthStatus);
});

app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'account-service' });
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
})

app.use('/api/v1/users', userRoutes);

app.use((req, res) => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.url
    });
    res.status(404).json({
        error: 'Route not found',
        path: req.url
    });
});

app.use(errorLogger);

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