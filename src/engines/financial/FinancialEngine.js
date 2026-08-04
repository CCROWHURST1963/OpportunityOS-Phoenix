import { FinancialResult }
    from "./FinancialResult.js";



export class FinancialEngine {


    constructor({

        feeCalculator = null,

        vatCalculator = null,

        profitCalculator = null

    } = {}){


        this.version =

            "1.0.0";


        this.feeCalculator =

            feeCalculator;


        this.vatCalculator =

            vatCalculator;


        this.profitCalculator =

            profitCalculator;


    }






    setFeeCalculator(calculator){


        this.feeCalculator =

            calculator;


        return this;


    }






    setVatCalculator(calculator){


        this.vatCalculator =

            calculator;


        return this;


    }






    setProfitCalculator(calculator){


        this.profitCalculator =

            calculator;


        return this;


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






    positiveNumber(

        value,

        fallback = 0

    ){


        const resolved =

            this.number(

                value,

                fallback

            );


        return resolved > 0

            ? resolved

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






    roundPercent(value){


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






    getSettings(input){


        const settings =

            input?.settings

            ??

            input?.calculationSettings

            ??

            input?.row?.calculationSettings;


        return settings

        &&

        typeof settings ===

            "object"

            ? settings

            : {};


    }






    getRow(input){


        const row =

            input?.row;


        return row

        &&

        typeof row ===

            "object"

            ? row

            : {};


    }






    resolveInputs(input = {}){


        const row =

            this.getRow(

                input

            );


        const settings =

            this.getSettings(

                input

            );


        const salePrice =

            this.number(

                input.salePrice

                ??

                input.sellingPrice

                ??

                row.target_selling_price

                ??

                row._targetSellingPrice

                ??

                row.validated_sales_price

                ??

                row.current_sale_price

                ??

                row.new_current,

                0

            );


        const unitCostExclTax =

            this.number(

                input.unitCostExclTax

                ??

                row.unit_cost_excl_tax

                ??

                row.supplier_price_used

                ??

                row.supplier_price

                ??

                row.std_supplier_price,

                0

            );


        const buyQty =

            this.positiveNumber(

                input.buyQty

                ??

                row.amazonpackinfo_buy_qty

                ??

                row.buy_qty

                ??

                row.amazonpackinfo_pack_size

                ??

                row.pack_size,

                1

            );


        const explicitPackCostExTax =

            this.number(

                input.packCostExTax

                ??

                row.pack_cost_ex_tax,

                0

            );


        const packCostExTax =

            explicitPackCostExTax > 0

                ? explicitPackCostExTax

                : unitCostExclTax > 0

                    ? unitCostExclTax

                        *

                        buyQty

                    : 0;


        const taxRateOnCost =

            this.rate(

                input.taxRateOnCost

                ??

                row.tax_rate_on_cost

                ??

                row.supplier_tax_rate_on_cost

                ??

                settings.vatRateOnCostPercent

                ??

                0,

                0

            );


        const taxRateOnSale =

            this.rate(

                input.taxRateOnSale

                ??

                row.tax_rate_on_sale

                ??

                row.supplier_tax_rate_on_sale

                ??

                settings.vatRateOnSalePercent

                ??

                0,

                0

            );


        const packTaxAmount =

            this.number(

                input.packTaxAmount

                ??

                row.pack_tax_amount

                ??

                row.tax_on_pack_cost,

                packCostExTax

                *

                taxRateOnCost

            );


        const explicitPackCostInclTax =

            this.number(

                input.packCostInclTax

                ??

                row.pack_cost_incl_tax

                ??

                row.pack_cost,

                0

            );


        const packCostInclTax =

            explicitPackCostInclTax > 0

                ? explicitPackCostInclTax

                : packCostExTax

                    +

                    packTaxAmount;


        return {

            row:

                row,


            settings:

                settings,


            salePrice:

                this.roundMoney(

                    salePrice

                ),


            unitCostExclTax:

                this.roundMoney(

                    unitCostExclTax

                ),


            buyQty:

                buyQty,


            packCostExTax:

                this.roundMoney(

                    packCostExTax

                ),


            packTaxAmount:

                this.roundMoney(

                    packTaxAmount

                ),


            packCostInclTax:

                this.roundMoney(

                    packCostInclTax

                ),


            taxRateOnCost:

                taxRateOnCost,


            taxRateOnSale:

                taxRateOnSale

        };


    }






    ensureCalculators(){


        const missing =

            [];


        if(

            !this.feeCalculator

            ||

            typeof this.feeCalculator.calculate !==

                "function"

        ){


            missing.push(

                "FeeCalculator"

            );


        }


        if(

            !this.vatCalculator

            ||

            typeof this.vatCalculator.calculate !==

                "function"

        ){


            missing.push(

                "VatCalculator"

            );


        }


        if(

            !this.profitCalculator

            ||

            typeof this.profitCalculator.calculate !==

                "function"

        ){


            missing.push(

                "ProfitCalculator"

            );


        }


        if(missing.length > 0){


            throw new Error(

                `FinancialEngine is missing: ${missing.join(", ")}`

            );


        }


    }






    addObjectToResult(

        result,

        target,

        values

    ){


        if(

            !values

            ||

            typeof values !==

                "object"

        ){


            return;


        }


        for(

            const [

                key,

                value

            ] of Object.entries(

                values

            )

        ){


            if(target === "fee"){


                result.setFee(

                    key,

                    value

                );


                continue;


            }


            if(target === "tax"){


                result.setTax(

                    key,

                    value

                );


                continue;


            }


            result.setValue(

                key,

                value

            );


        }


    }






    async calculate(input = {}){


        this.ensureCalculators();


        const totalStartedAt =

            performance.now();


        const resolved =

            this.resolveInputs(

                input

            );


        const result =

            new FinancialResult();


        result

            .addAudit(

                "engine",

                "FinancialEngine"

            )

            .addAudit(

                "version",

                this.version

            )

            .addAudit(

                "asin",

                String(

                    resolved.row.asin

                    ??

                    resolved.row._asin

                    ??

                    resolved.row.matched_asin

                    ??

                    ""

                ).trim()

            )

            .addAudit(

                "inputs",

                {

                    salePrice:

                        resolved.salePrice,


                    unitCostExclTax:

                        resolved.unitCostExclTax,


                    buyQty:

                        resolved.buyQty,


                    packCostExTax:

                        resolved.packCostExTax,


                    packTaxAmount:

                        resolved.packTaxAmount,


                    packCostInclTax:

                        resolved.packCostInclTax,


                    taxRateOnCost:

                        resolved.taxRateOnCost,


                    taxRateOnSale:

                        resolved.taxRateOnSale

                }

            );


        result

            .setValue(

                "salePrice",

                resolved.salePrice

            )

            .setValue(

                "unitCostExclTax",

                resolved.unitCostExclTax

            )

            .setValue(

                "buyQty",

                resolved.buyQty

            )

            .setValue(

                "packCostExTax",

                resolved.packCostExTax

            )

            .setValue(

                "packCostInclTax",

                resolved.packCostInclTax

            );






        /*
            Stage 1 — Fees
        */


        const feeStartedAt =

            performance.now();


        const feeResult =

            await this.feeCalculator.calculate({

                ...resolved

            });


        result.addTiming(

            "fees",

            Number(

                (

                    performance.now()

                    -

                    feeStartedAt

                ).toFixed(

                    3

                )

            )

        );


        this.addObjectToResult(

            result,

            "fee",

            feeResult

        );






        /*
            Stage 2 — VAT
        */


        const vatStartedAt =

            performance.now();


        const vatResult =

            await this.vatCalculator.calculate({

                ...resolved,


                fees:

                    feeResult

            });


        result.addTiming(

            "vat",

            Number(

                (

                    performance.now()

                    -

                    vatStartedAt

                ).toFixed(

                    3

                )

            )

        );


        this.addObjectToResult(

            result,

            "tax",

            vatResult

        );






        /*
            Stage 3 — Profit, ROI and Margin
        */


        const profitStartedAt =

            performance.now();


        const profitResult =

            await this.profitCalculator.calculate({

                ...resolved,


                fees:

                    feeResult,


                tax:

                    vatResult

            });


        result.addTiming(

            "profit",

            Number(

                (

                    performance.now()

                    -

                    profitStartedAt

                ).toFixed(

                    3

                )

            )

        );


        this.addObjectToResult(

            result,

            "value",

            profitResult

        );


        if(resolved.salePrice <= 0){


            result.addWarning(

                "Selling price is unavailable"

            );


        }


        if(resolved.packCostInclTax <= 0){


            result.addWarning(

                "Supplier cost is unavailable"

            );


        }


        result.addTiming(

            "total",

            Number(

                (

                    performance.now()

                    -

                    totalStartedAt

                ).toFixed(

                    3

                )

            )

        );


        return result;


    }


}
