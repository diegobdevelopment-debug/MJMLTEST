'use strict';

/**
 * audi-connect-nav
 * Subscription confirmation email — Audi connect NAV
 *
 * Build: npm run build:template -- audi-connect-nav
 */

const amp = require('../../scripts/amp');
const declarations = require('./declarations');
const styles = require('./styles');
const orderTable = require('./order-table');
const autoRenewal = require('./auto-renewal');
const footer = require('./footer');

const IMG =
  'https://aoa-images-prod.s3.amazonaws.com/Automated/eCommerce/Gen4_Connect_eComm_Transactional/images';
const csref = (suffix) => `${amp.v('csrefTagBase')}${suffix}`;

module.exports = /* html */ `
<mjml>
  <mj-head>
    <mj-title>Audi</mj-title>
    <mj-preview>${amp.v('preheader')}</mj-preview>
    ${styles}
  </mj-head>

  <mj-body width="720px">

    <mj-raw>${declarations}</mj-raw>
    <mj-raw>${amp.preheaderBlock('preheader')}</mj-raw>
    <mj-raw>${amp.contentBlock('Audi_Global_White_Header_2024')}</mj-raw>

    <!-- ═══ HERO ═════════════════════════════════════════════════════════════ -->
    <mj-section padding="0">
      <mj-column padding="0">
        <mj-image
          css-class="hideInMobile"
          src="${IMG}/CPMAUDI-2811_Gen4_Audi_ConnectNAV_Desktop_HERO.jpg"
          width="720px" alt="Welcome to an exciting new connection."
          href="https://www.audiusa.com/us/web/en/inside-audi/innovation/audi-connect.html?csref=${csref('Hero_ExcitingConnectionsImg')}"
          target="_blank" padding="0" border="none"
        />
        <!--[if !mso]><!-->
        <mj-image
          css-class="showInMobile"
          src="${IMG}/CPMAUDI-2811_Gen4_Audi_ConnectNAV_Mobile_HERO.jpg"
          width="360px" alt="Welcome to an exciting new connection."
          href="https://www.audiusa.com/us/web/en/inside-audi/innovation/audi-connect.html?csref=${csref('Hero_ExcitingConnectionsImg')}"
          target="_blank" padding="0" container-background-color="#ffffff" fluid-on-mobile="true"
        />
        <!--<![endif]-->
      </mj-column>
    </mj-section>

    <!-- ═══ PRIMARY CONTENT ══════════════════════════════════════════════════ -->
    <mj-section background-color="#ffffff" padding="0">
      <mj-column padding="0 30px">
        <mj-text padding="40px 0 20px 0" font-size="20px" line-height="30px" font-weight="bold">
          ${amp.v('greeting')},
        </mj-text>
        <mj-text padding="0 0 20px 0">
          Thank you for enrolling in Audi connect NAV* for greater peace of mind
          and an enhanced ownership experience. Here are your plan&nbsp;details:
        </mj-text>
        <mj-raw>${orderTable}</mj-raw>
      </mj-column>
    </mj-section>

    <!-- ═══ AUTO-RENEWAL COPY ════════════════════════════════════════════════ -->
    ${autoRenewal}

    <!-- ═══ POD 1 — Image left, dark background ══════════════════════════════ -->
    <mj-section background-color="#1a1a1a" padding="0">
      <mj-column padding="0" css-class="mobilePods">
        <mj-image
          css-class="hideInMobile"
          src="${IMG}/CPMAUDI-2811_Gen4_Audi_AllVersions_Desktop_POD1.jpg"
          width="360px" alt=""
          href="https://www.audiusa.com/us/web/en/about-myaudi.html?csref=${csref('Tile1_HoldingPhoneImg')}"
          target="_blank" padding="0" border="none"
        />
        <!--[if !mso]><!-->
        <mj-image
          css-class="showInMobile"
          src="${IMG}/CPMAUDI-2811_Gen4_Audi_AllVersions_Mobile_POD1.jpg"
          width="360px" alt=""
          href="https://www.audiusa.com/us/web/en/about-myaudi.html?csref=${csref('Tile1_HoldingPhoneImg')}"
          target="_blank" padding="0" fluid-on-mobile="true"
        />
        <!--<![endif]-->
      </mj-column>
      <mj-column padding="0 30px" css-class="mobilePods" vertical-align="middle">
        <mj-text padding="40px 0 20px 0" font-size="18px" line-height="28px" font-weight="bold" color="#ffffff">
          Manage it all through the myAudi&nbsp;app.<sup>&szlig;</sup>
        </mj-text>
        <mj-text padding="0 0 20px 0" color="#ffffff">
          To get started, set yourself as your vehicle&rsquo;s Key User, then
          download the app from the
          <a alias="Tile1_AppStoreTxt" href="https://apps.apple.com/bg/app/myaudi/id440464115" target="_blank" style="color:#ffffff;text-decoration:underline;">App Store</a>
          or
          <a alias="Tile1_GooglePlayTxt" href="https://play.google.com/store/apps/details?id=de.myaudi.mobile.assistant&hl=en_US" target="_blank" style="color:#ffffff;text-decoration:underline;">Google&nbsp;Play</a>&trade;&nbsp;store.
        </mj-text>
        <mj-text padding="0 0 40px 0" font-weight="bold" color="#ffffff">
          <a alias="Tile1_ManageMyPlanCtaTxt" href="https://www.audiusa.com/us/web/en/about-myaudi.html?csref=${csref('Tile1_ManageMyPlanCtaTxt')}" target="_blank" style="color:#ffffff;text-decoration:none;">Manage my plan &gt;</a>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- ═══ POD 2 — Image right, white background ════════════════════════════ -->
    <!--[if !mso]><!-->
    <mj-section background-color="#ffffff" padding="0" css-class="showInMobile">
      <mj-column padding="0">
        <mj-image
          css-class="showInMobile"
          src="${IMG}/CPMAUDI-2811_Gen4_Audi_AllVersions_Mobile_POD2.jpg"
          width="360px" alt=""
          href="https://www.audiusa.com/us/web/en/inside-audi/innovation/audi-connect.html?csref=${csref('Tile2_InteriorImg')}"
          target="_blank" padding="0" fluid-on-mobile="true"
        />
      </mj-column>
    </mj-section>
    <!--<![endif]-->

    <mj-section background-color="#ffffff" padding="0">
      <mj-column padding="0 30px" css-class="mobilePods" vertical-align="middle">
        <mj-text padding="40px 0 20px 0" font-size="18px" line-height="28px" font-weight="bold">
          Explore Audi connect NAV*&nbsp;features.
        </mj-text>
        <mj-text padding="0 0 20px 0">
          Learn about your connect features. Remember, some features available
          in your plan require an additional registration to activate,&nbsp;including:
        </mj-text>
        <mj-text padding="0 0 20px 0">
          <ul style="margin:0">
            <li>Fuel prices</li>
            <li>Parking info</li>
            <li>Satellite imagery</li>
          </ul>
        </mj-text>
        <mj-text padding="0 0 40px 0" font-weight="bold">
          <a alias="Tile2_LearnMoreCtaTxt" href="https://www.audiusa.com/us/web/en/inside-audi/innovation/audi-connect.html?csref=${csref('Tile2_LearnMoreCtaTxt')}" target="_blank" style="color:#000000;text-decoration:none;">Learn more &gt;</a>
        </mj-text>
      </mj-column>
      <mj-column padding="0" css-class="hideInMobile mobilePods">
        <mj-image
          css-class="hideInMobile"
          src="${IMG}/CPMAUDI-2811_Gen4_Audi_AllVersions_Desktop_POD2.jpg"
          width="360px" alt=""
          href="https://www.audiusa.com/us/web/en/inside-audi/innovation/audi-connect.html?csref=${csref('Tile2_InteriorImg')}"
          target="_blank" padding="0" border="none"
        />
      </mj-column>
    </mj-section>

    <!-- ═══ FOOTER ═══════════════════════════════════════════════════════════ -->
    ${footer}

    <!-- ═══ SFMC tracking ═══════════════════════════════════════════════════ -->
    <mj-raw>${amp.sfmcTrackingBlock()}</mj-raw>

  </mj-body>
</mjml>
`.trim();
