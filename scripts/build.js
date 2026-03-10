#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mjml = require('mjml');

const TEMPLATES_DIR = path.join(__dirname, '../templates');
const OUTPUT_DIR = path.join(__dirname, '../output');

function compile(templatePath) {
  const source = fs.readFileSync(templatePath, 'utf8');
  const templateName = path.basename(templatePath, '.mjml');

  const { html, errors } = mjml(source, {
    filePath: templatePath, // needed for mj-include to resolve relative paths
    validationLevel: 'soft',
  });

  if (errors.length > 0) {
    console.error(`[${templateName}] Errors:`);
    errors.forEach((e) => console.error(' ', e.formattedMessage));
  }

  const outputPath = path.join(OUTPUT_DIR, `${templateName}.html`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`[${templateName}] Built → ${path.relative(process.cwd(), outputPath)}`);
}

// Support: node scripts/build.js --template welcome
const templateArg = process.argv.indexOf('--template');
if (templateArg !== -1) {
  const name = process.argv[templateArg + 1];
  compile(path.join(TEMPLATES_DIR, `${name}.mjml`));
} else {
  const templates = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.mjml'));
  if (templates.length === 0) {
    console.log('No templates found in templates/');
    process.exit(0);
  }
  templates.forEach((file) => compile(path.join(TEMPLATES_DIR, file)));
}
