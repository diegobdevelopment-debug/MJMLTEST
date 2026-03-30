'use strict';

const amp = require('../../scripts/amp');

const csref = (suffix) => `${amp.v('csrefTagBase')}${suffix}`;

module.exports = /* html */ `
<mj-section background-color="#000000" padding="0">
  <mj-column padding="0">
    <mj-raw>${amp.contentBlock('Audi_HR_Footer_Static_1_App_2024')}</mj-raw>

    <mj-text padding="15px 37px 0 37px" font-size="10px" line-height="15px" color="#ffffff" font-weight="normal" letter-spacing="-0.5px">
      * Always pay careful attention to the road, and do not drive while
      distracted. Audi connect should only be used when it is safe and
      appropriate. Audi connect services are provided with the support of
      authorized affiliated and third&#8209;party service providers. Connect
      CARE Safety and Security vehicle services are activated prior to
      purchase or lease and do not require registration or paid subscription;
      acceptance of Terms of Service is required for Remote vehicle services.
      Connect NAV services are optional and may require an additional
      subscription with separate terms and conditions. Trial or paid
      subscription required. Not available on models without navigation.
      Audi connect services require vehicle cellular connectivity and
      availability of vehicle GPS signal; certain services collect location
      information, see Terms of Service for information about how to disable.
      Audi connect services depend on connection to and continued availability
      of 4G LTE cellular service, which is outside of Audi&rsquo;s control.
      Audi connect services are not guaranteed or warranted in the event of
      4G LTE network shutdowns, obsolescence, or other unavailability of
      cellular connectivity that relies on existing vehicle hardware. All
      Audi connect services are subject to change, discontinuation, or
      cancellation without notice. See Terms of Service, Privacy Policy, and
      other details at
      <a href="https://www.audiusa.com/en/compliance/privacy/?csref=${csref('Footer_AudiNavPolicyTxt')}" alias="Footer_AudiNavPolicyTxt" target="_blank" style="color:#ffffff;text-decoration:underline;line-height:15px;">www.audiusa.com/privacy</a>
      and
      <a href="https://www.audiusa.com/en/compliance/terms-of-service/audi-connect/?csref=${csref('Footer_AudiNavTermsTxt')}" alias="Footer_AudiNavTermsTxt" target="_blank" style="color:#ffffff;text-decoration:underline;line-height:15px;">https://www.audiusa.com/technology/intelligence/audi-connect/connect-terms</a>.
    </mj-text>

    <mj-text padding="10px 37px 0 37px" font-size="10px" line-height="15px" color="#ffffff" font-weight="normal" letter-spacing="-0.5px">
      &szlig; myAudi services require myAudi account and acceptance of Terms
      of Service. Certain services may require trial or paid subscriptions,
      which may have their own terms and conditions. Services through the
      myAudi app require cellular connectivity, network compatible hardware,
      and availability of vehicle GPS signal. Not all services and features
      are available on all vehicles, and some features may require the most
      recent software update. Standard text and data rates may apply for app
      and web features. See Terms of Service, Privacy Statement, and other
      important information at&nbsp;<a href="https://www.audiusa.com/us/web/en/about-myaudi.html?csref=${csref('Footer_myAudiTxt')}" alias="Footer_myAudiTxt" target="_blank" style="color:#ffffff;text-decoration:underline;line-height:15px;">audiusa.com/myaudi</a>.
    </mj-text>

    <mj-text padding="10px 37px 0 37px" font-size="10px" line-height="15px" color="#ffffff" font-weight="normal" letter-spacing="-0.5px">
      1 Standard text and data usage rates apply. Always pay careful
      attention to the road, and do not drive while&nbsp;distracted.
    </mj-text>

    <mj-text padding="10px 37px 0 37px" font-size="10px" line-height="15px" color="#ffffff" font-weight="normal" letter-spacing="-0.5px">
      &ldquo;Audi,&rdquo; &ldquo;Singleframe&rdquo; and the Singleframe
      grille design, the four rings logo and all model names are registered
      trademarks of AUDI AG. &ldquo;Apple&rdquo; and the Apple logo are
      trademarks of Apple Inc., registered in the U.S. and other countries
      and regions. &ldquo;App Store&rdquo; is a service mark of Apple Inc.
      &ldquo;Google Play&rdquo; and the Google Play logo are trademarks of
      Google LLC. All other trademarks are the property of their
      respective&nbsp;owners.
    </mj-text>

    <mj-text padding="8px 37px 0 37px" font-size="10px" line-height="15px" color="#ffffff" font-weight="normal" letter-spacing="-0.5px">
      To ensure you continue to receive emails from Audi, please place
      <a href="mailto:AudiExperience@e.audiusa.com" alias="Footer_AudiExperienceTxt" style="color:#ffffff;text-decoration:underline;line-height:15px;">AudiExperience@e.audiusa.com</a>
      in your address book. You may also
      <a href="https://www.audiusa.com/us/web/en/support/contact-us.html?csref=${csref('Footer_ContactAudiTxt')}" alias="Footer_ContactAudiTxt" target="_blank" style="color:#ffffff;text-decoration:underline;line-height:15px;">contact Audi directly</a>
      with questions or for additional information. This is an outbound email
      only; we will be unable to respond to replies. For comments and
      questions, please contact&nbsp;<a alias="Footer_AudiTalkTxt" href="mailto:auditalk@audi.com" target="_blank" style="color:#ffffff;text-decoration:underline;line-height:15px;">auditalk@audi.com</a>.
    </mj-text>

    <mj-raw>${amp.contentBlock('Audi_Global_Foot_Social_Address_2024')}</mj-raw>

    <mj-text padding="40px 0" />
  </mj-column>
</mj-section>`.trim();
