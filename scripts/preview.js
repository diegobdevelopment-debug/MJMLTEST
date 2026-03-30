#!/usr/bin/env node
/**
 * Generates a browser preview page with Mobile / Tablet / Desktop viewport
 * toggle buttons, then opens it.
 *
 * Usage:
 *   npm run preview -- <template>
 *   npm run preview -- welcome
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const templateName = process.argv[2];

if (!templateName) {
  console.error('Usage: npm run preview -- <template>');
  process.exit(1);
}

const templatePath = path.join(__dirname, '../output', `${templateName}.html`);

if (!fs.existsSync(templatePath)) {
  console.error(`"${templateName}" not found at ${templatePath}. Did you run npm run build?`);
  process.exit(1);
}

const html = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview — ${templateName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a1a;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── Toolbar ── */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 16px;
      background: #242424;
      border-bottom: 1px solid #333;
      flex-shrink: 0;
    }

    .toolbar-label {
      font-size: 12px;
      color: #666;
      margin-right: 8px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }

    .btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 14px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      color: #888;
      cursor: pointer;
      transition: color .15s, border-color .15s, background .15s;
    }
    .btn:hover { color: #ccc; background: #2e2e2e; }
    .btn.active { color: #fff; border-color: #555; background: #333; }

    .btn svg { display: block; }

    .btn span {
      font-size: 10px;
      letter-spacing: .04em;
      text-transform: uppercase;
    }

    /* ── Preview area ── */
    .stage {
      flex: 1;
      overflow: auto;
      display: flex;
      justify-content: center;
      padding: 32px 24px;
    }

    .frame-wrap {
      transition: width .2s ease;
      width: 100%;
      max-width: 100%;
    }

    iframe {
      display: block;
      width: 100%;
      height: 800px;
      border: none;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 4px 24px rgba(0,0,0,.5);
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span class="toolbar-label">${templateName}</span>

    <button class="btn" id="btn-mobile" onclick="setViewport('mobile')" title="Mobile — 375px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.5" stroke-width="2.5"/>
      </svg>
      <span>Mobile</span>
    </button>

    <button class="btn" id="btn-tablet" onclick="setViewport('tablet')" title="Tablet — 768px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.5" stroke-width="2.5"/>
      </svg>
      <span>Tablet</span>
    </button>

    <button class="btn active" id="btn-desktop" onclick="setViewport('desktop')" title="Desktop — full width">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/>
      </svg>
      <span>Desktop</span>
    </button>
  </div>

  <div class="stage">
    <div class="frame-wrap" id="frame-wrap">
      <iframe
        id="preview"
        src="${templateName}.html"
        onload="resizeIframe(this)"
      ></iframe>
    </div>
  </div>

  <script>
    const viewports = { mobile: '375px', tablet: '768px', desktop: '100%' };

    function setViewport(name) {
      document.getElementById('frame-wrap').style.width = viewports[name];
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById('btn-' + name).classList.add('active');
    }

    function resizeIframe(iframe) {
      iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px';
    }
  </script>
</body>
</html>`;

const previewPath = path.join(__dirname, '../output', `${templateName}.preview.html`);
fs.writeFileSync(previewPath, html);

const open =
  process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
execSync(`${open} "${previewPath}"`);

console.log(`Preview opened for "${templateName}"`);
