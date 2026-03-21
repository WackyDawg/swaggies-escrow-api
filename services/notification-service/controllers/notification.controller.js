import { NotificationService } from '../services/notification.service.js';

const notificationServiceInstance = new NotificationService();

export class NotificationController {
    constructor(notificationService = notificationServiceInstance) {
        this.notificationService = notificationService;
    }

    async sendEmail(req, res) {
        try {
            const { to, subject, template, variables = {} } = req.body;

            if (!to || !subject || !template) {
                return res.status(400).json({ message: 'Missing required fields: to, subject, or template.' });
            }

            const result = await this.notificationService.sendEmail(to, subject, template, variables);
            res.status(200).json(result);
        } catch (error) {
            console.error('Failed to send email:', error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message || 'An internal server error occurred' });
        }
    }

    async sendSms(req, res) {
        try {
            const { to, body } = req.body;
            const result = await this.notificationService.sendSms(to, body);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}