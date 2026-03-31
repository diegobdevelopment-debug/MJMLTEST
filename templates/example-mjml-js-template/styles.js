'use strict';

module.exports = `
  <mj-attributes>
    <mj-all font-family="Verdana, Arial, Helvetica, sans-serif" />
    <mj-text font-size="16px" line-height="22px" color="#000000" />
    <mj-section padding="0" />
  </mj-attributes>

  <mj-style>
    body, p, h1, h2, h3, h4 { margin: 0; padding: 0; }
    * { box-sizing: border-box; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
    u + .body a { color: inherit; text-decoration: none; font-size: inherit; font-weight: inherit; line-height: inherit; }
    sup { font-size: 0.6em; line-height: 0; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    a { color: inherit !important; mso-color-alt: windowtext; text-decoration: none; }
    .unlink a { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    span.MsoHyperlink { color: inherit !important; mso-style-priority: 99 !important; }
    span.MsoHyperlinkFollowed { color: inherit !important; mso-style-priority: 99 !important; }
    img + div { display: none; }
    div[style*="margin: 16px 0"] { margin: 0 !important; }
    .showInMobile { display: none !important; }

    @media screen and (max-width: 540px) {
      #MessageViewBody, #MessageWebViewDiv { width: 100% !important; }
      .alignLeft { text-align: left !important; }
      .alignCenter { text-align: center !important; margin: 0 auto !important; }
      .fullWidth { width: 100% !important; }
      .displayTable { display: table !important; }
      .hideInMobile { display: none !important; }
      .mobileContainer { min-width: 360px !important; max-width: 360px !important; width: 360px !important; }
      .showInMobile { width: 100% !important; display: block !important; float: none !important; }
      .mobilePods { width: 100% !important; display: block !important; margin: 0 auto !important; }
      .displayBlock { display: block !important; }
      .hAuto { height: auto !important; max-height: none !important; }
    }

    @media screen and (max-width: 540px) {
      .fontSize10Footer { font-size: 10px !important; line-height: 15px !important; letter-spacing: 1px; }
      .fontSize13 { font-size: 13px !important; line-height: 18px !important; }
      .fontSize14 { font-size: 14px !important; line-height: 22px !important; }
      .fontSize16 { font-size: 16px !important; line-height: 24px !important; }
      .h10 { height: 10px !important; } .h13 { height: 13px !important; } .h20 { height: 20px !important; }
      .h26 { height: 26px !important; } .h30 { height: 30px !important; } .h36 { height: 36px !important; }
      .w17 { width: 17px !important; } .w20 { width: 20px !important; } .w22 { width: 22px !important; }
      .w24 { width: 24px !important; } .w27 { width: 27px !important; } .w29 { width: 29px !important; }
      .w30 { width: 30px !important; } .w120 { width: 120px !important; } .w140 { width: 140px !important; }
      .w324 { width: 324px !important; } .w360 { width: 360px !important; }
      .padR0 { padding-right: 0px !important; } .padB25 { padding-bottom: 25px !important; } .padT5 { padding-top: 5px !important; }
    }
  </mj-style>

  <mj-raw>
    <!--[if mso]><style>* { font-family: sans-serif !important; } sup { font-size: 100% !important; }</style>
    <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  </mj-raw>
`.trim();
