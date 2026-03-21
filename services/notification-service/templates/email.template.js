export const VERIFICATION_EMAIL_TEMPLATE = `
Email Verification

Hello,

Thank you for joining Swaggies! Your verification code is:

{verificationCode}

Enter this code to complete your registration. This code is valid for 15 minutes.

If you didn't create an account, please ignore this email.

Best regards,
Swaggies Team
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
Password Reset Successful

Hello,

Your password has been successfully reset.

If you did not initiate this password reset, please contact our support team immediately.

For your safety, please:
- Use a strong, unique password
- Enable two-factor authentication
- Avoid reusing passwords across platforms

Thanks for helping us keep your account secure.

Best regards,
Swaggies Team
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
Password Reset Request

Hello,

We received a request to reset your password. If you didn't make this request, please ignore this email.

To reset your password, click the link below:
{resetURL}

This link will expire in 1 hour for security reasons.

Best regards,
Swaggies Team
`;

export const WELCOME_EMAIL_TEMPLATE = `
Welcome to Swaggies!

Hi there,

Welcome to Swaggies - your personal finance management solution!

Here's what you can do:
- Track your expenses and income
- Set and monitor budgets
- View detailed financial reports
- Manage multiple accounts

Get started: {appURL}

We're here to help you manage your finances better. If you need any help, our support team is ready to assist.

Welcome aboard!
Swaggies Team
`;

export const EMAIL_CHANGED_TEMPLATE = `
Email Address Changed

Hello,

Your Swaggies account email address has been changed.

Previous email: {oldEmail}
New email: {newEmail}

If this was you, no further action is needed.

If you didn't make this change, please contact our support team immediately.

Contact Support: {supportURL}

Best regards,
Swaggies Team
`;

export const PASSWORD_CHANGED_TEMPLATE = `
Password Changed

Hello,

Your Swaggies account password was successfully changed.

If you made this change, you're all set.

If you did not request this change, your account may be at risk. Please reset your password immediately and contact our support team.

Contact Support: {supportURL}

Best regards,
Swaggies Team
`;

export const MILESTONE_REVIEW_TEMPLATE = `
Milestone Review Request

Hello,

A milestone for your project has been submitted for review.

Project Details:
- Milestone: {milestoneTitle}
- Freelancer: {freelancerName} ({freelancerEmail})

Please log in to your dashboard, or use your secure tracking link below to review the work and release the funds if everything is satisfactory.

Tracking Link: {trackingLink}

Escrow ID: {escrowId}
Milestone ID: {milestoneId}

Best regards,
Swaggies Team
`;

export const ESCROW_FUNDED_TEMPLATE = `
Escrow Funded Successfully

Hello,

The funds for your project "{projectTitle}" have been successfully locked in escrow.

You can now track the progress and approve milestones using your secure tracking link below:

{trackingLink}

IMPORTANT: Please do not share this link with anyone, including your freelancer. This link is your secure way to release funds only when you are satisfied with the work.

Project Summary:
- Total Amount: {totalAmount}
- Freelancer: {freelancerName}

Best regards,
Swaggies Team
`;

export const ESCROW_OTP_TEMPLATE = `
Verification Code

Hello,

A verification code was requested to authorize the release of funds for your project "{projectTitle}".

Your 6-digit verification code is:

{otpCode}

Please enter this code on the tracking page to confirm the release. If you did not request this code, please ignore this email.

Best regards,
Swaggies Team
`;

export const MILESTONE_REJECTED_TEMPLATE = `
Milestone Disputed: {projectTitle}

Hello,

A milestone for your project "{projectTitle}" has been disputed or rejected by the client.

Milestone: {milestoneTitle}
Rejection Reason: {rejectionReason}

Please review the feedback and reach out to the client at {clientEmail} to resolve the issue or provide a revised submission.

Best regards,
Swaggies Team
`;