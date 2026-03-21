import { walletClient } from '../clients/wallet.client.js'
import httpStatus from 'http-status';


export class WebhookController {
    constructor(Wallet = walletClient) {
        this.Wallet = new Wallet()
    }

    async flwWebhook(req, res) {
        try {
            const webhookData = req.body;
            const result = await this.Wallet.handleFlwWebhook(webhookData);
            return {
                statusCode: httpStatus.OK,
                success: true,
                message: "Webhook processed successfully",
                data: result
            };
        } catch (error) {
            return {
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                success: false,
                message: error.message || error,
                data: null
            };
        }
    }

    async monnifyWebhook(req, res) {
        try {
            const webhookData = req.body;
            const result = await this.Wallet.handleMonnifyWebhook(webhookData);
            return {
                statusCode: httpStatus.OK,
                success: true,
                message: "Webhook processed successfully",
                data: result
            };
        } catch (error) {
            return {
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                success: false,
                message: error.message || error,
                data: null
            };
        }
    }
}