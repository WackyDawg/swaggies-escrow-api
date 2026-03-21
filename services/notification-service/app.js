import express from 'express';
import dotenv from 'dotenv';
import client from 'prom-client';
import notificationRoutes from './routes/notification.routes.js';

dotenv.config();
 
const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 })


app.use(express.json());
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.json({
        "Service Name": "Notification-service"
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

export default app;