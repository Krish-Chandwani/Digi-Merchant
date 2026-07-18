const nodemailer = require('nodemailer');

function getEmailAuth() {
  const user = (process.env.EMAIL_USER || '').trim();
  // Gmail app passwords are often copied with spaces — strip them
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  return { user, pass };
}

function createTransporter() {
  const { user, pass } = getEmailAuth();
  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: (process.env.EMAIL_SERVICE || 'gmail').trim(),
    auth: { user, pass }
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = createTransporter();
  const { user } = getEmailAuth();

  if (!transporter) {
    console.warn(
      'Email not configured (set EMAIL_USER and EMAIL_PASS in Backend/.env, then restart). Skipping email to:',
      to
    );
    return { skipped: true };
  }

  const info = await transporter.sendMail({
    from: (process.env.EMAIL_FROM || `"Digi-Merchant" <${user}>`).trim(),
    to,
    subject,
    html
  });

  console.log('Email sent to:', to, '| messageId:', info.messageId);
  return info;
}

async function sendBulkEmail({ recipients, subject, html }) {
  if (!recipients || recipients.length === 0) return;

  for (const to of recipients) {
    try {
      await sendEmail({ to, subject, html });
    } catch (error) {
      console.error(`Failed to email ${to}:`, error.message);
    }
  }
}

module.exports = { sendEmail, sendBulkEmail };
