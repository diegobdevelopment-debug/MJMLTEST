/**
 * Utility for the existing Node.js project.
 * Reads a pre-compiled HTML template and renders it with Handlebars.
 *
 * Usage:
 *   const render = require('./mjml/scripts/render');
 *   const html = render('welcome', { name: 'Alice', ctaUrl: 'https://…', unsubscribeUrl: '…' });
 */
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const OUTPUT_DIR = path.join(__dirname, '../output');

/**
 * @param {string} templateName  Filename without extension, e.g. 'welcome'
 * @param {Record<string, unknown>} variables  Data passed to the Handlebars template
 * @returns {string} Final HTML string ready to send
 */
function render(templateName, variables = {}) {
  const filePath = path.join(OUTPUT_DIR, `${templateName}.html`);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Template "${templateName}" not found at ${filePath}. Did you run npm run build?`,
    );
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const template = Handlebars.compile(source);
  return template(variables);
}

module.exports = render;
