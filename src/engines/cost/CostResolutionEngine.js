export class CostResolutionEngine {


    constructor({

        financialEngine = null,

        maxCostAtPrice = null

    } = {}){


        this.financialEngine =

            financialEngine;


        this.maxCostAtPrice =

            maxCostAtPrice;


        this.version =

            "1.0.1-PHX0052";


    }






    ensureAvailable(){


        if(

            !this.financialEngine

            ||

            typeof this.financialEngine.calculate !==

                "function"

        ){


            throw new Error(

                "CostResolutionEngine requires FinancialEngine.calculate()"

            );


        }


        if(

            !this.maxCostAtPrice

            ||

            typeof this.maxCostAtPrice.calculate !==

                "function"

        ){


            throw new Error(

                "CostResolutionEngine requires MaxCostAtPrice.calculate()"

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






    getRow(context){


        const row =

            context?.row;


        return row

        &&

        typeof row ===

            "object"

            ? row

            : {};


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

        typeof settings ===

            "object"

            ? settings

            : {};


    }






    getSalePrice(context){


        const row =

            this.getRow(

                context

            );


        return this.number(

            row.target_selling_price

            ??

            row._targetSellingPrice

            ??

            row.adjusted_target_selling_price

            ??

            context?.targetSellingPrice

            ??

            row.validated_sales_price

            ??

            context?.validatedSellingPrice

            ??

            0,

            0

        );


    }






    getBuyQty(context){


        const row =

            this.getRow(

                context

            );


        return this.positiveNumber(

            row.amazonpackinfo_buy_qty

            ??

            row.buy_qty

            ??

            context?.buyQty

            ??

            1,

            1

        );


    }
        getTaxRateOnCost(context){


        const row =

            this.getRow(

                context

            );


        const settings =

            this.getSettings(

                context

            );


        return this.rate(

            row.tax_rate_on_cost

            ??

            row.supplier_tax_rate_on_cost

            ??

            settings.vatRateOnCostPercent

            ??

            settings.vat_on_cost_percent

            ??

            0,

            0

        );


    }






    getTaxRateOnSale(context){


        const row =

            this.getRow(

                context

            );


        const settings =

            this.getSettings(

                context

            );


        return this.rate(

            row.tax_rate_on_sale

            ??

            row.supplier_tax_rate_on_sale

            ??

            settings.vatRateOnSalePercent

            ??

            settings.vat_on_sale_percent

            ??

            0,

            0

        );


    }






    findActualUnitCost(context){


        const row =

            this.getRow(

                context

            );


        const candidates = [

            {

                field:

                    "unit_cost_excl_tax",


                source:

                    "SUPPLIER_UNIT_COST"

            },

            {

                field:

                    "supplier_price_used",


                source:

                    "SUPPLIER_PRICE_USED"

            },

            {

                field:

                    "supplier_price",


                source:

                    "SUPPLIER_PRICE"

            },

            {

                field:

                    "std_supplier_price",


                source:

                    "STANDARD_SUPPLIER_PRICE"

            }

        ];


        for(

            const candidate of candidates

        ){


            const value =

                this.number(

                    row[candidate.field],

                    0

                );


            if(value > 0){


                return {

                    value:

                        value,


                    source:

                        candidate.source,


                    field:

                        candidate.field

                };


            }


        }


        return null;


    }






    findActualPackCost(context){


        const row =

            this.getRow(

                context

            );


        const explicitPackCost =

            this.number(

                row.pack_cost_ex_tax,

                0

            );


        if(explicitPackCost > 0){


            return {

                value:

                    explicitPackCost,


                source:

                    "PACK_COST",


                field:

                    "pack_cost_ex_tax"

            };


        }


        const unitCost =

            this.findActualUnitCost(

                context

            );


        if(!unitCost){


            return null;


        }


        const buyQty =

            this.getBuyQty(

                context

            );


        return {

            value:

                unitCost.value

                *

                buyQty,


            source:

                unitCost.source,


            field:

                unitCost.field,


            unitCost:

                unitCost.value,


            buyQty:

                buyQty

        };


    }






    financialToJSON(result){


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
        async runZeroCostFinancial({

        context,

        salePrice,

        taxRateOnCost,

        taxRateOnSale

    }){


        const row =

            this.getRow(

                context

            );


        return this.financialEngine.calculate({

            row:{

                ...row,


                unit_cost_excl_tax:

                    0,


                supplier_price_used:

                    0,


                supplier_price:

                    0,


                std_supplier_price:

                    0,


                pack_cost_ex_tax:

                    0,


                pack_cost_incl_tax:

                    0,


                pack_cost:

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

                salePrice,


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

                taxRateOnCost,


            taxRateOnSale:

                taxRateOnSale

        });


    }






    async calculateDerivedCost({

        context,

        salePrice,

        taxRateOnCost,

        taxRateOnSale

    }){


        const zeroCostFinancialResult =

            await this.runZeroCostFinancial({

                context,

                salePrice,

                taxRateOnCost,

                taxRateOnSale

            });


        const maximumCost =

            await this.maxCostAtPrice.calculate({

                salePrice,

                context,

                taxRateOnCost,

                taxRateOnSale,

                rowInputs:{

                    ...this.getRow(

                        context

                    ),


                    hasSupplierCostForTarget:

                        false

                }

            });


        return {

            zeroCostFinancialResult:

                this.financialToJSON(

                    zeroCostFinancialResult

                ),


            maximumCost:

                this.roundMoney(

                    maximumCost

                ),


            resolvedCost:

                this.roundMoney(

                    maximumCost

                ),


            costSource:

                "DERIVED_MAX_COST"

        };


    }






    async calculateFinalFinancial({

        context,

        salePrice,

        resolvedCost,

        taxRateOnCost,

        taxRateOnSale

    }){


        /*
            resolvedCost is VAT-inclusive.

            Convert back to ex-VAT before
            calling FinancialEngine.
        */


        const packCostInclTax =

            this.number(

                resolvedCost,

                0

            );


        const packCostExTax =

            taxRateOnCost > 0

                ? packCostInclTax

                    /

                    (

                        1

                        +

                        taxRateOnCost

                    )

                : packCostInclTax;


        const packTaxAmount =

            packCostInclTax

            -

            packCostExTax;


        return this.financialEngine.calculate({

            row:

                this.getRow(

                    context

                ),


            settings:

                this.getSettings(

                    context

                ),


            salePrice:

                salePrice,


            unitCostExclTax:

                packCostExTax,


            buyQty:

                1,


            packCostExTax:

                packCostExTax,


            packCostInclTax:

                packCostInclTax,


            packTaxAmount:

                packTaxAmount,


            taxRateOnCost:

                taxRateOnCost,


            taxRateOnSale:

                taxRateOnSale

        });


    }
        async resolve(context){


        this.ensureAvailable();


        const salePrice =

            this.getSalePrice(

                context

            );


        const taxRateOnCost =

            this.getTaxRateOnCost(

                context

            );


        const taxRateOnSale =

            this.getTaxRateOnSale(

                context

            );


        const actualCost =

            this.findActualPackCost(

                context

            );


        let resolvedCost =

            0;


        let costSource =

            "";


        let maximumCost =

            0;


        let zeroCostFinancialResult =

            null;


        if(actualCost){


            resolvedCost =

                this.roundMoney(

                    actualCost.value

                );


            costSource =

                actualCost.source;


        }

        else {


            const derived =

                await this.calculateDerivedCost({

                    context:

                        context,


                    salePrice:

                        salePrice,


                    taxRateOnCost:

                        taxRateOnCost,


                    taxRateOnSale:

                        taxRateOnSale

                });


            resolvedCost =

                derived.resolvedCost;


            costSource =

                derived.costSource;


            maximumCost =

                derived.maximumCost;


            zeroCostFinancialResult =

                derived.zeroCostFinancialResult;


        }


        const finalFinancialResult =

            await this.calculateFinalFinancial({

                context:

                    context,


                salePrice:

                    salePrice,


                resolvedCost:

                    resolvedCost,


                taxRateOnCost:

                    taxRateOnCost,


                taxRateOnSale:

                    taxRateOnSale

            });


        return {

            resolvedCost:

                this.roundMoney(

                    resolvedCost

                ),


            costSource:

                costSource,


            maximumCost:

                this.roundMoney(

                    maximumCost

                ),


            hasActualSupplierCost:

                Boolean(

                    actualCost

                ),


            actualCostField:

                actualCost?.field

                ??

                "",


            salePrice:

                this.roundMoney(

                    salePrice

                ),


            taxRateOnCost:

                taxRateOnCost,


            taxRateOnSale:

                taxRateOnSale,


            zeroCostFinancialResult:

                zeroCostFinancialResult,


            finalFinancialResult:

                this.financialToJSON(

                    finalFinancialResult

                ),


            audit:{

                engine:

                    "CostResolutionEngine",


                version:

                    this.version,


                rule:

                    actualCost

                        ? "USE_ACTUAL_SUPPLIER_COST"

                        : "DERIVED_MAX_COST_FOR_PROVISIONAL_BREAK_EVEN",


                buyQty:

                    this.getBuyQty(

                        context

                    )

            }

        };
            }


}