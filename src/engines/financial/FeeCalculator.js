export class FeeCalculator {


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

            )

            .trim();


    }






    firstNumber(

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






    getSettings(input){


        const settings =

            input?.settings

            ??

            input?.calculationSettings

            ??

            input?.row?.calculationSettings;


        return settings

        &&

        typeof settings === "object"

            ? settings

            : {};


    }






    getCategory(row){


        return row?._category

        ??

        row?.categories_root

        ??

        row?.category

        ??

        row?.product_category

        ??

        "";


    }






    isTenPoundLowPriceCategory(category){


        const normalisedCategory =

            this.normaliseCategoryText(

                category

            );


        return this.tenPoundCategoryKeys.some(

            key =>

                normalisedCategory.includes(

                    key

                )

        );


    }






    getLowPriceFbaThreshold(row){


        if(

            row

            &&

            typeof row === "object"

            &&

            row.__phoenixLowPriceFbaThresholdCached ===

                true

        ){


            return row.__phoenixLowPriceFbaThreshold;


        }


        const threshold =

            this.isTenPoundLowPriceCategory(

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


            row.__phoenixLowPriceFbaThreshold =

                threshold;


            row.__phoenixLowPriceFbaThresholdCached =

                true;


        }


        return threshold;


    }






    resolveReferralPercentage(

        row,

        settings

    ){


        if(

            this.hasValue(

                row?.referralFeePercentRaw

            )

        ){


            return this.rate(

                row.referralFeePercentRaw,

                0

            );


        }


        if(

            this.hasValue(

                row?._referralFeePercentRaw

            )

        ){


            return this.rate(

                row._referralFeePercentRaw,

                0

            );


        }


        if(

            this.hasValue(

                row?.referral_fee_percent

            )

        ){


            return this.rate(

                row.referral_fee_percent,

                0

            );


        }


        return this.rate(

            settings.referralFeePercent

            ??

            settings.referral_fee_percent

            ??

            0,

            0

        );


    }






    resolveLowPriceFbaFee(row){


        return this.firstNumber(

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


    }






    resolveStandardFbaFee(row){


        return this.firstNumber(

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

            0

        );


    }






    resolveFbaFeeForPrice(

        salePrice,

        row

    ){


        const threshold =

            this.getLowPriceFbaThreshold(

                row

            );


        const lowPriceFee =

            this.resolveLowPriceFbaFee(

                row

            );


        const standardFee =

            this.resolveStandardFbaFee(

                row

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






    resolveFuelSurchargePercent(settings){


        if(

            this.hasValue(

                settings.fuelSurchargePercent

            )

        ){


            return this.number(

                settings.fuelSurchargePercent,

                1.5

            );


        }


        if(

            this.hasValue(

                settings.fuel_surcharge_percent

            )

        ){


            return this.number(

                settings.fuel_surcharge_percent,

                1.5

            );


        }


        return 1.5;


    }






    applyFuelSurcharge(

        baseFee,

        fuelSurchargePercent

    ){


        return this.roundMoney(

            this.number(

                baseFee,

                0

            )

            *

            (

                1

                +

                (

                    this.number(

                        fuelSurchargePercent,

                        1.5

                    )

                    /

                    100

                )

            )

        );


    }






    resolvePrepFee(

        row,

        settings

    ){


        if(

            this.hasValue(

                row?.nettPrepFeeRaw

            )

        ){


            return this.number(

                row.nettPrepFeeRaw,

                0

            );


        }


        if(

            this.hasValue(

                row?._nettPrepFee

            )

        ){


            return this.number(

                row._nettPrepFee,

                0

            );


        }


        if(

            this.hasValue(

                row?.nett_prep_fee

            )

        ){


            return this.number(

                row.nett_prep_fee,

                0

            );


        }


        if(

            this.hasValue(

                settings.nettPrepFee

            )

        ){


            return this.number(

                settings.nettPrepFee,

                0

            );


        }


        return this.number(

            settings.prepFee

            ??

            settings.nett_prep_fee

            ??

            0,

            0

        );


    }






    resolveDigitalServiceFeeRate(

        row,

        settings

    ){


        if(

            this.hasValue(

                row?.digitalTaxFeePercentRaw

            )

        ){


            return this.rate(

                row.digitalTaxFeePercentRaw,

                0

            );


        }


        if(

            this.hasValue(

                row?._digitalTaxFeePercentRaw

            )

        ){


            return this.rate(

                row._digitalTaxFeePercentRaw,

                0

            );


        }


        if(

            this.hasValue(

                row?.digital_tax_fee_percent

            )

        ){


            return this.rate(

                row.digital_tax_fee_percent,

                0

            );


        }


        if(

            this.hasValue(

                row?.digital_service_fee_percent

            )

        ){


            return this.rate(

                row.digital_service_fee_percent,

                0

            );


        }


        return this.rate(

            settings.digitalServiceFeePercent

            ??

            settings.digitalTaxFeePercent

            ??

            settings.digitalServiceFee

            ??

            settings.digitalTaxFee

            ??

            0,

            0

        );


    }






    calculate(input = {}){


        const row =

            input.row

            &&

            typeof input.row === "object"

                ? input.row

                : {};


        const settings =

            this.getSettings(

                input

            );


        const salePrice =

            Math.max(

                0,

                this.number(

                    input.salePrice,

                    0

                )

            );


        const referralFeePercent =

            this.resolveReferralPercentage(

                row,

                settings

            );


        const referralFeeRaw =

            salePrice

            *

            referralFeePercent;


        const fba =

            this.resolveFbaFeeForPrice(

                salePrice,

                row

            );


        const baseFbaFee =

            this.number(

                fba.fee,

                0

            );


        const fuelSurchargePercent =

            this.resolveFuelSurchargePercent(

                settings

            );


        const adjustedFbaFee =

            this.applyFuelSurcharge(

                baseFbaFee,

                fuelSurchargePercent

            );


        const prepFeeRaw =

            this.resolvePrepFee(

                row,

                settings

            );


        const digitalServiceFeePercent =

            this.resolveDigitalServiceFeeRate(

                row,

                settings

            );






        /*
            Canonical OpportunityOS rule:

            Digital service fee base =
            Referral Fee + adjusted FBA Fee.
        */


        const digitalServiceFeeBaseRaw =

            referralFeeRaw

            +

            adjustedFbaFee;


        const digitalServiceFeeRaw =

            digitalServiceFeeBaseRaw

            *

            digitalServiceFeePercent;


        const totalFeesExTaxRaw =

            referralFeeRaw

            +

            adjustedFbaFee

            +

            prepFeeRaw

            +

            digitalServiceFeeRaw;


        return {

            referralFee:

                this.roundMoney(

                    referralFeeRaw

                ),


            referralFeePercent:

                referralFeePercent,


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


            fbaFee:

                this.roundMoney(

                    adjustedFbaFee

                ),


            fbaProgramme:

                fba.programme,


            useLowPriceFba:

                fba.useLowPriceFba,


            lowPriceFbaThreshold:

                fba.lowPriceThreshold,


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

                    prepFeeRaw

                ),


            digitalServiceFeePercent:

                digitalServiceFeePercent,


            digitalServiceFeeBase:

                this.roundMoney(

                    digitalServiceFeeBaseRaw

                ),


            digitalServiceFee:

                this.roundMoney(

                    digitalServiceFeeRaw

                ),


            totalFeesExTax:

                this.roundMoney(

                    totalFeesExTaxRaw

                )

        };


    }


}