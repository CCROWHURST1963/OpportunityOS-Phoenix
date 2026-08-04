export class MaxCostAtPrice {


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

                "MaxCostAtPrice requires FinancialEngine.calculate()"

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






    normaliseMethod(

        value,

        fallback = "roi"

    ){


        const method =

            String(

                value

                ??

                ""

            )

                .trim()

                .toLowerCase();


        if(

            method === "profit"

            ||

            method === "target profit"

        ){


            return "profit";


        }


        if(

            method === "margin"

            ||

            method === "profit margin"

            ||

            method === "target margin"

        ){


            return "margin";


        }


        if(

            method === "roi"

            ||

            method === "return on investment"

            ||

            method === "target roi"

        ){


            return "roi";


        }


        return fallback;


    }






    getSettings(context){


        const settings =

            context?.row?.calculationSettings

            ??

            context?.calculationSettings

            ??

            context?.dashboardConstants;


        return settings

        &&

        typeof settings === "object"

            ? settings

            : {};


    }






    resolveMethod(

        context,

        rowInputs

    ){


        const settings =

            this.getSettings(

                context

            );


        const row = {

            ...(context?.row

                ??

                {}),


            ...(rowInputs

                ??

                {})

        };


        const hasSupplierCost =

            Boolean(

                row.hasSupplierCostForTarget

                ??

                row.has_supplier_cost

                ??

                false

            );


        const supplierMethod =

            settings.maxCostMethod

            ??

            settings.max_cost_calc

            ??

            row.max_cost_method

            ??

            row.max_cost_calc

            ??

            "ROI";


        const noSupplierMethod =

            settings.maxCostNoSupplierMethod

            ??

            settings.maxCostCalcNoSupplier

            ??

            settings.max_cost_calc_no_supplier

            ??

            row.max_cost_no_supplier_method

            ??

            row.max_cost_calc_no_supplier

            ??

            supplierMethod;


        return this.normaliseMethod(

            hasSupplierCost

                ? supplierMethod

                : noSupplierMethod,

            "roi"

        );


    }






    resolveTargetRoi(context){


        const settings =

            this.getSettings(

                context

            );


        return this.number(

            settings.targetRoiPercent

            ??

            settings.target_roi

            ??

            settings.target_roi_percent

            ??

            context?.targetROI

            ??

            0,

            0

        );


    }






    resolveTargetMargin(context){


        const settings =

            this.getSettings(

                context

            );


        return this.number(

            settings.targetMarginPercent

            ??

            settings.target_profit_margin

            ??

            settings.target_profit_margin_percent

            ??

            context?.targetMargin

            ??

            0,

            0

        );


    }






    resolveTargetProfit(context){


        const settings =

            this.getSettings(

                context

            );


        return this.number(

            settings.targetProfitAmount

            ??

            settings.target_profit

            ??

            context?.targetProfit

            ??

            0,

            0

        );


    }






    resolveTaxRateOnCost(

        context,

        rowInputs,

        suppliedRate

    ){


        const settings =

            this.getSettings(

                context

            );


        const row = {

            ...(context?.row

                ??

                {}),


            ...(rowInputs

                ??

                {})

        };


        return this.rate(

            suppliedRate

            ??

            row.taxRateOnCostForTarget

            ??

            row.tax_rate_on_cost

            ??

            row.supplier_tax_rate_on_cost

            ??

            settings.vatRateOnCostPercent

            ??

            settings.vat_on_cost

            ??

            settings.vatRatePercent

            ??

            0,

            0

        );


    }






    resultToJSON(result){


        if(

            result

            &&

            typeof result.toJSON === "function"

        ){


            return result.toJSON();


        }


        return result

        &&

        typeof result === "object"

            ? result

            : {};


    }






    getAsin(

        context,

        rowInputs

    ){


        return String(

            rowInputs?.asin

            ??

            rowInputs?._asin

            ??

            context?.row?.asin

            ??

            context?.asin

            ??

            ""

        )

            .trim()

            .toUpperCase();


    }






    async calculate({

        salePrice,

        context,

        taxRateOnCost = null,

        taxRateOnSale = null,

        rowInputs = {},

        method = null

    } = {}){


        this.ensureAvailable();


        const resolvedSalePrice =

            this.number(

                salePrice,

                0

            );


        if(resolvedSalePrice <= 0){


            return 0;


        }


        const resolvedTaxRateOnCost =

            this.resolveTaxRateOnCost(

                context,

                rowInputs,

                taxRateOnCost

            );


        const selectedMethod =

            method

                ? this.normaliseMethod(

                    method,

                    "roi"

                )

                : this.resolveMethod(

                    context,

                    rowInputs

                );


        /*
            Calculate the available profit before cost.

            Running FinancialEngine with zero cost gives the
            cost-free financial position at this sale price.
        */


        const zeroCostFinancialResult =

            await this.financialEngine.calculate({

                row:{

                    ...(context?.row

                        ??

                        {}),


                    ...(rowInputs

                        ??

                        {}),


                    unit_cost_excl_tax:

                        0,


                    supplier_price:

                        0,


                    supplier_price_used:

                        0,


                    pack_cost:

                        0,


                    pack_cost_ex_tax:

                        0,


                    pack_cost_incl_tax:

                        0,


                    pack_tax_amount:

                        0,


                    tax_on_pack_cost:

                        0

                },


                settings:

                    this.getSettings(

                        context

                    ),


                salePrice:

                    resolvedSalePrice,


                unitCostExclTax:

                    0,


                buyQty:

                    1,


                packCostExTax:

                    0,


                packCostInclTax:

                    0,


                packTaxAmount:

                    0,


                taxRateOnCost:

                    resolvedTaxRateOnCost,


                taxRateOnSale:

                    taxRateOnSale

            });


        const financial =

            this.resultToJSON(

                zeroCostFinancialResult

            );


        const profitWithoutCost =

            this.number(

                financial?.values?.profit,

                0

            );


        const targetRoi =

            this.resolveTargetRoi(

                context

            );


        const targetMargin =

            this.resolveTargetMargin(

                context

            );


        const targetProfit =

            this.resolveTargetProfit(

                context

            );


        let maximumCostExcludingVat =

            0;


        if(selectedMethod === "profit"){


            maximumCostExcludingVat =

                profitWithoutCost

                -

                targetProfit;


        }

        else if(selectedMethod === "margin"){


            maximumCostExcludingVat =

                profitWithoutCost

                -

                (

                    resolvedSalePrice

                    *

                    (

                        targetMargin

                        /

                        100

                    )

                );


        }

        else {


            maximumCostExcludingVat =

                profitWithoutCost

                /

                (

                    1

                    +

                    (

                        targetRoi

                        /

                        100

                    )

                );


        }


        const maximumCostIncludingVat =

            maximumCostExcludingVat

            *

            (

                1

                +

                resolvedTaxRateOnCost

            );


        const roundedMaximumCost =

            this.roundMoney(

                maximumCostIncludingVat

            );






        /*
            Temporary parity trace.

            Negative values are deliberately preserved.
        */


        console.log(

            "[PHX MAX COST TRACE]",

            {

                asin:

                    this.getAsin(

                        context,

                        rowInputs

                    ),


                salePrice:

                    resolvedSalePrice,


                selectedMethod:

                    selectedMethod,


                profitWithoutCost:

                    profitWithoutCost,


                targetRoi:

                    targetRoi,


                targetMargin:

                    targetMargin,


                targetProfit:

                    targetProfit,


                taxRateOnCost:

                    resolvedTaxRateOnCost,


                maximumCostExcludingVat:

                    maximumCostExcludingVat,


                maximumCostIncludingVat:

                    maximumCostIncludingVat,


                roundedMaximumCost:

                    roundedMaximumCost,


                financial:

                    financial

            }

        );


        return roundedMaximumCost;


    }


}