'use strict';

/**
 * Snapshot tests for compiled email templates.
 *
 * Each template is compiled fresh from source on every run and compared
 * against a committed snapshot in tests/__snapshots__/.
 *
 * Workflow:
 *   npm test               — run tests, fail on snapshot mismatch
 *   npm run test:update    — recompile and overwrite all snapshots (run when
 *                            an intentional template change should become the
 *                            new baseline)
 */

const fs = require('fs');
const path = require('path');
const mjml = require('mjml');

const TEMPLATES_DIR = path.join(__dirname, '../templates');

// ─── Template discovery (mirrors build.js resolution order) ──────────────────

function resolveSource(templatePath) {
  if (templatePath.endsWith('.mjml.js')) {
    delete require.cache[require.resolve(templatePath)];
    const mod = require(templatePath);
    return typeof mod === 'function' ? mod() : mod;
  }
  return fs.readFileSync(templatePath, 'utf8');
}

function collectTemplates() {
  const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
  const templates = [];
  const seen = new Set();

  // Pass 1 — subdirectory templates (templates/<name>/index.mjml.js)
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(TEMPLATES_DIR, entry.name, 'index.mjml.js');
    if (fs.existsSync(indexPath)) {
      templates.push([entry.name, indexPath]);
      seen.add(entry.name);
    }
  }

  // Pass 2 — flat templates (.mjml.js and .mjml)
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const { name: fileName } = entry;
    if (fileName.endsWith('.mjml.js')) {
      const name = fileName.replace(/\.mjml\.js$/, '');
      if (!seen.has(name)) {
        templates.push([name, path.join(TEMPLATES_DIR, fileName)]);
        seen.add(name);
      }
    } else if (fileName.endsWith('.mjml')) {
      const name = fileName.replace(/\.mjml$/, '');
      const jsCounterpart = path.join(TEMPLATES_DIR, `${fileName}.js`);
      if (!seen.has(name) && !fs.existsSync(jsCounterpart)) {
        templates.push([name, path.join(TEMPLATES_DIR, fileName)]);
        seen.add(name);
      }
    }
  }

  return templates;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const templates = collectTemplates();

describe('template snapshots', () => {
  test.each(templates)('%s — compiles without MJML errors', (name, templatePath) => {
    const source = resolveSource(templatePath);
    const { errors } = mjml(source, { filePath: templatePath, validationLevel: 'soft' });
    expect(errors).toHaveLength(0);
  });

  test.each(templates)('%s — compiled HTML matches snapshot', (name, templatePath) => {
    const source = resolveSource(templatePath);
    const { html } = mjml(source, { filePath: templatePath, validationLevel: 'soft' });
    expect(html).toMatchSnapshot();
  });
});
