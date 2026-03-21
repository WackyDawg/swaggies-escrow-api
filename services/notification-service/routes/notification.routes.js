import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';

const router = Router();
const notificationController = new NotificationController();

router.post('/send-email', notificationController.sendEmail.bind(notificationController));
router.post('/send-sms', notificationController.sendSms.bind(notificationController));

export default router;