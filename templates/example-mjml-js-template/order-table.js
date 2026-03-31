'use strict';

/**
 * order-table.js
 * Desktop + mobile order details tables.
 *
 * Lives in <mj-raw> because AMPscript conditionals (%%[IF]%% / %%[ENDIF]%%)
 * wrap individual <tr> rows inside the same <table>. MJML can't do this —
 * each <mj-text> generates a separate table, breaking column alignment.
 */

const amp = require('../../scripts/amp');

const txt =
  'font-family:Verdana,Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;color:#000000;';
const txtBold = `${txt}font-weight:bold;`;
const txtGreen = txt.replace('#000000', '#009900');

const endDate = `${amp.formatDate('alt2', 'mm')}&zwj;/&zwj;${amp.formatDate('alt2', 'dd')}&zwj;/&zwj;${amp.formatDate('alt2', 'yyyy')}`;
const renewsOrExpires = amp.ifInline('@autoRenewalStatus == "Show Copy"', 'Renews ', 'Expires ');
const discountRows = `%%[IF @isDiscountApplied == "true" OR @isDiscountApplied == "True" OR @isDiscountApplied == "1" THEN]%%`;
const discountEnd = `%%[ELSE]%%`;
const discountClose = `%%[ENDIF]%%`;

module.exports = /* html */ `
<table class="hideInMobile" width="100%" role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-bottom:40px;">
  <tr>
    <td width="195" valign="top"><p style="${txtBold}">Subscription:</p></td>
    <td><p style="${txt}">Audi connect NAV*</p></td>
  </tr>
  <tr>
    <td style="padding-bottom:22px;" valign="top"><p style="${txtBold}">Order Number:</p></td>
    <td style="padding-bottom:22px;"><p style="${txt}">${amp.v('alt1')}</p></td>
  </tr>
  <tr>
    <td valign="top"><p style="${txtBold}">Included Services:</p></td>
    <td style="padding-bottom:22px;"><p style="${txt}">Online navigation<br />Traffic light information</p></td>
  </tr>
  <tr>
    <td valign="top"><p style="${txtBold}">${renewsOrExpires}on:</p></td>
    <td><p style="${txt}">${endDate}</p></td>
  </tr>
  ${discountRows}
  <tr>
    <td valign="top"><p style="${txtBold}" class="fontSize13"><strong>Subtotal:</strong></p></td>
    <td valign="top"><p style="${txt}" class="fontSize13">$${amp.v('SlsPriceNetFormatted')}</p></td>
  </tr>
  <tr>
    <td valign="top"><p style="${txt}" class="fontSize13"><strong>Discount:</strong></p></td>
    <td valign="top"><p style="${txtGreen}" class="fontSize13">-$${amp.v('Discount')}</p></td>
  </tr>
  <tr>
    <td valign="top"><p style="${txt}" class="fontSize13"><strong>Tax:</strong></p></td>
    <td valign="top"><p style="${txt}" class="fontSize13">$${amp.v('tax')}</p></td>
  </tr>
  <tr>
    <td valign="top"><p style="${txt}" class="fontSize13"><strong>Total with tax:</strong></p></td>
    <td valign="top"><p style="${txt}" class="fontSize13">$${amp.v('alt3')} towards your first payment only</p></td>
  </tr>
  ${discountEnd}
  <tr>
    <td valign="top"><p style="${txtBold}">Cost:</p></td>
    <td><p style="${txt}">$${amp.v('alt3')}</p></td>
  </tr>
  ${discountClose}
</table>

<!--[if !mso]><!-->
<table class="showInMobile" width="100%" role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:none; padding-bottom:40px;">
  <tr>
    <td valign="top"><p style="${txt}"><strong>Subscription:</strong> Audi connect NAV*</p></td>
  </tr>
  <tr>
    <td style="padding-bottom:22px;" valign="top"><p style="${txt}"><strong>Order Number:</strong><br>${amp.v('alt1')}</p></td>
  </tr>
  <tr>
    <td valign="top"><p style="${txt}"><strong>Included Services:</strong></p></td>
  </tr>
  <tr>
    <td><p style="${txt}">Online navigation<br />Traffic light information</p></td>
  </tr>
  <tr>
    <td style="padding-top:22px;" valign="top"><p style="${txt}"><strong>${renewsOrExpires}on:</strong> ${endDate}</p></td>
  </tr>
  ${discountRows}
  <tr>
    <td style="padding-top:22px;" valign="top"><p style="${txt}"><strong>Subtotal:</strong> $${amp.v('SlsPriceNetFormatted')}</p></td>
  </tr>
  <tr>
    <td style="padding-top:22px;" valign="top"><p style="${txt}"><strong>Discount:</strong> <span style="color:#009900;">-$${amp.v('Discount')}</span></p></td>
  </tr>
  <tr>
    <td style="padding-top:22px;" valign="top"><p style="${txt}"><strong>Tax:</strong> $${amp.v('tax')}</p></td>
  </tr>
  <tr>
    <td style="padding-top:22px;" valign="top"><p style="${txt}"><strong>Total with tax:</strong> $${amp.v('alt3')} towards your first payment only</p></td>
  </tr>
  ${discountEnd}
  <tr>
    <td style="padding-top:22px;" valign="top"><p style="${txt}"><strong>Cost:</strong> $${amp.v('alt3')}</p></td>
  </tr>
  ${discountClose}
</table>
<!--<![endif]-->`.trim();
