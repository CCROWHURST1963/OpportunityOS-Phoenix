export class PricingTargetEngine {


    constructor({

        profitAtPrice = null,

        financialEngine = null,

        costResolutionEngine = null,

        maxCostAtPrice = null,

        maxCostCalculator = null,

        findPriceForTarget = null

    } = {}){


        /*
            ProfitAtPrice remains temporarily supported
            while the pricing solver is migrated fully
            onto FinancialEngine.
        */


        this.profitAtPrice =

            profitAtPrice;


        this.financialEngine =

            financialEngine;


        this.costResolutionEngine =

            costResolutionEngine;


        /*
            Support both dependency names during migration.
        */


        this.maxCostAtPrice =

            maxCostAtPrice

            ??

            maxCostCalculator;


        this.findPriceForTargetService =

            findPriceForTarget;


    }






    ensureAvailable(){


        if(

            !this.profitAtPrice

            ||

            typeof this.profitAtPrice.calculate !==

                "function"

        ){


            throw new Error(

                "PricingTargetEngine requires ProfitAtPrice.calculate()"

            );


        }


        if(

            !this.costResolutionEngine

            ||

            typeof this.costResolutionEngine.resolve !==

                "function"

        ){


            throw new Error(

                "PricingTargetEngine requires CostResolutionEngine.resolve()"

            );


        }


        if(

            !this.maxCostAtPrice

            ||

            typeof this.maxCostAtPrice.calculate !==

                "function"

        ){


            throw new Error(

                "PricingTargetEngine requires MaxCostAtPrice.calculate()"

            );


        }


        if(

            !this.findPriceForTargetService

            ||

            typeof this.findPriceForTargetService.find !==

                "function"

        ){


            throw new Error(

                "PricingTargetEngine requires FindPriceForTarget.find()"

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


        const resolved =

            String(

                value

                ??

                ""

            )

                .trim()

                .toLowerCase();


        if(

            resolved === "profit"

            ||

            resolved === "target profit"

        ){


            return "profit";


        }


        if(

            resolved === "margin"

            ||

            resolved === "profit margin"

            ||

            resolved === "target margin"

        ){


            return "margin";


        }


        if(

            resolved === "roi"

            ||

            resolved === "return on investment"

            ||

            resolved === "target roi"

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






    getTargetRoi(context){


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






    getTargetMargin(context){


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






    getTargetProfit(context){


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






    getSupplierMethod(context){


        const settings =

            this.getSettings(

                context

            );


        return this.normaliseMethod(

            settings.maxCostMethod

            ??

            settings.max_cost_calc

            ??

            context?.row?.max_cost_method

            ??

            context?.row?.max_cost_calc

            ??

            "ROI"

        );


    }






    getNoSupplierMethod(context){


        const settings =

            this.getSettings(

                context

            );


        return this.normaliseMethod(

            settings.maxCostNoSupplierMethod

            ??

            settings.maxCostCalcNoSupplier

            ??

            settings.max_cost_calc_no_supplier

            ??

            context?.row?.max_cost_no_supplier_method

            ??

            context?.row?.max_cost_calc_no_supplier

            ??

            this.getSupplierMethod(

                context

            )

        );


    }






    getStartPrice(context){


        return this.number(

            context?.row?.start_sale_price_for_target

            ??

            context?.row?.validated_sales_price

            ??

            context?.validatedSellingPrice

            ??

            0,

            0

        );


    }






    getFinancialSection(

        costResolution,

        section

    ){


        const financial =

            costResolution?.finalFinancialResult;


        if(

            !financial

            ||

            typeof financial !== "object"

        ){


            return {};


        }


        const value =

            financial[section];


        return value

        &&

        typeof value === "object"

            ? value

            : {};


    }






    getResolvedPackCostInclTax(

        costResolution

    ){


        const values =

            this.getFinancialSection(

                costResolution,

                "values"

            );


        return this.number(

            values.packCostInclTax

            ??

            costResolution?.resolvedCost

            ??

            0,

            0

        );


    }






    getResolvedPackCostExTax(

        costResolution

    ){


        const values =

            this.getFinancialSection(

                costResolution,

                "values"

            );


        return this.number(

            values.packCostExTax

            ??

            0,

            0

        );


    }






    getResolvedPackTaxAmount(

        costResolution

    ){


        const tax =

            this.getFinancialSection(

                costResolution,

                "tax"

            );


        const packCostInclTax =

            this.getResolvedPackCostInclTax(

                costResolution

            );


        const packCostExTax =

            this.getResolvedPackCostExTax(

                costResolution

            );


        return this.number(

            tax.vatOnCost

            ??

            tax.costVatAmount

            ??

            (

                packCostInclTax

                -

                packCostExTax

            ),

            0

        );


    }






    getTaxRateOnCost(

        context,

        costResolution

    ){


        return this.number(

            costResolution?.taxRateOnCost

            ??

            0,

            0

        );


    }






    getTaxRateOnSale(

        context,

        costResolution

    ){


        return this.number(

            costResolution?.taxRateOnSale

            ??

            0,

            0

        );


    }
        buildRowInputs({

        context,

        costResolution,

        startPrice,

        taxRateOnCost

    }){


        return {

            ...(context?.row

                ??

                {}),


            resolvedCost:

                this.roundMoney(

                    costResolution?.resolvedCost

                ),


            costSource:

                costResolution?.costSource

                ??

                "",


            hasSupplierCostForTarget:

                Boolean(

                    costResolution?.hasActualSupplierCost

                ),


            startSalePriceForTarget:

                startPrice,


            taxRateOnCostForTarget:

                taxRateOnCost

        };


    }






    async findPrice({

        packCostInclTax,

        context,

        taxRateOnSale,

        rowInputs,

        packTaxAmount,

        predicate,

        startPrice,

        mode = ""

    }){


        return this.findPriceForTargetService.find({

            packCostInclTax:

                packCostInclTax,


            context:

                context,


            taxRateOnSale:

                taxRateOnSale,


            rowInputs:

                rowInputs,


            packTaxAmount:

                packTaxAmount,


            predicate:

                predicate,


            startPrice:

                startPrice,


            mode:

                mode

        });


    }






    selectTarget({

        method,

        roiPrice,

        marginPrice,

        profitPrice

    }){


        if(method === "profit"){


            return profitPrice;


        }


        if(method === "margin"){


            return marginPrice;


        }


        return roiPrice;


    }






    async calculate(context){


        this.ensureAvailable();


        const costResolution =

            await this.costResolutionEngine.resolve(

                context

            );


        const targetRoi =

            this.getTargetRoi(

                context

            );


        const targetMargin =

            this.getTargetMargin(

                context

            );


        const targetProfit =

            this.getTargetProfit(

                context

            );


        const packCostInclTax =

            this.getResolvedPackCostInclTax(

                costResolution

            );


        const packCostExTax =

            this.getResolvedPackCostExTax(

                costResolution

            );


        const packTaxAmount =

            this.getResolvedPackTaxAmount(

                costResolution

            );


        const taxRateOnCost =

            this.getTaxRateOnCost(

                context,

                costResolution

            );


        const taxRateOnSale =

            this.getTaxRateOnSale(

                context,

                costResolution

            );


        const hasSupplierCost =

            Boolean(

                costResolution?.hasActualSupplierCost

            );


        const startPrice =

            this.getStartPrice(

                context

            );


        const rowInputs =

            this.buildRowInputs({

                context:

                    context,


                costResolution:

                    costResolution,


                startPrice:

                    startPrice,


                taxRateOnCost:

                    taxRateOnCost

            });






        /*
            Unified pricing path.

            Supplier and no-supplier rows now both use
            the canonical resolved VAT-inclusive cost.
        */


        const breakEvenPrice =

            await this.findPrice({

                packCostInclTax:

                    packCostInclTax,


                context:

                    context,


                taxRateOnSale:

                    taxRateOnSale,


                rowInputs:

                    rowInputs,


                packTaxAmount:

                    packTaxAmount,


                predicate:

                    result =>

                        result.profit >=

                            0,


                startPrice:

                    startPrice

            });


        const targetPriceRoi =

            await this.findPrice({

                packCostInclTax:

                    packCostInclTax,


                context:

                    context,


                taxRateOnSale:

                    taxRateOnSale,


                rowInputs:

                    rowInputs,


                packTaxAmount:

                    packTaxAmount,


                predicate:

                    result =>

                        result.roiPercent >=

                            targetRoi,


                startPrice:

                    startPrice,


                mode:

                    "roi"

            });


        const targetPriceMargin =

            await this.findPrice({

                packCostInclTax:

                    packCostInclTax,


                context:

                    context,


                taxRateOnSale:

                    taxRateOnSale,


                rowInputs:

                    rowInputs,


                packTaxAmount:

                    packTaxAmount,


                predicate:

                    result =>

                        result.marginPercent >=

                            targetMargin,


                startPrice:

                    startPrice,


                mode:

                    "margin"

            });


        const targetPriceProfit =

            await this.findPrice({

                packCostInclTax:

                    packCostInclTax,


                context:

                    context,


                taxRateOnSale:

                    taxRateOnSale,


                rowInputs:

                    rowInputs,


                packTaxAmount:

                    packTaxAmount,


                predicate:

                    result =>

                        result.profit >=

                            targetProfit,


                startPrice:

                    startPrice,


                mode:

                    "profit"

            });


        const selectedMethod =

            hasSupplierCost

                ? this.getSupplierMethod(

                    context

                )

                : this.getNoSupplierMethod(

                    context

                );


        const targetSellingPrice =

            this.selectTarget({

                method:

                    selectedMethod,


                roiPrice:

                    targetPriceRoi,


                marginPrice:

                    targetPriceMargin,


                profitPrice:

                    targetPriceProfit

            });
                    const targetPriceResult =

            await this.profitAtPrice.calculate({

                salePrice:

                    targetSellingPrice,


                packCostInclTax:

                    packCostInclTax,


                context:

                    context,


                taxRateOnSale:

                    taxRateOnSale,


                rowInputs:

                    rowInputs,


                packTaxAmount:

                    packTaxAmount

            });






        /*
            Displayed Maximum Cost at the selected
            Target Selling Price.

            This remains separate from the resolved
            working cost supplied by CostResolutionEngine.
        */


        const maximumCost =

            await this.maxCostAtPrice.calculate({

                salePrice:

                    targetSellingPrice,


                context:

                    context,


                taxRateOnCost:

                    taxRateOnCost,


                taxRateOnSale:

                    taxRateOnSale,


                rowInputs:{

                    ...rowInputs,


                    hasSupplierCostForTarget:

                        hasSupplierCost

                },


                method:

                    selectedMethod

            });


        const fees =

            targetPriceResult?.fees

            ??

            {};


        const finalFinancial =

            costResolution?.finalFinancialResult

            &&

            typeof costResolution.finalFinancialResult ===

                "object"

                ? costResolution.finalFinancialResult

                : {};


        const finalFinancialValues =

            finalFinancial.values

            &&

            typeof finalFinancial.values ===

                "object"

                ? finalFinancial.values

                : {};


        const finalFinancialTax =

            finalFinancial.tax

            &&

            typeof finalFinancial.tax ===

                "object"

                ? finalFinancial.tax

                : {};


        return {

            breakEvenPrice:

                this.roundMoney(

                    breakEvenPrice

                ),


            targetPriceRoi:

                this.roundMoney(

                    targetPriceRoi

                ),


            targetPriceMargin:

                this.roundMoney(

                    targetPriceMargin

                ),


            targetPriceProfit:

                this.roundMoney(

                    targetPriceProfit

                ),


            targetSellingPrice:

                this.roundMoney(

                    targetSellingPrice

                ),


            maximumCost:

                this.roundMoney(

                    maximumCost

                ),


            maxCost:

                this.roundMoney(

                    maximumCost

                ),


            targetSellingPriceMaxCost:

                this.roundMoney(

                    maximumCost

                ),


            resolvedCost:

                this.roundMoney(

                    costResolution?.resolvedCost

                ),


            resolvedCostSource:

                costResolution?.costSource

                ??

                "",


            hasSupplierCostForTarget:

                hasSupplierCost,


            selectedTargetMethod:

                selectedMethod,


            targetPriceReferralFee:

                this.roundMoney(

                    fees.referralFee

                ),


            targetPriceFbaFee:

                this.roundMoney(

                    fees.fbaFee

                ),


            targetPriceBaseFbaFee:

                this.roundMoney(

                    fees.baseFbaFee

                ),


            targetPriceFbaProgramme:

                fees.fbaProgramme

                ??

                "",


            targetPriceFeesExTax:

                this.roundMoney(

                    fees.totalFeesExTax

                ),


            targetPriceTaxOnFees:

                this.roundMoney(

                    fees.taxOnFees

                ),


            targetPriceSellingTax:

                this.roundMoney(

                    fees.sellingPriceTax

                ),


            targetPriceTaxDue:

                this.roundMoney(

                    fees.taxDue

                ),


            targetPriceProfitValue:

                this.roundMoney(

                    targetPriceResult?.profit

                ),


            targetPriceRoiValue:

                this.number(

                    targetPriceResult?.roiPercent,

                    0

                ),


            targetPriceMarginValue:

                this.number(

                    targetPriceResult?.marginPercent,

                    0

                ),


            resolvedFinancialProfit:

                this.roundMoney(

                    finalFinancialValues.profit

                ),


            resolvedFinancialRoi:

                this.number(

                    finalFinancialValues.roiPercent

                    ??

                    finalFinancialValues.roi,

                    0

                ),


            resolvedFinancialMargin:

                this.number(

                    finalFinancialValues.marginPercent

                    ??

                    finalFinancialValues.margin,

                    0

                ),


            resolvedFinancialVatOnCost:

                this.roundMoney(

                    finalFinancialTax.vatOnCost

                    ??

                    finalFinancialTax.costVatAmount

                ),


            resolvedFinancialVatDue:

                this.roundMoney(

                    finalFinancialTax.vatDue

                    ??

                    finalFinancialTax.taxDue

                ),
                            audit:{

                targetRoi:

                    targetRoi,


                targetMargin:

                    targetMargin,


                targetProfit:

                    targetProfit,


                taxRateOnCost:

                    taxRateOnCost,


                taxRateOnSale:

                    taxRateOnSale,


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


                startPrice:

                    this.roundMoney(

                        startPrice

                    ),


                hasSupplierCost:

                    hasSupplierCost,


                selectedTargetMethod:

                    selectedMethod,


                resolvedCost:

                    this.roundMoney(

                        costResolution?.resolvedCost

                    ),


                resolvedCostSource:

                    costResolution?.costSource

                    ??

                    "",


                maximumCost:

                    this.roundMoney(

                        maximumCost

                    ),


                costResolutionRule:

                    costResolution?.audit?.rule

                    ??

                    "",


                costResolutionResult:

                    costResolution

            }

        };


    }


}