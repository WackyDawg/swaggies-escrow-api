import notificationClient from '../../clients/notification-grpc.client.js'


export const sendVerificationEmail = async (email, verificationToken) => {
    return new Promise((resolve, reject) => {
        const payload = {
            to: email,
            subject: 'Verify your account',
            template: 'verification',
            variables: { verificationCode: verificationToken }
        };

        notificationClient.SendEmail(payload, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

export const sendWelcomeEmail = async (email, name) => {
    return new Promise((resolve, reject) => {
        const payload = {
            to: email,
            subject: 'Welcome to Swaggies',
            template: 'welcome',
            variables: { name: name }
        };

        notificationClient.SendEmail(payload, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    return new Promise((resolve, reject) => {
        const payload = {
            to: email,
            subject: 'Reset password',
            template: 'password_reset',
            variables: { resetURL: resetURL }
        };

        notificationClient.SendEmail(payload, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

export const sendResetSuccessEmail = async (email) => {
    return new Promise((resolve, reject) => {
        const payload = {
            to: email,
            subject: 'Password reset success',
            template: 'password_reset_success'
        };

        notificationClient.SendEmail(payload, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

export const sendEmailChangedEmail = async (oldEmail, newEmail) => {
    return new Promise((resolve, reject) => {
        const payload = {
            to: newEmail,
            subject: 'Email Changed',
            template: 'email_changed',
            variables: { oldEmail: oldEmail, newEmail: newEmail }
        };

        notificationClient.SendEmail(payload, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

export const sendPasswordChangedEmail = async (email) => {
    return new Promise((resolve, reject) => {
        const payload = {
            to: email,
            subject: 'Password Changed',
            template: 'password_changed'
        };

        notificationClient.SendEmail(payload, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}