export class VatCalculator {


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






    resolveVatRateOnCost(

        input,

        settings

    ){


        return this.rate(

            input.taxRateOnCost

            ??

            input.row?.tax_rate_on_cost

            ??

            input.row?.supplier_tax_rate_on_cost

            ??

            settings.vatRateOnCostPercent

            ??

            settings.vat_on_cost_percent

            ??

            0,

            0

        );


    }






    resolveVatRateOnSale(

        input,

        settings

    ){


        return this.rate(

            input.taxRateOnSale

            ??

            input.row?.tax_rate_on_sale

            ??

            input.row?.supplier_tax_rate_on_sale

            ??

            settings.vatRateOnSalePercent

            ??

            settings.vat_on_sale_percent

            ??

            0,

            0

        );


    }






    resolveVatRateOnFees(

        input,

        settings

    ){


        /*
            OpportunityOS uses the general VAT rate for
            VAT applied to Amazon and preparation fees.

            Fall back to the sale VAT rate when no separate
            general VAT rate is supplied.
        */


        return this.rate(

            input.vatRatePercent

            ??

            input.row?.vat_rate_percent

            ??

            settings.vatRatePercent

            ??

            settings.vatRateOnSalePercent

            ??

            input.taxRateOnSale

            ??

            0,

            0

        );


    }






    calculateVatInclusiveAmount(

        vatInclusiveAmount,

        vatRate

    ){


        const amount =

            this.number(

                vatInclusiveAmount,

                0

            );


        const rate =

            this.rate(

                vatRate,

                0

            );


        if(

            amount === 0

            ||

            rate === 0

        ){


            return 0;


        }


        return this.roundMoney(

            amount

            -

            (

                amount

                /

                (

                    1

                    +

                    rate

                )

            )

        );


    }






    calculate(input = {}){


        const settings =

            this.getSettings(

                input

            );


        const fees =

            input.fees

            &&

            typeof input.fees === "object"

                ? input.fees

                : {};


        const salePrice =

            this.number(

                input.salePrice,

                0

            );


        const packCostInclTax =

            this.number(

                input.packCostInclTax,

                0

            );


        const vatRateOnCost =

            this.resolveVatRateOnCost(

                input,

                settings

            );


        const vatRateOnSale =

            this.resolveVatRateOnSale(

                input,

                settings

            );


        const vatRateOnFees =

            this.resolveVatRateOnFees(

                input,

                settings

            );






        /*
            VAT on sale:

            Sale Price
            −
            Sale Price / (1 + Sale VAT Rate)
        */


        const vatOnSale =

            this.calculateVatInclusiveAmount(

                salePrice,

                vatRateOnSale

            );






        /*
            VAT on cost:

            Pack Cost Including VAT
            −
            Pack Cost Including VAT / (1 + Cost VAT Rate)

            FinancialEngine may already have calculated this
            amount. Preserve the supplied amount when present.
        */


        const suppliedPackTaxAmount =

            this.number(

                input.packTaxAmount,

                0

            );


        const vatOnCost =

            suppliedPackTaxAmount !== 0

                ? this.roundMoney(

                    suppliedPackTaxAmount

                )

                : this.calculateVatInclusiveAmount(

                    packCostInclTax,

                    vatRateOnCost

                );






        /*
            VAT on fees:

            Total Fees Excluding VAT
            ×
            General VAT Rate
        */


        const totalFeesExTax =

            this.number(

                fees.totalFeesExTax,

                0

            );


        const vatOnFees =

            this.roundMoney(

                totalFeesExTax

                *

                vatRateOnFees

            );






        /*
            Canonical OpportunityOS rule:

            VAT Due =
            VAT on Sale
            − VAT on Cost
            − VAT on Fees
        */


        const vatDue =

            this.roundMoney(

                vatOnSale

                -

                vatOnCost

                -

                vatOnFees

            );


        const totalFeesIncludingVatOnFees =

            this.roundMoney(

                totalFeesExTax

                +

                vatOnFees

            );


        return {

            vatRateOnCost:

                vatRateOnCost,


            vatRateOnSale:

                vatRateOnSale,


            vatRateOnFees:

                vatRateOnFees,


            vatOnSale:

                vatOnSale,


            sellingPriceTax:

                vatOnSale,


            vatOnCost:

                vatOnCost,


            costVatAmount:

                vatOnCost,


            vatOnFees:

                vatOnFees,


            taxOnFees:

                vatOnFees,


            vatDue:

                vatDue,


            taxDue:

                vatDue,


            totalFeesIncludingVatOnFees:

                totalFeesIncludingVatOnFees,


            totalFeesForProfit:

                totalFeesIncludingVatOnFees

        };


    }


}