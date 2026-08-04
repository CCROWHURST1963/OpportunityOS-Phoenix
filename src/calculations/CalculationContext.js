export class CalculationContext {


    constructor(

        row = {},

        dashboardConstants = {}

    ){


        this.row =

            row

            &&

            typeof row === "object"

                ? row

                : {};


        this.dashboardConstants =

            dashboardConstants

            &&

            typeof dashboardConstants === "object"

                ? dashboardConstants

                : {};


        /*
            Identity
        */


        this.asin =

            this.normaliseText(

                this.firstValue(

                    this.row.asin,

                    this.row.ASIN,

                    this.row.matched_asin

                )

            ).toUpperCase();


        this.locale =

            this.normaliseText(

                this.firstValue(

                    this.row.locale,

                    this.row.Locale,

                    this.row.matched_locale,

                    "co.uk"

                )

            ).toLowerCase()

            ||

            "co.uk";






        /*
            Pack information
        */


        this.packSize =

            this.positiveNumber(

                this.firstValue(

                    this.row.amazonpackinfo_pack_size,

                    this.row.manual_pack_size,

                    this.row.pack_size,

                    1

                ),

                1

            );


        this.buyQty =

            this.positiveNumber(

                this.firstValue(

                    this.row.amazonpackinfo_buy_qty,

                    this.row.buy_qty,

                    this.packSize

                ),

                this.packSize

            );


        this.packSource =

            this.normaliseText(

                this.firstValue(

                    this.row.amazonpackinfo_pack_source,

                    this.row.pack_source,

                    ""

                )

            );






        /*
            Supplier inputs
        */


        this.supplierPrice =

            this.number(

                this.firstValue(

                    this.row.supplier_price,

                    this.row.std_supplier_price,

                    0

                ),

                0

            );


        this.unitCostExclTax =

            this.number(

                this.firstValue(

                    this.row.unit_cost_excl_tax,

                    this.row.supplier_price_used,

                    this.row.supplier_price,

                    this.row.std_supplier_price,

                    0

                ),

                0

            );


        this.packCost =

            this.number(

                this.firstValue(

                    this.row.pack_cost,

                    this.unitCostExclTax > 0

                        ? this.unitCostExclTax

                        *

                        this.buyQty

                        : 0

                ),

                0

            );






        /*
            Selling price inputs
        */


        this.validatedSellingPrice =

            this.number(

                this.firstValue(

                    this.row.validated_sales_price,

                    this.row.current_sale_price,

                    this.row.new_current,

                    this.row.new_current_price,

                    0

                ),

                0

            );


        this.targetSellingPrice =

            this.number(

                this.firstValue(

                    this.row.target_selling_price,

                    this.row._targetSellingPrice,

                    this.row.adjusted_target_selling_price,

                    this.validatedSellingPrice

                ),

                this.validatedSellingPrice

            );


        this.competitivePriceThreshold =

            this.number(

                this.firstValue(

                    this.row.competitive_price_threshold,

                    0

                ),

                0

            );






        /*
            Amazon and fulfilment fees
        */


        this.fbaFee =

            this.number(

                this.firstValue(

                    this.row.fba_fee,

                    0

                ),

                0

            );


        this.referralFeePercent =

            this.rate(

                this.firstValue(

                    this.row.referral_fee_percent,

                    this.row.referral_percent,

                    0

                ),

                0

            );


        this.referralFee =

            this.number(

                this.firstValue(

                    this.row.referral_fee,

                    this.row.referral_fee_on_buybox,

                    0

                ),

                0

            );






        /*
            Tax rates
        */


        this.taxRateOnCost =

            this.rate(

                this.firstValue(

                    this.row.tax_rate_on_cost,

                    this.row.supplier_tax_rate_on_cost,

                    this.constant(

                        [

                            "vat_rate_on_cost",

                            "vat_rate_on_cost_percent",

                            "vatRateOnCost"

                        ],

                        0

                    )

                ),

                0

            );


        this.taxRateOnSale =

            this.rate(

                this.firstValue(

                    this.row.tax_rate_on_sale,

                    this.row.supplier_tax_rate_on_sale,

                    this.constant(

                        [

                            "vat_rate_on_sale",

                            "vat_rate_on_sale_percent",

                            "vatRateOnSale"

                        ],

                        0

                    )

                ),

                0

            );






        /*
            Dashboard constants
        */


        this.targetProfit =

            this.number(

                this.constant(

                    [

                        "target_profit",

                        "targetProfit"

                    ],

                    0

                ),

                0

            );


        this.targetROI =

            this.rate(

                this.constant(

                    [

                        "target_roi",

                        "target_roi_percent",

                        "targetROI"

                    ],

                    0

                ),

                0

            );


        this.targetMargin =

            this.rate(

                this.constant(

                    [

                        "target_profit_margin",

                        "target_profit_margin_percent",

                        "targetMargin"

                    ],

                    0

                ),

                0

            );


        this.nettPrepFee =

            this.number(

                this.constant(

                    [

                        "nett_prep_fee",

                        "net_prep_fee",

                        "prep_fee",

                        "nettPrepFee"

                    ],

                    0

                ),

                0

            );


        this.fbmCost =

            this.number(

                this.constant(

                    [

                        "fbm_cost",

                        "fbmCost"

                    ],

                    0

                ),

                0

            );


        this.digitalServiceFeeRate =

            this.rate(

                this.constant(

                    [

                        "digital_service_fee",

                        "digital_service_fee_percent",

                        "digitalServiceFee"

                    ],

                    0

                ),

                0

            );


    }






    firstValue(...values){


        for(

            const value of values

        ){


            if(

                value !== undefined

                &&

                value !== null

                &&

                String(

                    value

                ).trim() !== ""

            ){


                return value;


            }


        }


        return null;


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    number(

        value,

        fallback = 0

    ){


        if(

            value === null

            ||

            value === undefined

            ||

            String(

                value

            ).trim() === ""

        ){


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

                        /[£$€\s]/g,

                        ""

                    )

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : fallback;


    }






    positiveNumber(

        value,

        fallback = 1

    ){


        const parsed =

            this.number(

                value,

                fallback

            );


        return parsed > 0

            ? parsed

            : fallback;


    }






    rate(

        value,

        fallback = 0

    ){


        const parsed =

            this.number(

                value,

                fallback

            );


        if(

            !Number.isFinite(

                parsed

            )

        ){


            return fallback;


        }


        /*
            Accept both:

            20    → 0.20
            0.20  → 0.20
        */


        return Math.abs(

            parsed

        ) > 1

            ? parsed / 100

            : parsed;


    }






    constant(

        possibleFields,

        fallback = null

    ){


        const fields =

            Array.isArray(

                possibleFields

            )

                ? possibleFields

                : [

                    possibleFields

                ];


        for(

            const field of fields

        ){


            if(

                Object.prototype.hasOwnProperty.call(

                    this.dashboardConstants,

                    field

                )

            ){


                const value =

                    this.dashboardConstants[field];


                if(

                    value !== undefined

                    &&

                    value !== null

                    &&

                    String(

                        value

                    ).trim() !== ""

                ){


                    return value;


                }


            }


        }


        return fallback;


    }






    toJSON(){


        return {

            asin:

                this.asin,


            locale:

                this.locale,


            packSize:

                this.packSize,


            buyQty:

                this.buyQty,


            packSource:

                this.packSource,


            supplierPrice:

                this.supplierPrice,


            unitCostExclTax:

                this.unitCostExclTax,


            packCost:

                this.packCost,


            validatedSellingPrice:

                this.validatedSellingPrice,


            targetSellingPrice:

                this.targetSellingPrice,


            competitivePriceThreshold:

                this.competitivePriceThreshold,


            fbaFee:

                this.fbaFee,


            referralFeePercent:

                this.referralFeePercent,


            referralFee:

                this.referralFee,


            taxRateOnCost:

                this.taxRateOnCost,


            taxRateOnSale:

                this.taxRateOnSale,


            targetProfit:

                this.targetProfit,


            targetROI:

                this.targetROI,


            targetMargin:

                this.targetMargin,


            nettPrepFee:

                this.nettPrepFee,


            fbmCost:

                this.fbmCost,


            digitalServiceFeeRate:

                this.digitalServiceFeeRate

        };


    }


}