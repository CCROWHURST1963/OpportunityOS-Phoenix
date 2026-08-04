import { FinancialEngine }
    from "../engines/financial/FinancialEngine.js";


import { FeeCalculator }
    from "../engines/financial/FeeCalculator.js";


import { VatCalculator }
    from "../engines/financial/VatCalculator.js";


import { ProfitCalculator }
    from "../engines/financial/ProfitCalculator.js";



export class FinancialParityTest {


    constructor(){


        this.financialEngine =

            new FinancialEngine({

                feeCalculator:

                    new FeeCalculator(),


                vatCalculator:

                    new VatCalculator(),


                profitCalculator:

                    new ProfitCalculator()

            });


        this.moneyTolerance =

            0.01;


        this.percentTolerance =

            0.01;


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

        fallback = null

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






    getState(){


        if(

            window.phoenixState

            &&

            typeof window.phoenixState.getState ===

                "function"

        ){


            return window.phoenixState.getState();


        }


        const dashboardController =

            window.phoenixContainer

            &&

            typeof window.phoenixContainer.get ===

                "function"

                ? window.phoenixContainer.get(

                    "dashboardController"

                )

                : null;


        if(

            dashboardController?.appState

            &&

            typeof dashboardController.appState.getState ===

                "function"

        ){


            return dashboardController.appState.getState();


        }


        throw new Error(

            "Phoenix AppState is not available. Load Phoenix before running the parity test."

        );


    }






    findRow(asin){


        const resolvedAsin =

            this.normaliseText(

                asin

            ).toUpperCase();


        if(!resolvedAsin){


            throw new Error(

                "An ASIN is required"

            );


        }


        const state =

            this.getState();


        const rows =

            Array.isArray(

                state.rows

            )

                ? state.rows

                : [];


        const row =

            rows.find(

                item =>

                    this.normaliseText(

                        item?.asin

                        ??

                        item?._asin

                        ??

                        item?.matched_asin

                        ??

                        item?.ASIN

                    ).toUpperCase() ===

                        resolvedAsin

            );


        if(!row){


            throw new Error(

                `ASIN ${resolvedAsin} is not present in the loaded dashboard`

            );


        }


        return row;


    }






    extractPhoenixValues(financialResult){


        const output =

            financialResult

            &&

            typeof financialResult.toJSON ===

                "function"

                ? financialResult.toJSON()

                : financialResult;


        const values =

            output?.values

            ??

            {};


        const fees =

            output?.fees

            ??

            {};


        const tax =

            output?.tax

            ??

            {};


        return {

            referralFee:

                this.number(

                    fees.referralFee,

                    0

                ),


            baseFbaFee:

                this.number(

                    fees.baseFbaFee,

                    0

                ),


            fbaFee:

                this.number(

                    fees.fbaFee

                    ??

                    fees.adjustedFbaFee,

                    0

                ),


            prepFee:

                this.number(

                    fees.prepFee,

                    0

                ),


            digitalServiceFee:

                this.number(

                    fees.digitalServiceFee,

                    0

                ),


            totalFeesExTax:

                this.number(

                    fees.totalFeesExTax,

                    0

                ),


            vatOnSale:

                this.number(

                    tax.vatOnSale

                    ??

                    tax.sellingPriceTax,

                    0

                ),


            vatOnCost:

                this.number(

                    tax.vatOnCost

                    ??

                    tax.costVatAmount,

                    0

                ),


            vatOnFees:

                this.number(

                    tax.vatOnFees

                    ??

                    tax.taxOnFees,

                    0

                ),


            vatDue:

                this.number(

                    tax.vatDue

                    ??

                    tax.taxDue,

                    0

                ),


            profit:

                this.number(

                    values.profit,

                    0

                ),


            roi:

                this.number(

                    values.roiPercent

                    ??

                    values.roi,

                    0

                ),


            margin:

                this.number(

                    values.marginPercent

                    ??

                    values.margin,

                    0

                )

        };


    }






    compareValue(

        field,

        phoenixValue,

        legacyValue

    ){


        if(!this.hasValue(legacyValue)){


            return {

                field:

                    field,


                phoenix:

                    phoenixValue,


                legacy:

                    null,


                difference:

                    null,


                result:

                    "NOT PROVIDED"

            };


        }


        const resolvedPhoenix =

            this.number(

                phoenixValue,

                0

            );


        const resolvedLegacy =

            this.number(

                legacyValue,

                0

            );


        const difference =

            resolvedPhoenix

            -

            resolvedLegacy;


        const tolerance =

            [

                "roi",

                "margin"

            ].includes(

                field

            )

                ? this.percentTolerance

                : this.moneyTolerance;


        return {

            field:

                field,


            phoenix:

                resolvedPhoenix,


            legacy:

                resolvedLegacy,


            difference:

                Number(

                    difference.toFixed(

                        4

                    )

                ),


            result:

                Math.abs(

                    difference

                ) <= tolerance

                    ? "PASS"

                    : "FAIL"

        };


    }






    compare(

        phoenixValues,

        legacyValues = {}

    ){


        const fields = [

            "referralFee",

            "baseFbaFee",

            "fbaFee",

            "prepFee",

            "digitalServiceFee",

            "totalFeesExTax",

            "vatOnSale",

            "vatOnCost",

            "vatOnFees",

            "vatDue",

            "profit",

            "roi",

            "margin"

        ];


        return fields.map(

            field =>

                this.compareValue(

                    field,

                    phoenixValues[field],

                    legacyValues[field]

                )

        );


    }






    async run({

        asin,

        legacy = {},

        overrides = {}

    } = {}){


        const row =

            this.findRow(

                asin

            );


        const financialResult =

            await this.financialEngine.calculate({

                row:

                    row,


                settings:

                    row.calculationSettings

                    ??

                    {},


                salePrice:

                    overrides.salePrice

                    ??

                    row.target_selling_price

                    ??

                    row._targetSellingPrice

                    ??

                    row.validated_sales_price,


                unitCostExclTax:

                    overrides.unitCostExclTax

                    ??

                    row.unit_cost_excl_tax

                    ??

                    row.supplier_price_used

                    ??

                    row.supplier_price,


                buyQty:

                    overrides.buyQty

                    ??

                    row.buy_qty

                    ??

                    row.amazonpackinfo_buy_qty

                    ??

                    row.pack_size,


                packCostExTax:

                    overrides.packCostExTax,


                packCostInclTax:

                    overrides.packCostInclTax,


                taxRateOnCost:

                    overrides.taxRateOnCost,


                taxRateOnSale:

                    overrides.taxRateOnSale

            });


        const phoenixValues =

            this.extractPhoenixValues(

                financialResult

            );


        const comparison =

            this.compare(

                phoenixValues,

                legacy

            );


        const comparedRows =

            comparison.filter(

                item =>

                    item.result !==

                        "NOT PROVIDED"

            );


        const failures =

            comparedRows.filter(

                item =>

                    item.result ===

                        "FAIL"

            );


        const summary = {

            asin:

                this.normaliseText(

                    asin

                ).toUpperCase(),


            compared:

                comparedRows.length,


            passed:

                comparedRows.length

                -

                failures.length,


            failed:

                failures.length,


            status:

                comparedRows.length === 0

                    ? "PHOENIX VALUES ONLY"

                    : failures.length === 0

                        ? "ALL TESTS PASSED"

                        : "PARITY FAILED"

        };


        console.log(

            "================ PHOENIX FINANCIAL PARITY ================"

        );


        console.log(

            "ASIN:",

            summary.asin

        );


        console.table(

            comparison

        );


        console.log(

            "Summary:",

            summary

        );


        console.log(

            "Phoenix financial result:",

            financialResult.toJSON()

        );


        console.log(

            "Source row:",

            row

        );


        return {

            summary:

                summary,


            comparison:

                comparison,


            phoenix:

                phoenixValues,


            legacy:

                {

                    ...legacy

                },


            financialResult:

                financialResult.toJSON(),


            row:

                row

        };


    }


}





const financialParityTest =

    new FinancialParityTest();



window.financialParityTest =

    financialParityTest;



window.runPhoenixFinancialParityTest =

    options =>

        financialParityTest.run(

            options

        );



console.log(

    "[PHX FINANCIAL PARITY TEST READY]"

);