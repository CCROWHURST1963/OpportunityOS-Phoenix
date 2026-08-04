export class ProfitCalculator {


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


        if(

            !this.hasValue(

                value

            )

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


        return Math.round(

            (

                this.number(

                    value

                )

                +

                Number.EPSILON

            )

            *

            100

        )

        /

        100;


    }






    roundPercent(value){


        return Math.round(

            (

                this.number(

                    value

                )

                +

                Number.EPSILON

            )

            *

            100

        )

        /

        100;


    }






    getAsin(input){


        return String(

            input?.row?.asin

            ??

            input?.row?._asin

            ??

            input?.row?.matched_asin

            ??

            input?.asin

            ??

            ""

        )

            .trim()

            .toUpperCase();


    }






    calculate(input = {}){


        const salePrice =

            this.number(

                input.salePrice,

                0

            );


        const packCost =

            this.number(

                input.packCostInclTax,

                0

            );


        const fees =

            input.fees

            &&

            typeof input.fees ===

                "object"

                ? input.fees

                : {};


        const tax =

            input.tax

            &&

            typeof input.tax ===

                "object"

                ? input.tax

                : {};






        /*
            Canonical OpportunityOS formula

            Profit =
            Sale Price
            - Pack Cost
            - Total Fees (including VAT on fees)
            - VAT Due
        */


        const totalFees =

            this.number(

                tax.totalFeesForProfit

                ??

                tax.totalFeesIncludingVatOnFees

                ??

                fees.totalFeesExTax,

                0

            );


        const vatDue =

            this.number(

                tax.taxDue

                ??

                tax.vatDue,

                0

            );


        const profit =

            salePrice

            -

            packCost

            -

            totalFees

            -

            vatDue;






        /*
            Temporary targeted diagnostic.

            This exposes every value used to calculate
            the zero-cost profit for B07F84FJ8N.

            Calculation behaviour is unchanged.
        */


        const debugAsin =

            this.getAsin(

                input

            );


        if(

            debugAsin ===

                "B07F84FJ8N"

        ){


            console.group(

                "[PHX PROFIT CALCULATION B07F84FJ8N]"

            );


            console.log(

                "CORE PROFIT INPUTS",

                {

                    asin:

                        debugAsin,


                    salePrice:

                        salePrice,


                    packCost:

                        packCost,


                    totalFees:

                        totalFees,


                    vatDue:

                        vatDue,


                    calculatedProfit:

                        profit,


                    roundedProfit:

                        this.roundMoney(

                            profit

                        )

                }

            );


            console.log(

                "FORMULA",

                `${salePrice}`
                +
                ` - ${packCost}`
                +
                ` - ${totalFees}`
                +
                ` - ${vatDue}`
                +
                ` = ${profit}`

            );


            console.log(

                "FEE COMPONENTS",

                {

                    referralFee:

                        fees.referralFee,


                    referralFeePercent:

                        fees.referralFeePercent,


                    baseFbaFee:

                        fees.baseFbaFee,


                    fbaFee:

                        fees.fbaFee,


                    adjustedFbaFee:

                        fees.adjustedFbaFee,


                    fuelSurchargePercent:

                        fees.fuelSurchargePercent,


                    prepFee:

                        fees.prepFee,


                    digitalTaxBase:

                        fees.digitalTaxBase,


                    digitalTaxFeePercent:

                        fees.digitalTaxFeePercent,


                    digitalTaxFee:

                        fees.digitalTaxFee,


                    totalFeesExTax:

                        fees.totalFeesExTax,


                    totalFees:

                        fees.totalFees

                }

            );


            console.log(

                "VAT COMPONENTS",

                {

                    vatRateOnCost:

                        tax.vatRateOnCost,


                    vatRateOnSale:

                        tax.vatRateOnSale,


                    vatRateOnFees:

                        tax.vatRateOnFees,


                    vatOnSale:

                        tax.vatOnSale

                        ??

                        tax.sellingPriceTax,


                    vatOnCost:

                        tax.vatOnCost

                        ??

                        tax.costVatAmount,


                    vatOnFees:

                        tax.vatOnFees

                        ??

                        tax.taxOnFees,


                    totalFeesIncludingVatOnFees:

                        tax.totalFeesIncludingVatOnFees,


                    totalFeesForProfit:

                        tax.totalFeesForProfit,


                    vatDue:

                        tax.vatDue

                        ??

                        tax.taxDue

                }

            );


            console.log(

                "FULL FEES OBJECT",

                fees

            );


            console.log(

                "FULL TAX OBJECT",

                tax

            );


            console.log(

                "FULL PROFIT INPUT",

                input

            );


            console.groupEnd();


        }






        const roi =

            packCost > 0

                ? (

                    profit

                    /

                    packCost

                )

                *

                100

                : 0;


        const margin =

            salePrice > 0

                ? (

                    profit

                    /

                    salePrice

                )

                *

                100

                : 0;






        return {

            profit:

                this.roundMoney(

                    profit

                ),


            roi:

                this.roundPercent(

                    roi

                ),


            roiPercent:

                this.roundPercent(

                    roi

                ),


            margin:

                this.roundPercent(

                    margin

                ),


            marginPercent:

                this.roundPercent(

                    margin

                ),


            salePrice:

                this.roundMoney(

                    salePrice

                ),


            packCost:

                this.roundMoney(

                    packCost

                ),


            totalFees:

                this.roundMoney(

                    totalFees

                ),


            vatDue:

                this.roundMoney(

                    vatDue

                )

        };


    }


}