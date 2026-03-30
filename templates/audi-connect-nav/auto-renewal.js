'use strict';

const amp = require('../../scripts/amp');

const discountCopy = `
    <mj-section background-color="#ffffff" padding="0">
      <mj-column padding="0 30px">
        <mj-text padding="0 0 20px 0" font-weight="bold">Your card will be charged $${amp.v('RecurringCharge')}${amp.v('RecurringChargeQualifier')} each time your subscription renews. Discounts are only applied to the first payment and not on the subsequent charges.</mj-text>
      </mj-column>
    </mj-section>`;

const renewalCopy = `
    <mj-section background-color="#ffffff" padding="0">
      <mj-column padding="0 30px">
        <mj-text padding="0 0 20px 0" font-weight="bold">Your Audi connect NAV subscription is set to automatically renew every ${amp.v('SubTimePara')} at a cost of $${amp.v('RecurringCharge')}${amp.v('RecurringChargeQualifier')}&#46; Your payment method on file in the myAudi account will be automatically charged at the beginning of each billing period unless you cancel your subscription at least 15 days prior to your next billing date. (You can view your next billing date in the myAudi app under the Subscription Management section.) You can cancel by logging into the myAudi mobile app and visiting your Audi connect subscription settings (Account Setting &gt; Subscriptions). You can also cancel your plan by contacting&nbsp;(877&#8209;505&#8209;Audi).</mj-text>
        <mj-text padding="0 0 40px 0" font-weight="bold">Click <a alias="Body_HereCtaTxt" href="https://www.audiusa.com/us/web/en/about-myaudi.html?csref=${amp.v('csrefTagBase')}Body_HereCtaTxt" target="_blank" style="color:#0C73E3;text-decoration:underline;">here</a> for additional billing and cancelation terms. Log in to your myAudi account online or visit the myAudi app to view tutorials and manage your&nbsp;account.</mj-text>
      </mj-column>
    </mj-section>`;

module.exports = amp.ifSection(
  '@autoRenewalStatus == "Show Copy"',
  amp.ifSection(
    '@isDiscountApplied == "true" OR @isDiscountApplied == "True" OR @isDiscountApplied == "1"',
    discountCopy,
  ) + renewalCopy,
);
