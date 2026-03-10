#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');
const chokidar = require('chokidar');

const WATCH_GLOB = path.join(__dirname, '../{templates,partials}/**/*.mjml');
const BUILD_SCRIPT = path.join(__dirname, 'build.js');

console.log('Watching templates/ and partials/ for changes…');

chokidar.watch(WATCH_GLOB, { ignoreInitial: false }).on('all', (event, filePath) => {
  if (!['add', 'change'].includes(event)) return;
  console.log(`\n[${event}] ${path.relative(process.cwd(), filePath)}`);
  try {
    execSync(`node ${BUILD_SCRIPT}`, { stdio: 'inherit' });
  } catch {
    // build errors are already printed by build.js
  }
});
