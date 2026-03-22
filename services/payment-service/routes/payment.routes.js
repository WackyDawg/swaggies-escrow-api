import express from 'express';
import { AuthMiddleware } from '@pocket/shared';
import { PaymentController } from '../controllers/payment.controller.js';


const paymentRouter = express.Router();
const paymentController = new PaymentController();
const authMiddlewareInstance = new AuthMiddleware();

paymentRouter.post('/bill', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => { paymentController.payUtilityBill(req, res) });

export default paymentRouter;