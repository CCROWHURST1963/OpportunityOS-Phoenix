export class ProfitAtPrice {


    constructor(){


        this.tenPoundCategoryKeys = [

            "beauty",

            "health and personal care",

            "business industrial and scientific supplier",

            "business, industrial and scientific supplier",

            "office products",

            "grocery and gourmet",

            "books",

            "amazon device accessories",

            "home and kitchen"

        ].map(

            value =>

                this.normaliseCategoryText(

                    value

                )

        );


    }






    hasValue(value){


        return (

            value !== null

            &&

            value !== undefined

            &&

            String(

                value

            ).trim() !== ""

        );


    }






    number(

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

                        /[£$€%\s]/g,

                        ""

                    )

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : fallback;


    }






    roundMoney(value){


        const resolved =

            this.number(

                value,

                0

            );


        return Math.round(

            (

                resolved

                +

                Number.EPSILON

            )

            *

            100

        )

        /

        100;


    }






    rate(

        value,

        fallback = 0

    ){


        const resolved =

            this.number(

                value,

                fallback

            );


        return Math.abs(

            resolved

        ) > 1

            ? resolved / 100

            : resolved;


    }






    normaliseCategoryText(value){


        return String(

            value

            ??

            ""

        )

            .trim()

            .toLowerCase()

            .replaceAll(

                "&",

                "and"

            )

            .replace(

                /\s+/g,

                " "

            );


    }






    getSettings(context){


        const settings =

            context?.row?.calculationSettings;


        return settings

        &&

        typeof settings === "object"

            ? settings

            : {};


    }






    getConstants(context){


        const settings =

            this.getSettings(

                context

            );


        const dashboardConstants =

            context?.dashboardConstants

            &&

            typeof context.dashboardConstants ===

                "object"

                ? context.dashboardConstants

                : {};


        return {

            ...dashboardConstants,


            targetRoiPercent:

                settings.targetRoiPercent

                ??

                dashboardConstants.targetRoiPercent

                ??

                20,


            targetMarginPercent:

                settings.targetMarginPercent

                ??

                dashboardConstants.targetMarginPercent

                ??

                20,


            targetProfitAmount:

                settings.targetProfitAmount

                ??

                dashboardConstants.targetProfitAmount

                ??

                3,


            vatRatePercent:

                dashboardConstants.vatRatePercent

                ??

                settings.vatRateOnSalePercent

                ??

                20,


            vatOnCostPercent:

                settings.vatRateOnCostPercent

                ??

                dashboardConstants.vatOnCostPercent

                ??

                dashboardConstants.vatRatePercent

                ??

                20,


            vatOnSalePercent:

                settings.vatRateOnSalePercent

                ??

                dashboardConstants.vatOnSalePercent

                ??

                dashboardConstants.vatRatePercent

                ??

                20,


            referralFeePercent:

                settings.referralFeePercent

                ??

                dashboardConstants.referralFeePercent

                ??

                15,


            nettPrepFee:

                settings.nettPrepFee

                ??

                dashboardConstants.nettPrepFee

                ??

                dashboardConstants.prepFee

                ??

                0,


            digitalTaxFeePercent:

                settings.digitalServiceFeePercent

                ??

                dashboardConstants.digitalTaxFeePercent

                ??

                dashboardConstants.digitalTaxFee

                ??

                2,


            fuelSurchargePercent:

                settings.fuelSurchargePercent

                ??

                dashboardConstants.fuelSurchargePercent

                ??

                1.5,


            fbaFee:

                dashboardConstants.fbaFee

                ??

                context?.fbaFee

                ??

                0

        };


    }






    getRowInputs(

        context,

        suppliedRowInputs = {}

    ){


        return {

            ...(context?.row

                ??

                {}),


            ...(suppliedRowInputs

                ??

                {})

        };


    }






    getCategory(row){


        return (

            row?._category

            ??

            row?.categories_root

            ??

            row?.category

            ??

            row?.product_category

            ??

            ""

        );


    }






    isLowPriceFbaTenPoundCategory(category){


        const resolvedCategory =

            this.normaliseCategoryText(

                category

            );


        return this.tenPoundCategoryKeys.some(

            key =>

                resolvedCategory.includes(

                    key

                )

        );


    }






    getLowPriceFbaThresholdForRow(row){


        if(

            row

            &&

            typeof row === "object"

            &&

            row.__phoenixLowPriceThresholdCached ===

                true

        ){


            return row.__phoenixLowPriceThreshold;


        }


        const threshold =

            this.isLowPriceFbaTenPoundCategory(

                this.getCategory(

                    row

                )

            )

                ? 10

                : 20;


        if(

            row

            &&

            typeof row === "object"

        ){


            row.__phoenixLowPriceThreshold =

                threshold;


            row.__phoenixLowPriceThresholdCached =

                true;


        }


        return threshold;


    }






    getFirstNumber(

        source,

        fields,

        fallback = 0

    ){


        for(

            const field of fields

        ){


            if(

                this.hasValue(

                    source?.[field]

                )

            ){


                return this.number(

                    source[field],

                    fallback

                );


            }


        }


        return fallback;


    }






    resolveFbaFeeForPrice(

        salePrice,

        constants,

        row

    ){


        const threshold =

            this.getLowPriceFbaThresholdForRow(

                row

            );


        const lowPriceFee =

            this.getFirstNumber(

                row,

                [

                    "lowPriceFbaFeeRaw",

                    "_lowPriceFbaFeeRaw",

                    "low_price_fba_fee",

                    "lowPriceFbaFee",

                    "_lowPriceFbaFee",

                    "low_price_fba",

                    "low_cost_fba_fee",

                    "low_fba_fee"

                ],

                0

            );


        const standardFee =

            this.getFirstNumber(

                row,

                [

                    "standardFbaFeeRaw",

                    "_standardFbaFeeRaw",

                    "standard_fba_fee",

                    "standardFbaFee",

                    "_standardFbaFee",

                    "standard_fba",

                    "std_fba_fee",

                    "fbaFeeRaw",

                    "_fbaFeeRaw",

                    "calculatedFbaFeeRaw",

                    "fba_fee",

                    "calculated_fba_fee"

                ],

                this.number(

                    constants.fbaFee,

                    0

                )

            );


        const useLowPriceFba =

            salePrice <= threshold

            &&

            lowPriceFee > 0;


        return {

            fee:

                useLowPriceFba

                    ? lowPriceFee

                    : standardFee,


            programme:

                useLowPriceFba

                    ? "LOW_PRICE_FBA"

                    : "STANDARD_FBA",


            lowPriceFee:

                lowPriceFee,


            standardFee:

                standardFee,


            lowPriceThreshold:

                threshold,


            useLowPriceFba:

                useLowPriceFba

        };


    }






    getFuelSurchargePercent(constants){


        return this.hasValue(

            constants?.fuelSurchargePercent

        )

            ? this.number(

                constants.fuelSurchargePercent,

                1.5

            )

            : 1.5;


    }






    applyFuelSurchargeToFee(

        fee,

        constants

    ){


        const baseFee =

            this.number(

                fee,

                0

            );


        const surchargePercent =

            this.getFuelSurchargePercent(

                constants

            );


        return this.roundMoney(

            baseFee

            *

            (

                1

                +

                surchargePercent / 100

            )

        );


    }






    calculateFeesForPrice({

        salePrice,

        constants,

        taxRateOnSale,

        row

    }){


        const resolvedSalePrice =

            Math.max(

                0,

                this.number(

                    salePrice,

                    0

                )

            );


        const referralPercent =

            this.hasValue(

                row?.referralFeePercentRaw

            )

                ? this.rate(

                    row.referralFeePercentRaw,

                    0

                )

                : this.hasValue(

                    row?._referralFeePercentRaw

                )

                    ? this.rate(

                        row._referralFeePercentRaw,

                        0

                    )

                    : this.hasValue(

                        row?.referral_fee_percent

                    )

                        ? this.rate(

                            row.referral_fee_percent,

                            0

                        )

                        : this.rate(

                            constants.referralFeePercent,

                            0

                        );


        const vatRate =

            this.rate(

                constants.vatRatePercent,

                0

            );


        const saleTaxRate =

            taxRateOnSale === null

            ||

            taxRateOnSale === undefined

                ? vatRate

                : this.rate(

                    taxRateOnSale,

                    vatRate

                );


        const referralFee =

            resolvedSalePrice

            *

            referralPercent;


        const fba =

            this.resolveFbaFeeForPrice(

                resolvedSalePrice,

                constants,

                row

            );


        const baseFbaFee =

            this.number(

                fba.fee,

                0

            );


        const fuelSurchargePercent =

            this.getFuelSurchargePercent(

                constants

            );


        const adjustedFbaFee =

            this.applyFuelSurchargeToFee(

                baseFbaFee,

                constants

            );


        const prepFee =

            this.hasValue(

                row?.nettPrepFeeRaw

            )

                ? this.number(

                    row.nettPrepFeeRaw,

                    0

                )

                : this.hasValue(

                    row?._nettPrepFee

                )

                    ? this.number(

                        row._nettPrepFee,

                        0

                    )

                    : this.hasValue(

                        row?.nett_prep_fee

                    )

                        ? this.number(

                            row.nett_prep_fee,

                            0

                        )

                        : this.number(

                            constants.nettPrepFee

                            ??

                            constants.prepFee,

                            0

                        );


        const digitalTaxPercent =

            this.hasValue(

                row?.digitalTaxFeePercentRaw

            )

                ? this.rate(

                    row.digitalTaxFeePercentRaw,

                    0

                )

                : this.hasValue(

                    row?._digitalTaxFeePercentRaw

                )

                    ? this.rate(

                        row._digitalTaxFeePercentRaw,

                        0

                    )

                    : this.hasValue(

                        row?.digital_tax_fee_percent

                    )

                        ? this.rate(

                            row.digital_tax_fee_percent,

                            0

                        )

                        : this.rate(

                            constants.digitalTaxFeePercent

                            ??

                            constants.digitalTaxFee,

                            0

                        );


        /*
            Production rule:

            Digital service tax base =
            Referral Fee + fuel-adjusted FBA Fee.
        */


        const digitalTaxBase =

            referralFee

            +

            adjustedFbaFee;


        const digitalTaxFee =

            digitalTaxBase

            *

            digitalTaxPercent;


        const totalFeesExTax =

            referralFee

            +

            adjustedFbaFee

            +

            prepFee

            +

            digitalTaxFee;


        const taxOnFees =

            totalFeesExTax

            *

            vatRate;


        const sellingPriceTax =

            saleTaxRate > 0

                ? resolvedSalePrice

                    -

                    (

                        resolvedSalePrice

                        /

                        (

                            1

                            +

                            saleTaxRate

                        )

                    )

                : 0;


        return {

            referralFee:

                this.roundMoney(

                    referralFee

                ),


            referralFeePercent:

                referralPercent,


            fbaFee:

                this.roundMoney(

                    adjustedFbaFee

                ),


            baseFbaFee:

                this.roundMoney(

                    baseFbaFee

                ),


            fuelSurchargePercent:

                fuelSurchargePercent,


            adjustedFbaFee:

                this.roundMoney(

                    adjustedFbaFee

                ),


            lowPriceFbaThreshold:

                fba.lowPriceThreshold,


            fbaProgramme:

                fba.programme,


            lowPriceFbaFee:

                this.roundMoney(

                    fba.lowPriceFee

                ),


            standardFbaFee:

                this.roundMoney(

                    fba.standardFee

                ),


            prepFee:

                this.roundMoney(

                    prepFee

                ),


            digitalTaxFeePercent:

                digitalTaxPercent,


            digitalTaxBase:

                this.roundMoney(

                    digitalTaxBase

                ),


            digitalTaxFee:

                this.roundMoney(

                    digitalTaxFee

                ),


            totalFeesExTax:

                this.roundMoney(

                    totalFeesExTax

                ),


            taxOnFees:

                this.roundMoney(

                    taxOnFees

                ),


            sellingPriceTax:

                this.roundMoney(

                    sellingPriceTax

                ),


            totalFees:

                this.roundMoney(

                    totalFeesExTax

                    +

                    taxOnFees

                    +

                    sellingPriceTax

                )

        };


    }






    calculate({

        salePrice,

        packCostInclTax = 0,

        context,

        taxRateOnSale = null,

        rowInputs = {},

        packTaxAmount = 0

    } = {}){


        const constants =

            this.getConstants(

                context

            );


        const row =

            this.getRowInputs(

                context,

                rowInputs

            );


        const resolvedSalePrice =

            this.number(

                salePrice,

                0

            );


        const resolvedPackCostInclTax =

            this.number(

                packCostInclTax,

                0

            );


        const resolvedPackTaxAmount =

            this.number(

                packTaxAmount,

                0

            );


        const fees =

            this.calculateFeesForPrice({

                salePrice:

                    resolvedSalePrice,


                constants:

                    constants,


                taxRateOnSale:

                    taxRateOnSale,


                row:

                    row

            });






        /*
            Production VAT rule:

            VAT Due =
            VAT on Sale
            - VAT on Cost
            - VAT on Fees
        */


        const taxDue =

            fees.sellingPriceTax

            -

            resolvedPackTaxAmount

            -

            fees.taxOnFees;






        /*
            Phase1925 production formula:

            Profit =
            Sale
            - Cost
            - Total Fees including VAT on fees
            - VAT Due
        */


        const totalFeesForProfit =

            this.roundMoney(

                fees.totalFeesExTax

                +

                fees.taxOnFees

            );


        const rawProfit =

            resolvedSalePrice

            -

            resolvedPackCostInclTax

            -

            totalFeesForProfit

            -

            taxDue;


        fees.taxDue =

            this.roundMoney(

                taxDue

            );


        fees.totalFeesForProfit =

            totalFeesForProfit;


        return {

            fees:

                fees,


            profit:

                this.roundMoney(

                    rawProfit

                ),


            roiPercent:

                resolvedPackCostInclTax > 0

                    ? (

                        rawProfit

                        /

                        resolvedPackCostInclTax

                    )

                    *

                    100

                    : 0,


            marginPercent:

                resolvedSalePrice > 0

                    ? (

                        rawProfit

                        /

                        resolvedSalePrice

                    )

                    *

                    100

                    : 0

        };


    }


}