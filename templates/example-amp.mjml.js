'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  example-amp.mjml.js  —  amp.js reference & usage guide                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Build:  npm run build:template -- example-amp
 *
 * This file is the living reference for the amp.js utility library.
 * Every helper is shown with:
 *   • When to use it
 *   • The JS call
 *   • What AMPscript / HTML it produces
 *
 * ─────────────────────────────────────────────────────────────────────────
 * QUICK MENTAL MODEL
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  There are two "worlds" in an SFMC email:
 *
 *  1. AMPscript world  — logic that runs on the SFMC server before sending.
 *                        Declared with %%[ ... ]%% blocks.
 *                        Lives inside <mj-raw> tags (never inside <mj-text>).
 *
 *  2. MJML/HTML world  — the visual email structure.
 *                        Variables are printed inline with %%=v(@var)=%%.
 *
 *  amp.js has helpers for both worlds.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HELPER INDEX
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  INLINE OUTPUT (use inside <mj-text> or attribute values)
 *  ┌─────────────────────┬──────────────────────────────────────────────┐
 *  │ amp.v(var)          │ Print a variable value                       │
 *  │ amp.ifInline(...)   │ Print one of two values based on a condition │
 *  │ amp.formatDate(...) │ Print a formatted date                       │
 *  │ amp.formatNumber(…) │ Print a formatted number                     │
 *  │ amp.concat(...)     │ Print a concatenated string                  │
 *  │ amp.contentBlock(…) │ Inject an SFMC content block                 │
 *  └─────────────────────┴──────────────────────────────────────────────┘
 *
 *  CODE BLOCKS (use inside <mj-raw> — server-side logic)
 *  ┌─────────────────────┬──────────────────────────────────────────────┐
 *  │ amp.declarations({})│ Declare all variables at top of email        │
 *  │ amp.block([...])    │ Wrap statements in %%[ ... ]%%               │
 *  │ amp.blockIf(...)    │ If/ElseIf/Else inside a %%[ ... ]%% block    │
 *  └─────────────────────┴──────────────────────────────────────────────┘
 *
 *  STATEMENT BUILDERS (use as items inside block() / blockIf() bodies)
 *  ┌──────────────────────────┬─────────────────────────────────────────┐
 *  │ amp.set(var, value)      │ Set @var = value                        │
 *  │ amp.setField(var, field) │ Set @var = [FieldName]  (DE field)      │
 *  │ amp.setAttr(var, attr)   │ Set @var = AttributeValue("attr")       │
 *  │ amp.setConcat(var, ...)  │ Set @var = Concat(a, b, …)              │
 *  │ amp.setFormatNumber(...) │ Set @var = FormatNumber(@src, "N2")     │
 *  │ amp.setNow(var)          │ Set @var = Now()                        │
 *  └──────────────────────────┴─────────────────────────────────────────┘
 *
 *  SECTION WRAPPERS (wrap entire MJML sections in conditionals)
 *  ┌─────────────────────┬──────────────────────────────────────────────┐
 *  │ amp.ifSection(...)  │ Show/hide full MJML sections conditionally   │
 *  └─────────────────────┴──────────────────────────────────────────────┘
 *
 *  PRE-BUILT BLOCKS (drop-in blocks for common SFMC patterns)
 *  ┌────────────────────────┬───────────────────────────────────────────┐
 *  │ amp.preheaderBlock(…)  │ Hidden preheader text + spacer            │
 *  │ amp.sfmcTrackingBlock()│ SFMC profile_center_url + open counter    │
 *  └────────────────────────┴───────────────────────────────────────────┘
 */

const amp = require('../scripts/amp');

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — DECLARATIONS
// ═══════════════════════════════════════════════════════════════════════════
//
// WHEN: Always. The very first thing in <mj-body>.
//       Declares every AMPscript variable the email will use.
//
// HOW:  amp.declarations({}) — pass a plain object.
//       The key   = variable name  (without @)
//       The value = AMPscript RHS  (exactly as you'd write it in AMPscript)
//
//   Value syntax guide:
//     "[FieldName]"      → reads from the sending DE / subscriber data
//     '"string literal"' → a hardcoded string (note the inner quotes)
//     'Now()'            → an AMPscript function call
//     '@otherVar'        → reference to another variable
//
// PRODUCES:
//   %%[
//     Set @email     = [Email]
//     Set @FirstName = [FirstName]
//     Set @Campaign  = "EXAMPLE_CAMPAIGN"
//     Set @SendDate  = Now()
//   ]%%

const declsBasic = amp.declarations({
  email: '[Email]',
  FirstName: '[FirstName]',
  LastName: '[LastName]',
  Campaign: '"EXAMPLE_CAMPAIGN"',
  SendDate: 'Now()',
  preheader: '"Your default preheader text."',
});

// ─── amp.setAttr — for AttributeValue() lookups ────────────────────────────
//
// WHEN: Reading profile attributes or fields not available as DE columns.
//
// HOW:  amp.setAttr('varName', 'AttributeName')
//
// PRODUCES:  Set @IsDiscountApplied = AttributeValue("IsDiscountApplied")

// ─── amp.setFormatNumber — store a formatted number in a variable ──────────
//
// WHEN: You need to format a number once and reuse it multiple times.
//       Avoids repeating FormatNumber() calls inline.
//
// HOW:  amp.setFormatNumber('varName', 'sourceVar', 'N2')
//         'N2' = 2 decimal places (default). Other common: 'C2' for currency.
//
// PRODUCES:  Set @priceFormatted = FormatNumber(@price, "N2")

// ─── amp.blockIf — conditional logic inside a %%[ ]%% block ───────────────
//
// WHEN: Computing a variable whose value depends on a condition,
//       or running conditional Set statements at declaration time.
//       Stays inside <mj-raw> — never inside <mj-text>.
//
// HOW:  amp.blockIf(condition, ifBody[], { elseIf: [...], else: [...] })
//         condition  = AMPscript condition string (including @var refs)
//         ifBody     = array of amp.set*() statement strings
//         elseIf     = array of { condition, body } objects  (optional)
//         else       = array of statement strings            (optional)
//
// PRODUCES:
//   %%[
//     If @FirstName != "" then
//       Set @greeting = Propercase(Trim(@FirstName))
//     Else
//       Set @greeting = "Valued Customer"
//     EndIf
//   ]%%

const declsGreeting = amp.blockIf(
  '@FirstName != ""',
  [amp.set('greeting', 'Propercase(Trim(@FirstName))')],
  { else: [amp.set('greeting', '"Valued Customer"')] },
);

// Multi-branch example with elseIf:
//
//   amp.blockIf('@plan == "GOLD"',
//     [amp.set('badgeColor', '"#FFD700"')],
//     {
//       elseIf: [
//         { condition: '@plan == "SILVER"', body: [amp.set('badgeColor', '"#C0C0C0"')] },
//       ],
//       else: [amp.set('badgeColor', '"#CD7F32"')],
//     }
//   )

// ─── amp.block — wrap arbitrary statements in %%[ ]%% ─────────────────────
//
// WHEN: You need a group of Set statements that don't require if/else logic,
//       e.g. building a csref tracking base variable from its parts.
//
// HOW:  amp.block([statement1, statement2, …])
//         Each item is a string returned by amp.set*() helpers.
//
// PRODUCES:
//   %%[
//     Set @trackingCampaign = "CRM_EXAMPLE"
//     Set @deploymentDate   = "20240101"
//     Set @csrefTagBase     = Concat(@trackingCampaign,'_',@deploymentDate,'_')
//   ]%%

const declsTracking = amp.block([
  amp.set('trackingCampaign', '"CRM_EXAMPLE"'),
  amp.set('deploymentDate', '"20240101"'),
  amp.set('touchNum', '"1"'),
  amp.setConcat(
    'csrefTagBase',
    '@trackingCampaign',
    "'_'",
    '@deploymentDate',
    "'_'",
    '@touchNum',
    "'_'",
  ),
]);

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — INLINE OUTPUT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

// ─── amp.v — print a variable ──────────────────────────────────────────────
//
// WHEN: Anywhere you need to output a variable value in visible content —
//       inside <mj-text>, <mj-preview>, href attributes, alt text, etc.
//
// HOW:  amp.v('varName')   (no @ prefix — it adds it)
//
// PRODUCES:  %%=v(@greeting)=%%
//
// IN TEMPLATE:
//   <mj-text>Hello, ${amp.v('greeting')}!</mj-text>
//   → renders as: Hello, Jane!

// ─── amp.ifInline — pick one of two output values ──────────────────────────
//
// WHEN: You need to print different text depending on a condition,
//       but both options are short and stay on the same line / in the same
//       paragraph. For full sections use amp.ifSection() instead.
//
// HOW:  amp.ifInline(condition, truthyOutput, falsyOutput)
//
// PRODUCES:
//   %%[If @autoRenewal == "ACTIVE" then]%%renews%%[Else]%%expires%%[EndIf]%%
//
// IN TEMPLATE:
//   <mj-text>Your subscription ${amp.ifInline('@autoRenewal == "ACTIVE"', 'renews', 'expires')} on …</mj-text>
//   → renders as: "Your subscription renews on …"  or  "…expires on …"

// ─── amp.formatDate — print a formatted date ───────────────────────────────
//
// WHEN: You need to display a date variable in a specific format.
//       Common formats: "mm" "dd" "yyyy" "mmmm" "dddd"
//
// HOW:  amp.formatDate('varName', 'format')
//
// PRODUCES:  %%=FormatDate(@expiryDate, "mm")=%%
//
// IN TEMPLATE:
//   <mj-text>Expires: ${amp.formatDate('expiryDate', 'mm')}/${amp.formatDate('expiryDate', 'dd')}/${amp.formatDate('expiryDate', 'yyyy')}</mj-text>
//   → renders as: "Expires: 12/31/2025"

// ─── amp.contentBlock — inject an SFMC content block ──────────────────────
//
// WHEN: Inserting a reusable SFMC content block (header, footer, social links).
//       Always wrap in <mj-raw> — this is server-side content, not MJML.
//
// HOW:  amp.contentBlock('Content_Block_Key')
//
// PRODUCES:  %%=ContentBlockByKey("Brand_Global_Header_2024")=%%
//
// IN TEMPLATE:
//   <mj-raw>${amp.contentBlock('Brand_Global_Header_2024')}</mj-raw>

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — SECTION WRAPPERS
// ═══════════════════════════════════════════════════════════════════════════

// ─── amp.ifSection — show / hide entire MJML sections ─────────────────────
//
// WHEN: A full <mj-section> (or multiple sections) should only appear
//       when a condition is true. Use this — NOT inline %%[If]%% strings —
//       so the intent is clear and the open/close tags are always balanced.
//
// HOW:  amp.ifSection(condition, mjmlMarkup)
//       amp.ifSection(condition, ifMarkup, elseMarkup)   ← with else branch
//
// PRODUCES:
//   <mj-raw>%%[If @showPromo == "true" then]%%</mj-raw>
//   <mj-section …>…</mj-section>
//   <mj-raw>%%[EndIf]%%</mj-raw>
//
//
// With else branch:
//   amp.ifSection('@tier == "gold"',
//     `<mj-section>…gold content…</mj-section>`,
//     `<mj-section>…default content…</mj-section>`
//   )
//
// Nested (outer wraps inner):
//   amp.ifSection('@autoRenewal == "ACTIVE"',
//     amp.ifSection('@hasDiscount == "true"', discountSection) + renewalSection
//   )

const promoSection = `
    <mj-section background-color="#f5f5f5" padding="20px 30px">
      <mj-column>
        <mj-text font-weight="bold">Special offer just for you!</mj-text>
      </mj-column>
    </mj-section>`;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — PRE-BUILT BLOCKS
// ═══════════════════════════════════════════════════════════════════════════

// ─── amp.preheaderBlock — hidden preheader + zero-width spacer ─────────────
//
// WHEN: Every email. Paste once, right after the declarations block.
//       The hidden div shows the preheader text in email clients' preview line.
//       The spacer prevents other content from showing after the preheader.
//
// HOW:  amp.preheaderBlock('preheaderVarName')
//         Default var name is 'preheader'. Override if yours is named differently.
//
// PRODUCES:
//   <div style="display:none !important; …">%%=v(@preheader)=%%</div>
//   <div style="display:none">&#8199;&#65279;&#847; … (60× spacer chars)</div>
//
// IN TEMPLATE:  <mj-raw>${amp.preheaderBlock('preheader')}</mj-raw>

// ─── amp.sfmcTrackingBlock — SFMC required footer ──────────────────────────
//
// WHEN: Every email. Paste once as the very last <mj-raw> before </mj-body>.
//       SFMC requires profile_center_url and the open-counter tracking tag.
//
// HOW:  amp.sfmcTrackingBlock()   (no arguments)
//
// PRODUCES:
//   <!--[if !mso]><!-->
//   <div style="display:none;">
//     <a href="%%profile_center_url%%">Update Profile</a>
//     <span>This email was sent by: <strong>%%Member_Busname%%</strong> …</span>
//     <custom name="opencounter" type="tracking"/>
//   </div>
//   <!--<![endif]-->
//
// IN TEMPLATE:  <mj-raw>${amp.sfmcTrackingBlock()}</mj-raw>

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

module.exports = /* html */ `
<mjml>
  <mj-head>
    <mj-title>Example</mj-title>

    <!--
      amp.v() in <mj-preview>:
      Outputs the preheader variable in the email subject preview line.
      Produces: <mj-preview>%%=v(@preheader)=%%</mj-preview>
    -->
    <mj-preview>${amp.v('preheader')}</mj-preview>

    <mj-attributes>
      <mj-all font-family="Verdana, Arial, Helvetica, sans-serif" />
      <mj-text font-size="16px" line-height="22px" color="#000000" />
      <mj-section padding="0" />
    </mj-attributes>
  </mj-head>

  <mj-body width="600px">

    <!--
    ════════════════════════════════════════════════════════════════════════
     DECLARATIONS BLOCK
     • Always the first element inside <mj-body>
     • Wraps all Set statements in a single %%[ ... ]%% block
     • The div+comment trick hides the block in browser preview
     • Strip the outer %%[ ]%% delimiters with .replace() to merge
       multiple block builders into one wrapper
    ════════════════════════════════════════════════════════════════════════
    -->
    <mj-raw>%%[/* Modify to view AMPScript - Email Specific
<div style="display:none">*/
${[declsBasic, declsGreeting, declsTracking]
  .map((b) => b.replace(/^%%\[|\]%%$/g, '').trim())
  .join('\n')}
/*</div>*/
]%%</mj-raw>

    <!--
    ════════════════════════════════════════════════════════════════════════
     PREHEADER SPACER
     • amp.preheaderBlock('preheader') — use the var name you declared above
     • Produces a hidden div with the preheader text + zero-width spacers
     • Required in every email
    ════════════════════════════════════════════════════════════════════════
    -->
    <mj-raw>${amp.preheaderBlock('preheader')}</mj-raw>

    <!--
    ════════════════════════════════════════════════════════════════════════
     CONTENT BLOCK — header
     • amp.contentBlock('Key') inside <mj-raw>
     • The key is the content block's External Key in SFMC
     • Never use inside <mj-text> — this is server-side content
    ════════════════════════════════════════════════════════════════════════
    -->
    <mj-raw>${amp.contentBlock('Brand_Global_Header_2024')}</mj-raw>

    <!--
    ════════════════════════════════════════════════════════════════════════
     INLINE VARIABLE OUTPUT  —  amp.v()
     • Use directly inside <mj-text>, href, alt, etc.
     • amp.v('greeting')  →  %%=v(@greeting)=%%
    ════════════════════════════════════════════════════════════════════════
    -->
    <mj-section background-color="#ffffff" padding="0">
      <mj-column padding="0 30px">

        <mj-text padding="40px 0 20px 0" font-size="20px" font-weight="bold">
          ${amp.v('greeting')},
        </mj-text>

        <!--
        ════════════════════════════════════════════════════════════════════
         INLINE CONDITIONAL  —  amp.ifInline()
         • Use when two short output strings depend on a condition,
           within the same paragraph or sentence.
         • amp.ifInline('@autoRenewal == "ACTIVE"', 'renews', 'expires')
           →  %%[If @autoRenewal == "ACTIVE" then]%%renews%%[Else]%%expires%%[EndIf]%%
         • DO NOT use for showing/hiding full sections → use amp.ifSection()
        ════════════════════════════════════════════════════════════════════
        -->
        <mj-text padding="0 0 20px 0">
          Your subscription ${amp.ifInline('@autoRenewal == "ACTIVE"', 'renews', 'expires')} on
          ${amp.formatDate('expiryDate', 'mm')}/${amp.formatDate('expiryDate', 'dd')}/${amp.formatDate('expiryDate', 'yyyy')}.
        </mj-text>

        <!--
        ════════════════════════════════════════════════════════════════════
         FORMAT DATE  —  amp.formatDate()
         • amp.formatDate('varName', 'format')
           →  %%=FormatDate(@varName, "format")=%%
         • Common formats: "mm" "dd" "yyyy" "mmmm d, yyyy"
         • Shown above combined to produce: 12/31/2025
        ════════════════════════════════════════════════════════════════════
        -->

        <mj-text padding="0 0 40px 0">
          Thank you for being a customer.
        </mj-text>

      </mj-column>
    </mj-section>

    <!--
    ════════════════════════════════════════════════════════════════════════
     CONDITIONAL SECTION  —  amp.ifSection()
     • Use when an entire <mj-section> should only appear conditionally.
     • Automatically wraps the MJML with <mj-raw>%%[If … then]%%</mj-raw>
       and <mj-raw>%%[EndIf]%%</mj-raw> — tags are always balanced.
     • With else:  amp.ifSection(cond, ifMarkup, elseMarkup)
     • Nested:     amp.ifSection(outer, amp.ifSection(inner, …) + otherMarkup)
     • DO NOT use for toggling rows inside a table → use a single <mj-raw>
       containing the whole table (see audi-connect-nav.mjml.js)
    ════════════════════════════════════════════════════════════════════════
    -->
    ${amp.ifSection('@showPromo == "true"', promoSection)}

    <!--
    ════════════════════════════════════════════════════════════════════════
     CONTENT BLOCK — footer
    ════════════════════════════════════════════════════════════════════════
    -->
    <mj-section background-color="#000000" padding="0">
      <mj-column>
        <mj-raw>${amp.contentBlock('Brand_Footer_Static_2024')}</mj-raw>
      </mj-column>
    </mj-section>

    <!--
    ════════════════════════════════════════════════════════════════════════
     SFMC TRACKING BLOCK
     • Always the last element inside <mj-body>
     • Required by SFMC — omitting it causes deployment errors
    ════════════════════════════════════════════════════════════════════════
    -->
    <mj-raw>${amp.sfmcTrackingBlock()}</mj-raw>

  </mj-body>
</mjml>
`.trim();
