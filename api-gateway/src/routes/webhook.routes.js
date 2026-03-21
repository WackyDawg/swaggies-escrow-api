import express from "express";
import { WebhookController } from "../controllers/webhook.controller.js";

const webhookControllerInstance = new WebhookController();
const webhookRouter = express.Router();

webhookRouter.post('/flw-webhook', async (req, res) => {
    try {
        const result = await webhookControllerInstance.flwWebhook(req, res);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(error.statusCode).json(error);
    }
});

webhookRouter.post('/monnify-webhook', async (req, res) => {
    try {
        const result = await webhookControllerInstance.monnifyWebhook(req, res);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(error.statusCode).json(error);
    }
});

export default webhookRouter;