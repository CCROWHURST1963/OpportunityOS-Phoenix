export class ProfitAtPrice {


    constructor(

        financialEngine

    ){


        this.financialEngine =

            financialEngine;


    }






    ensureAvailable(){


        if(

            !this.financialEngine

            ||

            typeof this.financialEngine.calculate !==

                "function"

        ){


            throw new Error(

                "ProfitAtPrice requires FinancialEngine.calculate()"

            );


        }


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

                    .trim()

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






    getRow(

        context,

        rowInputs = {}

    ){


        return {

            ...(context?.row

                ??

                {}),


            ...(rowInputs

                ??

                {})

        };


    }






    getSettings(

        context,

        row

    ){


        const settings =

            row?.calculationSettings

            ??

            context?.calculationSettings

            ??

            context?.dashboardConstants;


        return settings

        &&

        typeof settings ===

            "object"

            ? settings

            : {};


    }






    getTaxRateOnCost(

        context,

        row

    ){


        return this.rate(

            row?.taxRateOnCostForTarget

            ??

            row?.tax_rate_on_cost

            ??

            row?.supplier_tax_rate_on_cost

            ??

            context?.taxRateOnCost

            ??

            0,

            0

        );


    }






    getBuyQty(row){


        const value =

            this.number(

                row?.amazonpackinfo_buy_qty

                ??

                row?.buy_qty

                ??

                row?.amazonpackinfo_pack_size

                ??

                row?.pack_size

                ??

                1,

                1

            );


        return value > 0

            ? value

            : 1;


    }






    resultToJSON(result){


        if(

            result

            &&

            typeof result.toJSON ===

                "function"

        ){


            return result.toJSON();


        }


        return result

        &&

        typeof result ===

            "object"

            ? result

            : {};


    }






    async calculate({

        salePrice,

        packCostInclTax = 0,

        context,

        taxRateOnSale = null,

        rowInputs = {},

        packTaxAmount = 0

    } = {}){


        this.ensureAvailable();


        const row =

            this.getRow(

                context,

                rowInputs

            );


        const settings =

            this.getSettings(

                context,

                row

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


        const taxRateOnCost =

            this.getTaxRateOnCost(

                context,

                row

            );


        const suppliedPackTaxAmount =

            this.number(

                packTaxAmount,

                0

            );


        const resolvedPackCostExTax =

            resolvedPackCostInclTax > 0

                ? taxRateOnCost > 0

                    ? resolvedPackCostInclTax

                        /

                        (

                            1

                            +

                            taxRateOnCost

                        )

                    : resolvedPackCostInclTax

                : 0;


        const resolvedPackTaxAmount =

            suppliedPackTaxAmount !== 0

                ? suppliedPackTaxAmount

                : resolvedPackCostInclTax

                    -

                    resolvedPackCostExTax;


        const financialResult =

            await this.financialEngine.calculate({

                row:

                    row,


                settings:

                    settings,


                salePrice:

                    resolvedSalePrice,


                unitCostExclTax:

                    resolvedPackCostExTax,


                buyQty:

                    this.getBuyQty(

                        row

                    ),


                packCostExTax:

                    resolvedPackCostExTax,


                packCostInclTax:

                    resolvedPackCostInclTax,


                packTaxAmount:

                    resolvedPackTaxAmount,


                taxRateOnCost:

                    taxRateOnCost,


                taxRateOnSale:

                    taxRateOnSale

            });


        const financial =

            this.resultToJSON(

                financialResult

            );


        const values =

            financial.values

            &&

            typeof financial.values ===

                "object"

                ? financial.values

                : {};


        const fees =

            financial.fees

            &&

            typeof financial.fees ===

                "object"

                ? financial.fees

                : {};


        const tax =

            financial.tax

            &&

            typeof financial.tax ===

                "object"

                ? financial.tax

                : {};


        return {

            fees:

                {

                    ...fees,


                    taxDue:

                        tax.taxDue

                        ??

                        tax.vatDue

                        ??

                        0,


                    totalFeesForProfit:

                        tax.totalFeesForProfit

                        ??

                        tax.totalFeesIncludingVatOnFees

                        ??

                        fees.totalFeesExTax

                        ??

                        0

                },


            tax:

                tax,


            profit:

                this.number(

                    values.profit,

                    0

                ),


            roiPercent:

                this.number(

                    values.roiPercent

                    ??

                    values.roi,

                    0

                ),


            marginPercent:

                this.number(

                    values.marginPercent

                    ??

                    values.margin,

                    0

                ),


            financial:

                financial

        };


    }


}