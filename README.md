# MJML Email Templates

Templates are authored in MJML and compiled to plain HTML at build time. Dynamic data is handled by AMPScript at send time inside Salesforce Marketing Cloud (SFMC).

## Folder structure

```
mjml/
├── templates/
│   ├── welcome.mjml                    # Simple template (plain MJML)
│   └── audi-connect-nav/               # Self-contained template folder
│       ├── index.mjml.js               # Entry point — assembles partials
│       ├── declarations.js             # AMPScript variable declarations
│       ├── styles.js                   # <mj-attributes>, <mj-style>, MSO fixes
│       ├── order-table.js              # Raw HTML order details table
│       ├── auto-renewal.js             # Conditional renewal copy blocks
│       └── footer.js                  # Footer section with legal footnotes
├── partials/
│   ├── styles/                         # Shared CSS partials (via mj-include)
│   │   ├── base.mjml
│   │   └── dark-mode.mjml
│   └── components/                     # Shared layout fragments (via mj-include)
│       ├── header.mjml
│       └── footer.mjml
├── output/                             # Compiled HTML (gitignored)
├── scripts/
│   ├── amp.js          # AMPScript helpers for MJML composition
│   ├── build.js        # Compiles all templates (or a single one)
│   ├── watch.js        # Recompiles on file changes
│   ├── preview.js      # Opens a compiled template in the browser
│   ├── render.js       # Runtime helper: loads compiled HTML + fills placeholders
│   └── send.js         # Dev tool: renders + sends a template via Mailtrap
├── .env                # Local credentials (gitignored)
├── .env.example
└── package.json
```

## Getting started

```bash
npm install
npm run build            # compile all templates → output/
npm run watch            # recompile on save
```

Build a single template:

```bash
npm run build:template -- audi-connect-nav
npm run build:template -- welcome
```

## Template formats

Two source formats are supported:

| Format                           | When to use                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| `templates/<name>.mjml`          | Simple templates with no AMPScript                                     |
| `templates/<name>/index.mjml.js` | Templates with AMPScript, complex logic, or template-specific partials |

### Subdirectory templates (`templates/<name>/`)

Use a folder when a template needs its own partials or has AMPScript. The folder name becomes the output filename.

```
templates/my-template/
├── index.mjml.js    # required entry point
├── declarations.js  # AMPScript vars
├── styles.js        # template-specific CSS
└── footer.js        # template-specific sections
```

```bash
npm run build:template -- my-template   # → output/my-template.html
```

### Flat templates (`templates/<name>.mjml`)

Use a plain `.mjml` file for templates that rely on the shared partials in `partials/` and have no AMPScript.

```bash
npm run build:template -- welcome       # → output/welcome.html
```

## AMPScript integration (`scripts/amp.js`)

`amp.js` provides helpers for weaving AMPScript into MJML templates without raw string repetition. Import it in any `.mjml.js` file:

```js
const amp = require('../../scripts/amp');
```

### Helpers

| Helper                               | Output                                             |
| ------------------------------------ | -------------------------------------------------- |
| `amp.v('varName')`                   | `%%=v(@varName)=%%`                                |
| `amp.ifInline(cond, truthy, falsy?)` | `%%[If cond then]%%a%%[Else]%%b%%[EndIf]%%`        |
| `amp.formatDate('varName', 'mm')`    | `%%=FormatDate(@varName,"mm")=%%`                  |
| `amp.contentBlock('Key')`            | `%%=ContentBlockByKey("Key")=%%`                   |
| `amp.ifSection(cond, mjml, else?)`   | Wraps MJML sections in `<mj-raw>%%[If]%%</mj-raw>` |
| `amp.preheaderBlock('varName')`      | Hidden preheader div with zero-width spacers       |
| `amp.sfmcTrackingBlock()`            | SFMC profile center + open tracking pixel          |

### Where to place AMPScript in MJML

| Content                                       | MJML placement                                                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Inline variable output `%%=v(@var)=%%`        | Directly inside `<mj-text>` content                                                                                                        |
| Conditionals wrapping `<tr>` rows             | `<mj-raw>` (MJML generates a separate `<table>` per `<mj-text>` — use raw HTML tables when rows must share one table for column alignment) |
| ContentBlockByKey calls                       | `<mj-raw>`                                                                                                                                 |
| Variable declaration block                    | First `<mj-raw>` in `<mj-body>`                                                                                                            |
| Block-level conditionals around MJML sections | `amp.ifSection()`                                                                                                                          |
| SFMC system vars (`%%profile_center_url%%`)   | `<mj-raw>` at end of body via `amp.sfmcTrackingBlock()`                                                                                    |

### Example

```js
const amp = require('../../scripts/amp');

// Inline variable
`<mj-text>Hello, ${amp.v('FirstName')}!</mj-text>`;

// Conditional section
amp.ifSection('@plan == "premium"', `<mj-section>...</mj-section>`)
// Inline conditional
`<mj-text>${amp.ifInline('@autoRenewalStatus == "Show Copy"', 'Renews', 'Expires')} on: ...</mj-text>`;
```

## Local preview

```bash
npm run build
npm run preview -- audi-connect-nav
```

Generates `output/<name>.preview.html` — a wrapper page that loads the email in an iframe with Mobile / Tablet / Desktop viewport buttons.

| Button  | Width      |
| ------- | ---------- |
| Mobile  | 375px      |
| Tablet  | 768px      |
| Desktop | Full width |

## Testing with Mailtrap

```bash
cp .env.example .env
```

Fill in your Mailtrap credentials, then:

```bash
npm run build
npm run send -- welcome alice@example.com '{"name":"Alice","ctaUrl":"https://example.com"}'
```

## Shared partials (`partials/`)

Shared partials are for templates that do **not** use SFMC ContentBlockByKey for their header/footer. Include them via `mj-include`:

```xml
<mj-include path="../partials/styles/base.mjml" />
<mj-include path="../partials/styles/dark-mode.mjml" />
<mj-include path="../partials/components/header.mjml" />
<mj-include path="../partials/components/footer.mjml" />
```

Templates that serve SFMC directly (like `audi-connect-nav`) skip these and use `amp.contentBlock()` instead, which resolves to a live ContentBlockByKey call at send time.

## Dark mode

| Layer                                 | Clients covered                                                        |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `@media (prefers-color-scheme: dark)` | Apple Mail, iOS Mail, Gmail app, Samsung Mail, Thunderbird, Yahoo Mail |
| `[data-ogsc]` attribute prefix        | Outlook.com, Office 365 web                                            |
| `color-scheme` meta tags              | Suppresses auto-inversion in supporting clients                        |

### Applying dark mode

1. Include the style partials in `<mj-head>`:

```xml
<mj-include path="../partials/styles/base.mjml" />
<mj-include path="../partials/styles/dark-mode.mjml" />
```

2. Add `css-class` attributes using the predefined tokens:

| Class        | Element      | Overrides              |
| ------------ | ------------ | ---------------------- |
| `dm-body`    | `mj-body`    | Outer page background  |
| `dm-card`    | `mj-section` | White content card     |
| `dm-hero`    | `mj-section` | Brand-colour header    |
| `dm-footer`  | `mj-section` | Footer background      |
| `dm-heading` | `mj-text`    | Large heading text     |
| `dm-text`    | `mj-text`    | Body text              |
| `dm-muted`   | `mj-text`    | Secondary / small text |
| `dm-btn`     | `mj-button`  | Button background      |

## CI / build pipeline

Run `npm run build` as part of your build step. Since `output/` is gitignored, compiled HTML must be generated in CI rather than committed.
