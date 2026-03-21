import transporter, { MAILPROV, _gmail_sender, _mailtrap_sender, _resend_sender } from '../configs/config.mailer.js';
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, WELCOME_EMAIL_TEMPLATE, EMAIL_CHANGED_TEMPLATE, PASSWORD_CHANGED_TEMPLATE, MILESTONE_REVIEW_TEMPLATE, MILESTONE_REJECTED_TEMPLATE, ESCROW_FUNDED_TEMPLATE, ESCROW_OTP_TEMPLATE } from '../templates/email.template.js';
import { logger } from "../logging/notification.logger.js";


function applyTemplateVariables(template, variables) {
    let output = template;

    for (const key in variables) {
        const placeholder = new RegExp(`{${key}}`, "g");
        output = output.replace(placeholder, variables[key]);
    }

    return output;
}

export class NotificationService {
    async sendEmail(to, subject, template, variables = {}) {
        try {
            const TEMPLATE_MAP = {
                verification: VERIFICATION_EMAIL_TEMPLATE,
                password_reset: PASSWORD_RESET_REQUEST_TEMPLATE,
                password_reset_success: PASSWORD_RESET_SUCCESS_TEMPLATE,
                welcome: WELCOME_EMAIL_TEMPLATE,
                email_changed: EMAIL_CHANGED_TEMPLATE,
                password_changed: PASSWORD_CHANGED_TEMPLATE,
                milestone_review: MILESTONE_REVIEW_TEMPLATE,
                milestone_rejected: MILESTONE_REJECTED_TEMPLATE,
                escrow_funded: ESCROW_FUNDED_TEMPLATE,
                escrow_otp: ESCROW_OTP_TEMPLATE,
            };

            const rawTemplate = TEMPLATE_MAP[template] || template;
            const text = applyTemplateVariables(rawTemplate, variables);
            // Simple text-to-html conversion for better readability in HTML clients
            const html = text.replace(/\n/g, '<br/>');

            const client = transporter();
            if (!client) throw new Error("No email provider configured.");

            let response;

            if (MAILPROV === 'gmail') {
                response = await client.sendMail({
                    from: `"${_gmail_sender.name}" <${_gmail_sender.email}>`,
                    to,
                    subject,
                    text,
                    html
                });
            }

            else if (MAILPROV === 'mailtrap') {
                response = await client.send({
                    from: _mailtrap_sender,
                    to: [{ email: to }],
                    subject,
                    text,
                    html
                });
            }

            else if (MAILPROV === 'resend') {
                const { data, error } = await client.emails.send({
                    from: `${_resend_sender.name} <${_resend_sender.email}>`,
                    to,
                    subject,
                    text,
                    html,
                });
                if (error) {
                    throw new Error(`Resend Error: ${error.message || JSON.stringify(error)}`);
                }
                response = data;
            }

            console.log(`[Notification-Service] Email sent successfully to ${to} using ${MAILPROV}`);

            return { success: true, message: "Email sent successfully." };
        } catch (error) {
            console.error(`[Notification-Error] [${MAILPROV}]`, error);
            logger.error("Error sending email:", error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}
