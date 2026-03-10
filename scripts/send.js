#!/usr/bin/env node
/**
 * Test script — renders a template and sends it via Mailtrap sandbox.
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

const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

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
  console.log('Check your Mailtrap inbox: https://mailtrap.io/inboxes');
}

main().catch((err) => {
  console.error('Failed to send:', err.message);
  process.exit(1);
});
