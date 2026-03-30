## Recommended tooling for testing email rendering

### Local preview

A custom preview script generates a wrapper page that loads the compiled template in an iframe with three viewport toggle buttons.

**Usage:**

```bash
npm run build
npm run preview -- <template-name>
```

| Button  | Iframe width | Use case                                        |
| ------- | ------------ | ----------------------------------------------- |
| Mobile  | 375px        | iOS/Android email clients                       |
| Tablet  | 768px        | iPad and larger Android tablets                 |
| Desktop | Full width   | Desktop clients (email centres itself at 600px) |

The preview opens the raw compiled HTML directly in the browser — no sanitisation — so all CSS including `@media` queries is intact.

### Dark mode testing

The preview script does not simulate dark mode automatically. To test it:

1. Open the preview in Chrome or Edge
2. Open DevTools → three-dot menu → **More tools** → **Rendering**
3. Set **"Emulate CSS media feature prefers-color-scheme"** → `dark`

This fires the same `@media (prefers-color-scheme: dark)` query that real clients use, giving a faithful result without changing OS settings.

### Mailtrap (sandbox delivery testing)

[Mailtrap](https://mailtrap.io) captures outgoing emails in a cloud sandbox. Nothing reaches a real inbox. Use this to verify delivery, subject lines, plain-text fallback, and to share previews with the team.

```bash
npm run send -- <template> <to-address> '<variables-json>'
```

SMTP credentials are configured via `.env` (see `.env.example`).

### Known client limitations

| Client                    | Limitation                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Gmail Android / iOS / Web | Strips the entire `<style>` block. Dark mode CSS falls back to Gmail's own rendering. No workaround exists.          |
| Outlook Windows           | No `border-radius`, no `@media`. Always renders light theme. MJML's VML output handles layout and buttons correctly. |
| ProtonMail                | Strips class selectors and descendant combinators. Dark mode does not apply; light layout is intact.                 |
