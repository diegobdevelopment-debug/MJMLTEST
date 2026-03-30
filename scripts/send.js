#!/usr/bin/env node
/**
 * Test script — renders a template and sends it to the configured SMTP server.
 *
 * Usage:
 *   node scripts/send.js <template> <to> [variablesJson]
 *
 * Examples:
 *   node scripts/send.js welcome alice@example.com
 *   node scripts/send.js welcome alice@example.com '{"name":"Alice","ctaUrl":"https://example.com","unsubscribeUrl":"https://example.com/unsub"}'
 *
 * Or via npm:
 *   npm run send -- welcome alice@example.com
 *
 * The SMTP target is controlled entirely by .env — no code changes needed
 * to switch between MailDev (local), Mailtrap (sandbox), or production.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const nodemailer = require('nodemailer');
const render = require('./render');

const [, , templateName, to, variablesArg] = process.argv;

if (!templateName || !to) {
  console.error('Usage: node scripts/send.js <template> <to> [variablesJson]');
  console.error('Example: node scripts/send.js welcome alice@example.com');
  process.exit(1);
}

const variables = variablesArg ? JSON.parse(variablesArg) : {};

const transportConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
};

// Only attach auth when credentials are provided (MailDev runs without auth)
if (process.env.SMTP_USER) {
  transportConfig.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

const transport = nodemailer.createTransport(transportConfig);

async function main() {
  const html = render(templateName, variables);

  const info = await transport.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `[test] ${templateName}`,
    html,
  });

  console.log(`Sent "${templateName}" to ${to}`);
  console.log(`Message ID: ${info.messageId}`);
  console.log(`SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
}

main().catch((err) => {
  console.error('Failed to send:', err.message);
  process.exit(1);
});
