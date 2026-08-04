export class RowCalculationSettingsEnricher {


    constructor(){


        this.defaultSource =

            "Dashboard";


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    hasValue(value){


        return (

            value !==

                null

            &&

            value !==

                undefined

            &&

            String(

                value

            ).trim() !==

                ""

        );


    }






    normaliseNumber(

        value,

        fallback = 0

    ){


        if(!this.hasValue(value)){


            return fallback;


        }


        const parsed =

            Number(

                String(

                    value

                )

                    .replaceAll(

                        ",",

                        ""

                    )

                    .replace(

                        /[£$€%]/g,

                        ""

                    )

                    .trim()

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : fallback;


    }






    normaliseMethod(

        value,

        fallback = "ROI"

    ){


        const resolved =

            this.normaliseText(

                value

            );


        return resolved

        ||

        fallback;


    }






    getExistingSettings(row){


        const settings =

            row?.calculationSettings;


        return settings

        &&

        typeof settings ===

            "object"

            ? settings

            : {};


    }






    getExistingSources(settings){


        const sources =

            settings?.source;


        return sources

        &&

        typeof sources ===

            "object"

            ? sources

            : {};


    }






    resolveSetting({

        row,

        settings,

        sources,

        overrideFields = [],

        rowFields = [],

        dashboardValue,

        fallbackValue,

        normaliser = value => value

    }){


        for(

            const field of overrideFields

        ){


            if(

                this.hasValue(

                    row?.[field]

                )

            ){


                return {

                    value:

                        normaliser(

                            row[field],

                            fallbackValue

                        ),


                    source:

                        "ASIN"

                };


            }


        }


        for(

            const field of rowFields

        ){


            if(

                this.hasValue(

                    row?.[field]

                )

            ){


                return {

                    value:

                        normaliser(

                            row[field],

                            fallbackValue

                        ),


                    source:

                        sources[field]

                        ||

                        "Row"

                };


            }


        }


        if(

            this.hasValue(

                dashboardValue

            )

        ){


            return {

                value:

                    normaliser(

                        dashboardValue,

                        fallbackValue

                    ),


                source:

                    this.defaultSource

            };


        }


        return {

            value:

                normaliser(

                    fallbackValue,

                    fallbackValue

                ),


            source:

                "Fallback"

        };


    }






    enrich(

        row,

        dashboardConstants = {}

    ){


        if(

            !row

            ||

            typeof row !==

                "object"

        ){


            return row;


        }


        const existingSettings =

            this.getExistingSettings(

                row

            );


        const existingSources =

            this.getExistingSources(

                existingSettings

            );






        const targetRoi =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "target_roi_override",

                    "asin_target_roi_percent"

                ],


                rowFields:[

                    "target_roi_percent",

                    "targetRoiPercent"

                ],


                dashboardValue:

                    dashboardConstants.targetRoiPercent

                    ??

                    dashboardConstants.target_roi

                    ??

                    dashboardConstants.target_roi_percent,


                fallbackValue:

                    20,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const targetMargin =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "target_margin_override",

                    "asin_target_margin_percent"

                ],


                rowFields:[

                    "target_margin_percent",

                    "targetMarginPercent"

                ],


                dashboardValue:

                    dashboardConstants.targetMarginPercent

                    ??

                    dashboardConstants.target_profit_margin

                    ??

                    dashboardConstants.target_profit_margin_percent,


                fallbackValue:

                    20,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const targetProfit =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "target_profit_override",

                    "asin_target_profit_amount"

                ],


                rowFields:[

                    "target_profit_amount",

                    "targetProfitAmount"

                ],


                dashboardValue:

                    dashboardConstants.targetProfitAmount

                    ??

                    dashboardConstants.target_profit,


                fallbackValue:

                    3,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const vatOnCost =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "vat_on_cost_override",

                    "asin_vat_on_cost_percent"

                ],


                rowFields:[

                    "vat_on_cost_percent",

                    "vatRateOnCostPercent"

                ],


                dashboardValue:

                    dashboardConstants.vatOnCostPercent

                    ??

                    dashboardConstants.vat_rate_on_cost

                    ??

                    dashboardConstants.vat_on_cost,


                fallbackValue:

                    20,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const vatOnSale =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "vat_on_sale_override",

                    "asin_vat_on_sale_percent"

                ],


                rowFields:[

                    "vat_on_sale_percent",

                    "vatRateOnSalePercent"

                ],


                dashboardValue:

                    dashboardConstants.vatOnSalePercent

                    ??

                    dashboardConstants.vat_rate_on_sale

                    ??

                    dashboardConstants.vat_on_sale,


                fallbackValue:

                    20,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const referralFee =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "referral_fee_override",

                    "asin_referral_fee_percent"

                ],


                rowFields:[

                    "referral_fee_percent_setting",

                    "referralFeePercent"

                ],


                dashboardValue:

                    dashboardConstants.referralFeePercent

                    ??

                    dashboardConstants.referral_fee_percent,


                fallbackValue:

                    15,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const digitalServiceFee =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "digital_service_fee_override",

                    "asin_digital_service_fee_percent"

                ],


                rowFields:[

                    "digital_service_fee_percent",

                    "digitalTaxFeePercent"

                ],


                dashboardValue:

                    dashboardConstants.digitalTaxFeePercent

                    ??

                    dashboardConstants.digital_service_fee

                    ??

                    dashboardConstants.digital_services_tax,


                fallbackValue:

                    2,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const fuelSurcharge =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "fuel_surcharge_override",

                    "asin_fuel_surcharge_percent"

                ],


                rowFields:[

                    "fuel_surcharge_percent",

                    "fuelSurchargePercent"

                ],


                dashboardValue:

                    dashboardConstants.fuelSurchargePercent

                    ??

                    dashboardConstants.fuel_surcharge_percent,


                fallbackValue:

                    1.5,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const nettPrepFee =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "nett_prep_fee_override",

                    "asin_nett_prep_fee"

                ],


                rowFields:[

                    "nett_prep_fee_setting",

                    "nettPrepFee"

                ],


                dashboardValue:

                    dashboardConstants.nettPrepFee

                    ??

                    dashboardConstants.nett_prep_fee

                    ??

                    dashboardConstants.nett_prep,


                fallbackValue:

                    0,


                normaliser:

                    this.normaliseNumber.bind(

                        this

                    )

            });






        const maxCostMethod =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "max_cost_calc_override",

                    "asin_max_cost_method"

                ],


                rowFields:[

                    "max_cost_method",

                    "maxCostMethod"

                ],


                dashboardValue:

                    dashboardConstants.maxCostCalc

                    ??

                    dashboardConstants.max_cost_calc,


                fallbackValue:

                    "ROI",


                normaliser:

                    this.normaliseMethod.bind(

                        this

                    )

            });






        const maxCostNoSupplierMethod =

            this.resolveSetting({

                row:

                    row,


                settings:

                    existingSettings,


                sources:

                    existingSources,


                overrideFields:[

                    "max_cost_calc_no_supplier_override",

                    "asin_max_cost_no_supplier_method"

                ],


                rowFields:[

                    "max_cost_no_supplier_method",

                    "maxCostNoSupplierMethod"

                ],


                dashboardValue:

                    dashboardConstants.maxCostCalcNoSupplier

                    ??

                    dashboardConstants.max_cost_calc_no_supplier,


                fallbackValue:

                    "ROI",


                normaliser:

                    this.normaliseMethod.bind(

                        this

                    )

            });






        const calculationSettings = {

            targetRoiPercent:

                targetRoi.value,


            targetMarginPercent:

                targetMargin.value,


            targetProfitAmount:

                targetProfit.value,


            vatRateOnCostPercent:

                vatOnCost.value,


            vatRateOnSalePercent:

                vatOnSale.value,


            referralFeePercent:

                referralFee.value,


            digitalServiceFeePercent:

                digitalServiceFee.value,


            fuelSurchargePercent:

                fuelSurcharge.value,


            nettPrepFee:

                nettPrepFee.value,


            maxCostMethod:

                maxCostMethod.value,


            maxCostNoSupplierMethod:

                maxCostNoSupplierMethod.value,


            source:{

                targetRoiPercent:

                    targetRoi.source,


                targetMarginPercent:

                    targetMargin.source,


                targetProfitAmount:

                    targetProfit.source,


                vatRateOnCostPercent:

                    vatOnCost.source,


                vatRateOnSalePercent:

                    vatOnSale.source,


                referralFeePercent:

                    referralFee.source,


                digitalServiceFeePercent:

                    digitalServiceFee.source,


                fuelSurchargePercent:

                    fuelSurcharge.source,


                nettPrepFee:

                    nettPrepFee.source,


                maxCostMethod:

                    maxCostMethod.source,


                maxCostNoSupplierMethod:

                    maxCostNoSupplierMethod.source

            }

        };






        return {

            ...row,


            calculationSettings:

                calculationSettings,






            /*
                Publish effective settings at row level too.

                This makes them available to the grid and
                future per-ASIN editors.
            */


            target_roi_percent:

                calculationSettings.targetRoiPercent,


            target_margin_percent:

                calculationSettings.targetMarginPercent,


            target_profit_amount:

                calculationSettings.targetProfitAmount,


            vat_on_cost_percent:

                calculationSettings.vatRateOnCostPercent,


            vat_on_sale_percent:

                calculationSettings.vatRateOnSalePercent,


            referral_fee_percent_setting:

                calculationSettings.referralFeePercent,


            digital_service_fee_percent:

                calculationSettings.digitalServiceFeePercent,


            fuel_surcharge_percent:

                calculationSettings.fuelSurchargePercent,


            nett_prep_fee_setting:

                calculationSettings.nettPrepFee,


            max_cost_method:

                calculationSettings.maxCostMethod,


            max_cost_no_supplier_method:

                calculationSettings.maxCostNoSupplierMethod

        };


    }






    enrichRows(

        rows = [],

        dashboardConstants = {}

    ){


        if(!Array.isArray(rows)){


            return [];


        }


        return rows.map(

            row =>

                this.enrich(

                    row,

                    dashboardConstants

                )

        );


    }


}