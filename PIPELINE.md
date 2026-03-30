# CI/CD Pipeline — MJML Email Templates

**Audience:** DevOps / platform team
**Repo:** `mjml-templates` (private)
**Prepared by:** Email team

---

## 1. Overview

This repo contains MJML email template source files. The build process compiles them into production-ready HTML files. The pipeline has two independent concerns:

| Concern                 | When                              | Trigger                          |
| ----------------------- | --------------------------------- | -------------------------------- |
| **Validation (CI)**     | On every push and pull request    | Automatic                        |
| **Release (packaging)** | When the team ships a new version | Manual ("deploy to prod" button) |

There are **no external services, no secrets, and no infrastructure** required beyond GitHub Actions itself. Compiled HTML files are attached as downloadable assets to a GitHub Release.

---

## 2. Repository structure (relevant paths)

```
mjml-templates/
├── templates/          # Source files (.mjml and .mjml.js)
├── partials/           # Shared MJML components (header, footer, styles)
├── output/             # Compiled HTML — generated at build time, not committed
├── scripts/
│   ├── build.js        # Compiles all templates in templates/ → output/
│   └── render.js       # Handlebars post-render utility (not used in CI)
├── package.json
└── package-lock.json
```

The `output/` directory is **not committed to git**. It is produced fresh on every CI run and packaged into a ZIP on release.

---

## 3. Build system

### Language & runtime

- **Node.js 18** (current local version — pin to `18` in the workflow)
- **npm** (lockfile present: `package-lock.json`)

### Install

```bash
npm ci
```

Uses `package-lock.json` for deterministic installs. Do **not** use `npm install` in CI.

### Build command

```bash
npm run build
```

Internally runs `node scripts/build.js`. This:

1. Scans `templates/` for `.mjml` and `.mjml.js` files
2. Compiles each through the MJML library (`validationLevel: 'soft'`)
3. Writes one `.html` file per template into `output/`

If MJML encounters structural errors it logs them but does not currently exit non-zero (soft validation). **See section 6 for the validation script that enforces a hard failure.**

### Format check

```bash
npm run format:check
```

Runs Prettier in check mode. Fails with exit code 1 if any file is not formatted. This is already configured in `package.json`.

---

## 4. Workflow 1 — CI (Validation)

### Purpose

Catch broken templates and formatting issues on every push and PR, before any merge to `main`.

### Trigger

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Steps

| #   | Step                 | Command                    | Fails on                                          |
| --- | -------------------- | -------------------------- | ------------------------------------------------- |
| 1   | Checkout code        | `actions/checkout@v4`      | —                                                 |
| 2   | Set up Node 18       | `actions/setup-node@v4`    | —                                                 |
| 3   | Install dependencies | `npm ci`                   | Missing packages, lockfile mismatch               |
| 4   | Format check         | `npm run format:check`     | Any unformatted file                              |
| 5   | Build all templates  | `npm run build`            | MJML compilation errors                           |
| 6   | Validate output      | `node scripts/validate.js` | Empty output, missing files, unbalanced AMPscript |

**Step 6 requires a new script** (`scripts/validate.js`) — see section 6.

### Required permissions

- Default GitHub Actions permissions are sufficient (read-only).
- No secrets required.

### File path

```
.github/workflows/ci.yml
```

---

## 5. Workflow 2 — Release (Manual)

### Purpose

Build all templates, package them as a ZIP, create a versioned git tag, and attach the ZIP to a GitHub Release. This is the "deploy to prod" action.

### Trigger

`workflow_dispatch` — manually triggered from the GitHub Actions UI.

The person triggering it provides two inputs:

| Input           | Type   | Required | Description                                  | Example                   |
| --------------- | ------ | -------- | -------------------------------------------- | ------------------------- |
| `version`       | string | yes      | Semantic version tag to create               | `v1.2.0`                  |
| `release_notes` | string | no       | Description shown on the GitHub Release page | `"Add Audi NAV template"` |

### How to trigger

1. Go to the repo on GitHub
2. Click **Actions** tab
3. Select **Release** workflow from the left sidebar
4. Click **Run workflow**
5. Fill in `version` (e.g. `v1.2.0`) and optional notes
6. Click the green **Run workflow** button

### Steps

| #   | Step                        | Details                                                |
| --- | --------------------------- | ------------------------------------------------------ |
| 1   | Checkout                    | Full checkout (`fetch-depth: 0` to allow tag creation) |
| 2   | Set up Node 18              | `actions/setup-node@v4`                                |
| 3   | Install dependencies        | `npm ci`                                               |
| 4   | Build templates             | `npm run build` → produces `output/*.html`             |
| 5   | Validate output             | `node scripts/validate.js` — same check as CI          |
| 6   | Create ZIP                  | `zip -r templates-<version>.zip output/`               |
| 7   | Create git tag              | `git tag <version> && git push origin <version>`       |
| 8   | Create Release + attach ZIP | `softprops/action-gh-release@v2`                       |

### Output artifact

After a successful run, the GitHub Release page (`/releases`) will show:

```
v1.2.0
├── Source code (zip)           ← auto-generated by GitHub
├── Source code (tar.gz)        ← auto-generated by GitHub
└── templates-v1.2.0.zip        ← compiled HTML bundle  ✓
```

Direct download URL format:

```
https://github.com/<org>/<repo>/releases/download/v1.2.0/templates-v1.2.0.zip
```

### Required permissions

**This workflow needs write access to push tags and create releases.**

Set in the workflow file:

```yaml
permissions:
  contents: write
```

Or alternatively in repo settings:
`Settings → Actions → General → Workflow permissions → Read and write permissions`

The workflow uses `GITHUB_TOKEN` (automatically provided by Actions — no extra secret needed).

### File path

```
.github/workflows/release.yml
```

---

## 6. Validation script (`scripts/validate.js`)

This script is called by **both** workflows as the last step. It enforces hard failures that the MJML build step currently swallows.

### What it checks

| Check                                                               | Why                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `output/` directory exists and is non-empty                         | Build didn't silently skip templates                         |
| Each `.html` file is > 0 bytes                                      | Template didn't compile to an empty file                     |
| Each `.html` file contains `<!doctype html` or `<html`              | MJML produced valid HTML, not an error string                |
| AMPscript blocks are balanced: count of `%%[` equals count of `%%]` | Catches broken AMPscript composition in `.mjml.js` templates |
| Each template source file has a corresponding output file           | No template was silently skipped                             |

### Exit behavior

- Exits `0` if all checks pass (CI continues)
- Exits `1` with a descriptive error message if any check fails (CI fails)

### This script needs to be created

The file does not exist yet. It should be placed at `scripts/validate.js` and added as an npm script in `package.json`:

```json
"validate": "node scripts/validate.js"
```

---

## 7. Git tag strategy

Tags follow **semver** with a `v` prefix: `v1.0.0`, `v1.2.3`, etc.

Tags are created **by the release workflow** — developers do not push tags manually. The workflow:

1. Receives the version string as a `workflow_dispatch` input
2. Configures git with the Actions bot identity
3. Creates and pushes the tag as part of the run

If a tag already exists with the same version the workflow will fail at the tag creation step. The operator must use a new version string.

---

## 8. Dependencies used in workflows

| Action / tool                 | Version         | Purpose                       |
| ----------------------------- | --------------- | ----------------------------- |
| `actions/checkout`            | `v4`            | Clone repo                    |
| `actions/setup-node`          | `v4`            | Install Node 18               |
| `softprops/action-gh-release` | `v2`            | Create Release + attach asset |
| `zip`                         | system (Ubuntu) | Package `output/` directory   |

`zip` is pre-installed on `ubuntu-latest` runners. No additional setup needed.

---

## 9. Full workflow file specifications

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - name: Format check
        run: npm run format:check

      - name: Build templates
        run: npm run build

      - name: Validate output
        run: node scripts/validate.js
```

### `.github/workflows/release.yml`

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version tag to create (e.g. v1.2.0)'
        required: true
        type: string
      release_notes:
        description: 'Release notes (optional)'
        required: false
        type: string

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - name: Build templates
        run: npm run build

      - name: Validate output
        run: node scripts/validate.js

      - name: Zip compiled templates
        run: zip -r templates-${{ inputs.version }}.zip output/

      - name: Create and push git tag
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git tag ${{ inputs.version }}
          git push origin ${{ inputs.version }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ inputs.version }}
          name: ${{ inputs.version }}
          body: ${{ inputs.release_notes }}
          files: templates-${{ inputs.version }}.zip
```

---

## 10. Checklist for DevOps

- [ ] Create `.github/workflows/ci.yml` (spec in section 9)
- [ ] Create `.github/workflows/release.yml` (spec in section 9)
- [ ] Work with email team to implement `scripts/validate.js` (spec in section 6)
- [ ] Add `"validate": "node scripts/validate.js"` to `package.json` scripts
- [ ] Confirm repo has `contents: write` workflow permission enabled, OR confirm the `permissions` block in the release workflow is sufficient
- [ ] Test CI by opening a PR
- [ ] Test release by triggering `workflow_dispatch` with version `v0.0.1-test` and verifying the ZIP appears on the Releases page
- [ ] Delete the test release/tag after verification

---

## 11. What is NOT in scope

- No deployment to an email service (Salesforce Marketing Cloud, Mailtrap, etc.)
- No secrets or environment variables needed in either workflow
- No Docker, no containerization
- No external artifact registry (S3, Artifactory, etc.)
- The `scripts/send.js` and `scripts/preview.js` files are local developer tools — they are not part of the pipeline
