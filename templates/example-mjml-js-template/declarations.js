'use strict';

module.exports = `%%[/* Modify to view AMPScript - Email Specific
<div style="display:none">*/

  /* ── Data fields ── */
  Set @email             = [Email]
  Set @FirstName         = [FirstName]
  Set @LastName          = [LastName]
  Set @MdlDrvtvCde       = [MdlDrvtvCde]
  Set @ModelName         = [MdlName]
  Set @ModelYear         = [MdlYr]
  Set @ModelTrim         = [MdlTrim]
  Set @alt1              = [OrderID]
  Set @alt2              = [SubscrptonEndDte]
  Set @alt4              = [OrderStatus]
  Set @alt5              = [PrdctName]
  Set @SlsPriceGross     = [SlsPriceGross]
  Set @tax               = [TaxAmt]
  Set @tax               = FormatNumber(@tax, "N2")
  Set @SlsPriceNet       = [SlsPriceNet]
  Set @LicenseRunTime    = [LicenseRunTime]
  Set @autoRenewalStatus = [autoRenewalStatus]

  /* ── Campaign metadata ── */
  Set @alt10           = "No Offer - No Offer"
  Set @Campaign        = "AUUS_24_Ecomm"
  Set @SubCampaign     = "AUUS_EM_24_Loy1P_Other-Gen4PlusConfNA"
  Set @SubCampaignDesc = "Loyalty - 1P - Auto - Gen 4 Audi connect PLUS Confirmation - NA - NA"
  Set @Audience        = "Current Owners - Gen 4 connect PLUS Conf"
  Set @SendDate        = Now()
  Set @SalesMatch      = "N"
  Set @Vendor          = "Razorfish"
  Set @Brand           = "AU"
  Set @creative_flag   = "Transactional~Transactional~NA"
  Set @Offer_CD        = "N"

  /* ── Pricing & discount calculation ── */
  Set @alt3                         = FormatNumber(@SlsPriceGross, "N2")
  Set @RecurringCharge              = @alt3
  Set @RecurringChargeQualifier     = ""
  Set @IsDiscountApplied            = AttributeValue("IsDiscountApplied")
  Set @Discount                     = AttributeValue("DiscountedAmount")
  Set @SlstotalGrossWithoutDiscounts = AttributeValue("SlstotalGrossWithoutDiscounts")
  Set @SlsTotalNetWithoutDiscounts   = AttributeValue("SlsTotalNetWithoutDiscounts")

  If NOT EMPTY(@SlsTotalNetWithoutDiscounts) Then
    Set @SlsTotalNetWithoutDiscounts = FormatNumber(@SlsTotalNetWithoutDiscounts, "N2")
  Else
    Set @SlsTotalNetWithoutDiscounts = "0"
  EndIf

  If NOT EMPTY(@Discount) AND NOT EMPTY(@isDiscountApplied)
     AND (@isDiscountApplied == "true" OR @isDiscountApplied == "True" OR @isDiscountApplied == "1") Then
    Set @SlsPriceNet              = @SlsTotalNetWithoutDiscounts
    Set @Discount                 = FormatNumber(@Discount, "N2")
    Set @SlsPriceGross            = Add(Subtract(@SlsTotalNetWithoutDiscounts, @Discount), @tax)
    Set @alt3                     = FormatNumber(@SlsPriceGross, "N2")
    Set @RecurringCharge          = FormatNumber(@SlstotalGrossWithoutDiscounts, "N2")
    Set @RecurringChargeQualifier = ""
  EndIf

  Set @SlsPriceNetFormatted = FormatNumber(@SlsPriceNet, "N2")

  /* ── Subscription duration label ── */
  If      @LicenseRunTime == "P1Y"      Then Set @SubTime = " per year"                 Set @SubTimePara = "year"
  ElseIf  @LicenseRunTime == "P12M"     Then Set @SubTime = " per year"                 Set @SubTimePara = "year"
  ElseIf  @LicenseRunTime == "P1M"      Then Set @SubTime = " per month"                Set @SubTimePara = "month"
  ElseIf  @LicenseRunTime == "P6M"      Then Set @SubTime = " every 6 months"           Set @SubTimePara = "6 months"
  ElseIf  @LicenseRunTime == "P99Y"     Then Set @SubTime = " one&#8209;time&#8209;fee" Set @SubTimePara = "one&#8209;time&#8209;fee"
  ElseIf  @LicenseRunTime == "lifetime" Then Set @SubTime = " one&#8209;time&#8209;fee" Set @SubTimePara = "one&#8209;time&#8209;fee"
  ElseIf  @LicenseRunTime == "P3Y"      Then Set @SubTime = " every three years"        Set @SubTimePara = "three years"
  ElseIf  @LicenseRunTime == "P1D"      Then Set @SubTime = " daily"                    Set @SubTimePara = "day"
  ElseIf  @LicenseRunTime == "P18M"     Then Set @SubTime = " every 18 months"          Set @SubTimePara = "18 months"
  Else                                       Set @SubTime = ""                           Set @SubTimePara = ""
  EndIf

  /* ── Auto-renewal status ── */
  If @autoRenewalStatus == "ACTIVE" Then
    Set @autoRenewalStatus = "Show Copy"
  Else
    Set @autoRenewalStatus = "Hide Copy"
  EndIf

  /* ── csref tracking base ── */
  Set @trackingCampaign = "CRM_MX_TRTG_Ecomm"
  Set @deploymentDate   = "20240521"
  Set @touchNum         = "1"
  Set @segmentAudi      = "Current Owners"
  Set @segmentCD        = "NA_CO_1_NA"
  Set @communication    = "AudiConnectNAV"
  Set @testVersion      = "NA"
  Set @csrefTagBase     = Concat(@trackingCampaign,'_',@deploymentDate,'_',@touchNum,'_',@segmentAudi,'_',@segmentCD,'_',@communication,'_',@testVersion,'_')

  /* ── Personalization ── */
  If @FirstName != "" Then
    Set @greeting = Propercase(Trim(@FirstName))
  Else
    Set @greeting = "Audi Enthusiast"
  EndIf

  Set @subjectLine = Concat(@greeting, ", thanks for enrolling in Audi connect NAV.")
  Set @preheader   = "Start using features designed for greater ease and convenience."

/*</div>*/
]%%`;
