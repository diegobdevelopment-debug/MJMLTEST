/**
 * amp.js — AMPscript helpers for MJML templates
 *
 * All functions return plain strings. Use them directly in template
 * literals inside .mjml.js files, then run `build:js` to compile.
 *
 * Quick reference:
 *   amp.v('greeting')              → %%=v(@greeting)=%%
 *   amp.set('x', '"hello"')        → Set @x = "hello"
 *   amp.if('@x == "1"', body)      → %%[If @x == "1" then]\n…\n%%[EndIf]%%
 *   amp.block([...lines])          → %%[\n  line1\n  line2\n]%%
 *   amp.contentBlock('Key_Name')   → %%=ContentBlockByKey("Key_Name")=%%
 */

'use strict';

// ---------------------------------------------------------------------------
// Inline output — use inside text / attribute values
// ---------------------------------------------------------------------------

/** %%=v(@varName)=%% */
function v(varName) {
  return `%%=v(@${varName})=%%`;
}

/** %%=FunctionName(arg1, arg2, ...)=%% — generic function call */
function fn(funcName, ...args) {
  return `%%=${funcName}(${args.join(', ')})=%%`;
}

/** %%=FormatDate(@varName, "fmt")=%% */
function formatDate(varName, fmt) {
  return `%%=FormatDate(@${varName}, "${fmt}")=%%`;
}

/** %%=FormatNumber(@varName, "fmt")=%% */
function formatNumber(varName, fmt) {
  return `%%=FormatNumber(@${varName}, "${fmt}")=%%`;
}

/** %%=Concat(a, b, ...)=%% — pass already-quoted strings or @varName refs */
function concat(...parts) {
  return `%%=Concat(${parts.join(', ')})=%%`;
}

/** %%=ContentBlockByKey("key")=%% */
function contentBlock(key) {
  return `%%=ContentBlockByKey("${key}")=%%`;
}

// ---------------------------------------------------------------------------
// Inline conditional — short form, resolves to a single output value
// Renders: %%[If <cond> then]%%<truthy>%%[Else]%%<falsy>%%[EndIf]%%
// ---------------------------------------------------------------------------

/**
 * Inline if/else — both branches are output expressions (strings).
 * Omit `falsy` for a no-else variant.
 */
function ifInline(condition, truthy, falsy) {
  const elsePart = falsy !== undefined ? `%%[Else]%%${falsy}` : '';
  return `%%[If ${condition} then]%%${truthy}${elsePart}%%[EndIf]%%`;
}

// ---------------------------------------------------------------------------
// Code blocks — use inside <mj-raw>
// ---------------------------------------------------------------------------

/**
 * Wrap an array of AMPscript statements in a block:
 *   %%[
 *     Set @x = "value"
 *     …
 *   ]%%
 */
function block(lines) {
  const body = lines.map((l) => `  ${l}`).join('\n');
  return `%%[\n${body}\n]%%`;
}

/**
 * Block-level if/elseIf/else/endIf — returns a single string.
 *
 * Usage:
 *   amp.blockIf('@x == "1"', [
 *     amp.set('label', '"One"'),
 *   ], {
 *     elseIf: [
 *       { condition: '@x == "2"', body: [amp.set('label', '"Two"')] },
 *     ],
 *     else: [amp.set('label', '"Other"')],
 *   })
 */
function blockIf(condition, body, { elseIf = [], else: elseBranch } = {}) {
  const lines = [`If ${condition} then`, ...body.map((l) => `  ${l}`)];
  for (const branch of elseIf) {
    lines.push(`ElseIf ${branch.condition} then`);
    lines.push(...branch.body.map((l) => `  ${l}`));
  }
  if (elseBranch) {
    lines.push('Else');
    lines.push(...elseBranch.map((l) => `  ${l}`));
  }
  lines.push('EndIf');
  return block(lines);
}

/**
 * Wrap MJML markup in AMPscript If/Else/EndIf using <mj-raw> tags.
 * Use this when a conditional controls entire MJML sections.
 *
 * Usage:
 *   amp.ifSection('@showPromo == "true"', `
 *     <mj-section ...>...</mj-section>
 *   `)
 *
 *   amp.ifSection('@tier == "gold"',
 *     `<mj-section>...</mj-section>`,
 *     `<mj-section>...</mj-section>`   // optional else branch
 *   )
 */
function ifSection(condition, ifMarkup, elseMarkup) {
  const open = `<mj-raw>%%[If ${condition} then]%%</mj-raw>`;
  const close = `<mj-raw>%%[EndIf]%%</mj-raw>`;
  if (elseMarkup !== undefined) {
    return `${open}\n${ifMarkup}\n<mj-raw>%%[Else]%%</mj-raw>\n${elseMarkup}\n${close}`;
  }
  return `${open}\n${ifMarkup}\n${close}`;
}

// ---------------------------------------------------------------------------
// Statement helpers — return single AMPscript statement strings (no %%…%%)
// Intended to be composed inside block() or blockIf() body arrays.
// ---------------------------------------------------------------------------

/** Set @varName = value */
function set(varName, value) {
  return `Set @${varName} = ${value}`;
}

/** Set @varName = [FieldName]  (DE/subscriber field) */
function setField(varName, fieldName) {
  return `Set @${varName} = [${fieldName}]`;
}

/** Set @varName = AttributeValue("attrName") */
function setAttr(varName, attrName) {
  return `Set @${varName} = AttributeValue("${attrName}")`;
}

/** Set @varName = Concat(a, b, …) */
function setConcat(varName, ...parts) {
  return `Set @${varName} = Concat(${parts.join(', ')})`;
}

/** Set @varName = FormatNumber(@srcVar, "N2") */
function setFormatNumber(varName, srcVar, fmt = 'N2') {
  return `Set @${varName} = FormatNumber(@${srcVar}, "${fmt}")`;
}

/** Set @varName = Now() */
function setNow(varName) {
  return `Set @${varName} = Now()`;
}

/**
 * Generate a block of Set statements from a plain object.
 *
 *   amp.declarations({
 *     Campaign:    '"AUUS_24_Ecomm"',
 *     SendDate:    'Now()',
 *     greeting:    'Propercase(Trim(@FirstName))',
 *   })
 *
 * Values that start with [ are treated as field references: [FieldName]
 * All others are used verbatim (so wrap string literals in '"…"' yourself).
 */
function declarations(map) {
  const lines = Object.entries(map).map(([varName, value]) => {
    // Auto-detect bare field name shorthand: value is exactly "[FieldName]"
    if (/^\[.+\]$/.test(value)) {
      return set(varName, value);
    }
    return set(varName, value);
  });
  return block(lines);
}

// ---------------------------------------------------------------------------
// Preheader helpers
// ---------------------------------------------------------------------------

/**
 * Hidden preheader spacer block — paste into <mj-raw> right after the
 * AMPscript declaration block.
 *
 * @param {string} preheaderVar  — AMPscript variable name (default "preheader")
 * @param {number} padCount      — number of zero-width space pads (default 60)
 */
function preheaderBlock(preheaderVar = 'preheader', padCount = 60) {
  const pad = '&#8199;&#65279;&#847; '.repeat(padCount).trimEnd();
  return [
    `<div style="display:none !important; visibility:hidden; mso-hide:all; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">${v(preheaderVar)}</div>`,
    `<div style="display:none">${pad}</div>`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// SFMC system tracking block
// ---------------------------------------------------------------------------

/**
 * Standard SFMC tracking/unsubscribe footer — paste into final <mj-raw>.
 */
function sfmcTrackingBlock() {
  return [
    '<!--[if !mso]><!-->',
    '<div style="display:none;">',
    '  <a style="color:#000000;" href="%%profile_center_url%%">Update Profile</a>',
    '  <span style="color:#000000;">This email was sent by:',
    '    <strong>%%Member_Busname%%</strong>',
    '    %%Member_Addr%% %%Member_City%%, %%Member_State%%, %%Member_PostalCode%%, %%Member_Country%%',
    '  </span>',
    '  <custom name="opencounter" type="tracking"/>',
    '</div>',
    '<!--<![endif]-->',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// csref tag builder
// ---------------------------------------------------------------------------

/**
 * Build a csref tracking URL parameter.
 *
 * amp.csref('trackingCampaign', 'deploymentDate', 'touchNum',
 *            'segmentAudi', 'segmentCD', 'communication', 'testVersion')
 * → %%=Concat(@trackingCampaign,'_',@deploymentDate,…,'_')=%%<SuffixHere>
 *
 * More commonly you'll store the base in a variable and append the suffix:
 *   amp.v('csrefTagBase') + 'Hero_BannerImg'
 */
function csrefBase(...varNames) {
  const parts = varNames.flatMap((n, i) =>
    i < varNames.length - 1 ? [`@${n}`, "'_'"] : [`@${n}`, "'_'"],
  );
  return `%%=Concat(${parts.join(', ')})=%%`;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Inline output
  v,
  fn,
  formatDate,
  formatNumber,
  concat,
  contentBlock,
  ifInline,

  // Code blocks
  block,
  blockIf,
  ifSection,

  // Statement builders (use inside block/blockIf bodies)
  set,
  setField,
  setAttr,
  setConcat,
  setFormatNumber,
  setNow,
  declarations,

  // Prebuilt blocks
  preheaderBlock,
  sfmcTrackingBlock,
  csrefBase,
};
