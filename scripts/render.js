/**
 * Utility for the existing Node.js project.
 * Reads a pre-compiled HTML template and replaces {{placeholders}}.
 *
 * Usage:
 *   const render = require('./mjml/scripts/render');
 *   const html = render('welcome', { name: 'Alice', ctaUrl: 'https://…', unsubscribeUrl: '…' });
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../output');

/**
 * @param {string} templateName  Filename without extension, e.g. 'welcome'
 * @param {Record<string, string>} variables  Key/value pairs for {{placeholder}} replacement
 * @returns {string} Final HTML string ready to send
 */
function render(templateName, variables = {}) {
  const filePath = path.join(OUTPUT_DIR, `${templateName}.html`);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Template "${templateName}" not found at ${filePath}. Did you run npm run build?`
    );
  }

  let html = fs.readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

module.exports = render;
