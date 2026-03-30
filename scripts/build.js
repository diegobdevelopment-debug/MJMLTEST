#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const mjml = require('mjml');

const TEMPLATES_DIR = path.join(__dirname, '../templates');
const OUTPUT_DIR = path.join(__dirname, '../output');

/**
 * Resolve a template to an MJML string.
 *
 * Supports two source formats:
 *   .mjml     — plain MJML (used as-is)
 *   .mjml.js  — JS module that exports a string (or a function returning one);
 *               allows using amp.js helpers for AMPscript composition.
 */
function resolveSource(templatePath) {
  if (templatePath.endsWith('.mjml.js')) {
    // Clear require cache so watch mode picks up changes
    delete require.cache[require.resolve(templatePath)];
    const mod = require(templatePath);
    return typeof mod === 'function' ? mod() : mod;
  }
  return fs.readFileSync(templatePath, 'utf8');
}

function compile(templatePath) {
  // For subdirectory templates (…/<name>/index.mjml.js) use the directory name
  const fileName = path.basename(templatePath);
  const isSubdirIndex = fileName === 'index.mjml.js';
  const baseName = isSubdirIndex
    ? path.basename(path.dirname(templatePath))
    : fileName.replace(/\.mjml(\.js)?$/, '');
  const source = resolveSource(templatePath);

  const { html, errors } = mjml(source, {
    filePath: templatePath,
    validationLevel: 'soft',
  });

  if (errors.length > 0) {
    console.error(`[${baseName}] Errors:`);
    errors.forEach((e) => console.error(' ', e.formattedMessage));
  }

  const outputPath = path.join(OUTPUT_DIR, `${baseName}.html`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`[${baseName}] Built → ${path.relative(process.cwd(), outputPath)}`);
}

/**
 * Collect all buildable template paths.
 *
 * Resolution order for each name found:
 *   1. templates/<name>/index.mjml.js  — subdirectory template (preferred)
 *   2. templates/<name>.mjml.js        — flat .mjml.js
 *   3. templates/<name>.mjml           — plain MJML
 *
 * When a subdirectory index exists, any flat file with the same name is skipped
 * to avoid double-building.
 */
function collectTemplates() {
  const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
  const paths = [];
  const seen = new Set(); // track names already covered by a subdirectory index

  // Pass 1 — subdirectory templates (templates/<name>/index.mjml.js)
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(TEMPLATES_DIR, entry.name, 'index.mjml.js');
    if (fs.existsSync(indexPath)) {
      paths.push(indexPath);
      seen.add(entry.name);
    }
  }

  // Pass 2 — flat templates (templates/<name>.mjml.js / .mjml)
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const { name: fileName } = entry;
    if (fileName.endsWith('.mjml.js')) {
      const name = fileName.replace(/\.mjml\.js$/, '');
      if (!seen.has(name)) paths.push(path.join(TEMPLATES_DIR, fileName));
    } else if (fileName.endsWith('.mjml')) {
      const name = fileName.replace(/\.mjml$/, '');
      // Skip if a .mjml.js counterpart exists (already handled above or below)
      const jsCounterpart = path.join(TEMPLATES_DIR, `${fileName}.js`);
      if (!seen.has(name) && !fs.existsSync(jsCounterpart)) {
        paths.push(path.join(TEMPLATES_DIR, fileName));
      }
    }
  }

  return paths;
}

/**
 * Resolve a template name to a file path.
 * Checks subdirectory index first, then flat files.
 */
function resolveTemplatePath(name) {
  const candidates = [
    path.join(TEMPLATES_DIR, name, 'index.mjml.js'),
    path.join(TEMPLATES_DIR, `${name}.mjml.js`),
    path.join(TEMPLATES_DIR, `${name}.mjml`),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    console.error(
      `Template "${name}" not found. Tried:\n${candidates.map((p) => `  ${p}`).join('\n')}`,
    );
    process.exit(1);
  }
  return found;
}

// Support: node scripts/build.js --template welcome
const templateArg = process.argv.indexOf('--template');
if (templateArg !== -1) {
  const name = process.argv[templateArg + 1];
  compile(resolveTemplatePath(name));
} else {
  const templates = collectTemplates();
  if (templates.length === 0) {
    console.log('No templates found in templates/');
    process.exit(0);
  }
  templates.forEach((p) => compile(p));
}
