import express from 'express';
import dotenv from 'dotenv';
import client from 'prom-client';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from './swagger.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import walletRouter from './routes/wallet.routes.js';
import webhookRouter from './routes/webhook.routes.js';
import { httpLogger, errorLogger, logger } from './logging/gateway.logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './.env' });

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
}));

app.use((req, res, next) => {
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customSiteTitle: 'Swaggies API Gateway',
    customJs: 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js',
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css',
}));

app.use(httpLogger);
app.use('/api/v1/auth', authRoutes);  
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/webhooks', webhookRouter);


app.get('/invoice', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

app.get('/tracking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tracker.html'));
});

app.get('/pay-invoice', (req, res) => {
    res.redirect(`/invoice?${new URLSearchParams(req.query).toString()}`);
});

app.get('/health', async (req, res) => {
    const healthStatus = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        service: 'api-gateway'
    };
    res.status(200).json(healthStatus);
});

app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'api-gateway' });
});

app.get('/', (req, res) => {
    res.json({
        message: "Swaggies API v1"
    })
})

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
})

app.use((req, res, next) => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.url
    });
    res.status(404).json({
        error: 'Route not found',
        path: req.url
    });
});


export default app;