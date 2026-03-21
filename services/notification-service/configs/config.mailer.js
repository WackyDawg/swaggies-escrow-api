import nodemailer from 'nodemailer';
import { MailtrapClient } from "mailtrap";
import { Resend } from 'resend';

const TOKEN = process.env.MAILTRAP_TOKEN || 'Default-token';
const RESENDTOKEN = process.env.RESEND_TOKEN || 'Default-token';

export const MAILPROV = process.env.MAIL_PROVIDER || 'gmail';

export let gmailTransporter = null;
export let mailtrapClient = null;
export let resendClient = null;

if (MAILPROV === 'gmail') {
  gmailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER || 'noreply.streamio@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'ecsi gtzl crkc dwbq'
    }
  });
} 
else if (MAILPROV === 'mailtrap') {
  mailtrapClient = new MailtrapClient({
    token: TOKEN,
  });
} 
else if (MAILPROV === 'resend') {
  resendClient = new Resend(RESENDTOKEN);
}

export const _mailtrap_sender = {
  email: process.env.MAILTRAP_EMAIL,
  name: "Swaggies",
};

export const _resend_sender = {
  email: process.env.RESEND_MAIL || "resend@wackydawg.online",
  name: "Swaggies",
};

export const _gmail_sender = {
  email: process.env.GMAIL_USER || 'noreply.streamio@gmail.com',
  name: "Swaggies",
};

function transporter() {
  if (MAILPROV === 'gmail') return gmailTransporter;
  if (MAILPROV === 'mailtrap') return mailtrapClient;
  if (MAILPROV === 'resend') return resendClient;
  return null;
}

export default transporter;
