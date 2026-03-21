import express from 'express';
import { AuthMiddleware } from '@pocket/shared';
import walletController from "../controllers/wallet.controller.js";
import { handleMonnifyWebhook } from '../controllers/monnify.webhook.controller.js';
import { handleFlutterwaveWebhook } from '../controllers/flw.webhook.controller.js';

const walletControllerInstance = new walletController();
const authMiddlewareInstance = new AuthMiddleware();
const walletRouter = express.Router();

walletRouter.post('/wallet-create', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => { walletControllerInstance.createWallet(req, res) });
walletRouter.get('/balance/:accountNumber', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => { walletControllerInstance.getWalletBal(req, res) });
walletRouter.get('/wallet-transactions/:accountNumber', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => { walletControllerInstance.getWalletTrans(req, res) });
walletRouter.get('/wallet', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => { walletControllerInstance.getWallet(req, res) });
walletRouter.post('/initiate-transfer', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => { walletControllerInstance.initiateTransfer(req, res) }); 
walletRouter.post('/webhooks-monnify', (req, res) => { handleMonnifyWebhook(req, res) });
walletRouter.post('/webhooks-flutterwave', (req, res) => { handleFlutterwaveWebhook(req, res) });
walletRouter.post('/vault/convert', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => { walletControllerInstance.convertToUsd(req, res) });

export default walletRouter;