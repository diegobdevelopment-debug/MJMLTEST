#!/usr/bin/env node
'use strict';

/**
 * validate.js — post-build validation for compiled email templates.
 *
 * Checks (per compiled HTML file):
 *   1. File exists and is non-empty
 *   2. Starts with valid HTML (<html or <!doctype)
 *   3. HTML structure: no empty href, all <img> have alt attributes
 *   4. AMPscript: %%[ ... ]%% blocks are balanced
 *   5. AMPscript: every %%=v(@var)=%% reference has a matching Set @var declaration
 *
 * Run:  node scripts/validate.js
 * Exit: 0 = all checks passed, 1 = one or more failures
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const OUTPUT_DIR = path.join(__dirname, '../output');
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// ─── Result tracking ─────────────────────────────────────────────────────────

const failures = [];

function fail(file, message) {
  failures.push(`  [FAIL] ${file}: ${message}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Collect the base names of all expected output files by mirroring the same
 * resolution logic used in build.js (subdir index > flat .mjml.js > flat .mjml).
 */
function expectedOutputNames() {
  const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
  const names = [];
  const seen = new Set();

  // Pass 1 — subdirectory templates
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(TEMPLATES_DIR, entry.name, 'index.mjml.js');
    if (fs.existsSync(indexPath)) {
      names.push(entry.name);
      seen.add(entry.name);
    }
  }

  // Pass 2 — flat templates
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const { name: fileName } = entry;
    if (fileName.endsWith('.mjml.js')) {
      const name = fileName.replace(/\.mjml\.js$/, '');
      if (!seen.has(name)) {
        names.push(name);
        seen.add(name);
      }
    } else if (fileName.endsWith('.mjml')) {
      const name = fileName.replace(/\.mjml$/, '');
      const jsCounterpart = path.join(TEMPLATES_DIR, `${fileName}.js`);
      if (!seen.has(name) && !fs.existsSync(jsCounterpart)) {
        names.push(name);
        seen.add(name);
      }
    }
  }

  return names;
}

// ─── Check 1 — output directory ──────────────────────────────────────────────

function checkOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    failures.push('  [FAIL] output/ directory does not exist — did the build run?');
    return false;
  }
  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.html'));
  if (files.length === 0) {
    failures.push('  [FAIL] output/ directory is empty — no HTML files produced');
    return false;
  }
  return true;
}

// ─── Check 2 — every template produced an output file ────────────────────────

function checkCoverage(expectedNames) {
  for (const name of expectedNames) {
    const outputPath = path.join(OUTPUT_DIR, `${name}.html`);
    if (!fs.existsSync(outputPath)) {
      fail(name, `expected output file not found: output/${name}.html`);
    }
  }
}

// ─── Checks 3–5 — per file ───────────────────────────────────────────────────

function checkFile(name) {
  const filePath = path.join(OUTPUT_DIR, `${name}.html`);
  if (!fs.existsSync(filePath)) return; // already reported in checkCoverage

  const content = fs.readFileSync(filePath, 'utf8');

  // 3a. Non-empty
  if (content.trim().length === 0) {
    fail(name, 'file is empty');
    return;
  }

  // 3b. Starts with valid HTML
  const lower = content.trimStart().toLowerCase();
  if (!lower.startsWith('<!doctype') && !lower.startsWith('<html')) {
    fail(name, 'file does not start with <!doctype or <html — may not be valid HTML');
  }

  // ── HTML structural checks (cheerio) ───────────────────────────────────────

  const $ = cheerio.load(content);

  // 3c. No empty href attributes
  $('[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href === '' || href === '#') {
      const tag = el.tagName;
      const text = $(el).text().trim().slice(0, 40) || $(el).attr('src') || '';
      fail(name, `empty or placeholder href on <${tag}>${text ? ` ("${text}")` : ''}`);
    }
  });

  // 3d. All <img> must have an alt attribute (may be empty string, but must exist)
  $('img').each((_, el) => {
    if ($(el).attr('alt') === undefined) {
      const src = ($(el).attr('src') || '').split('/').pop().slice(0, 50);
      fail(name, `<img> missing alt attribute${src ? `: ${src}` : ''}`);
    }
  });

  // ── AMPscript checks ───────────────────────────────────────────────────────

  // 4. Balanced %%[ ... ]%%
  const openBlocks = (content.match(/%%\[/g) || []).length;
  const closeBlocks = (content.match(/\]%%/g) || []).length;
  if (openBlocks !== closeBlocks) {
    fail(
      name,
      `unbalanced AMPscript blocks: ${openBlocks} opening %%[ vs ${closeBlocks} closing ]%%`,
    );
  }

  // 5a. Extract all declared variable names — "Set @varName" (case-insensitive)
  const declaredVars = new Set(
    [...content.matchAll(/Set\s+@([a-zA-Z0-9_]+)/gi)].map((m) => m[1].toLowerCase()),
  );

  // 5b. Extract all inline variable references — %%=v(@varName)=%%
  const usedVars = [...content.matchAll(/%%=v\(@([a-zA-Z0-9_]+)\)=%%/g)].map((m) => m[1]);

  for (const varName of usedVars) {
    if (!declaredVars.has(varName.toLowerCase())) {
      fail(
        name,
        `AMPscript variable @${varName} is used via %%=v()=%% but never declared with Set @${varName}`,
      );
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('Validating compiled templates…\n');

  if (!checkOutputDir()) {
    // Can't proceed without the directory
    console.error('\nValidation failed:\n');
    failures.forEach((f) => console.error(f));
    process.exit(1);
  }

  const expectedNames = expectedOutputNames();
  checkCoverage(expectedNames);
  expectedNames.forEach((name) => checkFile(name));

  if (failures.length === 0) {
    console.log(
      `All checks passed (${expectedNames.length} template${expectedNames.length !== 1 ? 's' : ''} validated).`,
    );
    process.exit(0);
  } else {
    console.error(
      `Validation failed — ${failures.length} issue${failures.length !== 1 ? 's' : ''} found:\n`,
    );
    failures.forEach((f) => console.error(f));
    process.exit(1);
  }
}

main();
