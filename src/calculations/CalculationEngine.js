 import { CalculationContext }
    from "./CalculationContext.js";


import { CalculationResult }
    from "./CalculationResult.js";


import { RowCalculationSettingsEnricher }
    from "./CalculationSettingsEnricher.js";


import { BreakEvenCalculator }
    from "./calculators/BreakEvenCalculator.js";



export class CalculationEngine {


    constructor(

        calculators = null,

        rowCalculationSettingsEnricher = null,

        scoreEngine = null,

        buySignalEngine = null,

        statusEngine = null

    ){


        this.rowCalculationSettingsEnricher =

            rowCalculationSettingsEnricher

            &&

            typeof rowCalculationSettingsEnricher.enrich ===

                "function"

                ? rowCalculationSettingsEnricher

                : new RowCalculationSettingsEnricher();


        this.scoreEngine =

            scoreEngine;


        this.buySignalEngine =

            buySignalEngine;


        this.statusEngine =

            statusEngine;






        const defaultCalculators = [

            new BreakEvenCalculator()

        ];


        const suppliedCalculators =

            Array.isArray(

                calculators

            )

                ? calculators

                : defaultCalculators;


        this.calculators =

            suppliedCalculators.filter(

                calculator =>

                    calculator

                    &&

                    typeof calculator.calculate ===

                        "function"

            );


    }






    register(calculator){


        if(

            !calculator

            ||

            typeof calculator.calculate !==

                "function"

        ){


            throw new Error(

                "Calculator must provide calculate(context, result)"

            );


        }


        this.calculators.push(

            calculator

        );


        return this;


    }






    registerFirst(calculator){


        if(

            !calculator

            ||

            typeof calculator.calculate !==

                "function"

        ){


            throw new Error(

                "Calculator must provide calculate(context, result)"

            );


        }


        this.calculators.unshift(

            calculator

        );


        return this;


    }






    getCalculatorName(calculator){


        return calculator?.constructor?.name

        ||

        "AnonymousCalculator";


    }






    hasValue(value){


        return (

            value !== undefined

            &&

            value !== null

            &&

            !Number.isNaN(

                value

            )

        );


    }






    firstValue(

        values = []

    ){


        for(

            const value of values

        ){


            if(

                this.hasValue(

                    value

                )

            ){


                return value;


            }


        }


        return null;


    }






    getObject(value){


        return value

        &&

        typeof value ===

            "object"

        &&

        !Array.isArray(

            value

        )

            ? value

            : {};


    }






    enrichCalculationSettings(

        row,

        dashboardConstants = {}

    ){


        if(

            !this.rowCalculationSettingsEnricher

            ||

            typeof this.rowCalculationSettingsEnricher.enrich !==

                "function"

        ){


            return row;


        }


        const enrichedRow =

            this.rowCalculationSettingsEnricher.enrich(

                row,

                dashboardConstants

            );


        return enrichedRow

        &&

        typeof enrichedRow ===

            "object"

            ? enrichedRow

            : row;


    }






    createInitialResult(context){


        return new CalculationResult({

            sellingPrice:

                context.targetSellingPrice

                ||

                context.validatedSellingPrice,


            supplierCost:

                context.unitCostExclTax,


            packCost:

                context.packCost,


            fbaFee:

                context.fbaFee,


            fbmCost:

                context.fbmCost,


            prepFee:

                context.nettPrepFee,


            calculationSettings:

                {

                    ...(

                        context.row?.calculationSettings

                        ||

                        {}

                    )

                }

        });


    }






    mergeReturnedResult(

        returnedResult,

        result

    ){


        if(

            !returnedResult

            ||

            returnedResult === result

            ||

            typeof returnedResult !==

                "object"

        ){


            return;


        }


        if(

            returnedResult instanceof

                CalculationResult

        ){


            Object.assign(

                result.values,

                returnedResult.values

            );


            return;


        }


        result.update(

            returnedResult

        );


    }






    async runCalculator(

        calculator,

        context,

        result

    ){


        const calculatorName =

            this.getCalculatorName(

                calculator

            );


        try{


            const returnedResult =

                await calculator.calculate(

                    context,

                    result

                );


            this.mergeReturnedResult(

                returnedResult,

                result

            );


            result.addTrace(

                calculatorName,

                returnedResult

                &&

                typeof returnedResult ===

                    "object"

                    ? returnedResult

                    : result.toJSON()

            );


        }

        catch(error){


            result.addError(

                `${calculatorName} failed`,

                {

                    message:

                        error?.message

                        ??

                        String(

                            error

                        ),


                    stack:

                        error?.stack

                        ??

                        ""

                }

            );


            console.error(

                "[PHX CALCULATION ERROR]",

                {

                    asin:

                        context.asin,


                    calculator:

                        calculatorName,


                    error:

                        error

                }

            );


        }


    }






    getTracePayload(

        calculation,

        calculatorName

    ){


        const trace =

            Array.isArray(

                calculation?.calculatorTrace

            )

                ? calculation.calculatorTrace

                : [];


        const normalisedName =

            String(

                calculatorName

                ??

                ""

            ).toLowerCase();


        for(

            let index = trace.length - 1;

            index >= 0;

            index -= 1

        ){


            const entry =

                trace[index];


            const entryName =

                String(

                    entry?.calculator

                    ??

                    entry?.name

                    ??

                    entry?.stage

                    ??

                    ""

                ).toLowerCase();


            if(

                entryName.includes(

                    normalisedName

                )

            ){


                return this.getObject(

                    entry?.result

                    ??

                    entry?.payload

                    ??

                    entry?.value

                    ??

                    entry?.data

                    ??

                    entry

                );


            }


        }


        return {};


    }






    buildPublishedCalculation(calculation){


        const raw =

            this.getObject(

                calculation

            );


        const nestedValues =

            this.getObject(

                raw.values

            );


        /*
            CalculationResult currently publishes most
            calculator outputs directly at the top level.

            Merge both structures so consumers work during
            the migration regardless of output shape.
        */


        const source = {

            ...nestedValues,

            ...raw

        };


        const pricingTrace =

            this.getTracePayload(

                raw,

                "PricingTargetEngine"

            );


        const pricingTraceValues =

            this.getObject(

                pricingTrace.values

            );


        const pricing = {

            ...pricingTraceValues,

            ...pricingTrace

        };


        const sourceAudit =

            this.getObject(

                source.audit

            );


        const pricingAudit =

            this.getObject(

                pricing.audit

            );


        const audit =

            Object.keys(

                sourceAudit

            ).length > 0

                ? sourceAudit

                : pricingAudit;


        const costResolution =

            this.getObject(

                audit.costResolutionResult

                ??

                source.costResolution

                ??

                pricing.costResolution

            );


        const finalFinancial =

            this.getObject(

                costResolution.finalFinancialResult

                ??

                source.financial

                ??

                pricing.financial

            );


        const finalFinancialValues =

            this.getObject(

                finalFinancial.values

            );


        const finalFinancialFees =

            this.getObject(

                finalFinancial.fees

            );


        const finalFinancialTax =

            this.getObject(

                finalFinancial.tax

            );


        const published = {

            ...source

        };






        /*
            Canonical resolved cost.
        */


        published.resolvedCost =

            this.firstValue([

                source.resolvedCost,

                pricing.resolvedCost,

                costResolution.resolvedCost

            ]);


        published.costSource =

            this.firstValue([

                source.resolvedCostSource,

                source.costSource,

                pricing.resolvedCostSource,

                pricing.costSource,

                costResolution.costSource

            ])

            ??

            "";






        /*
            Canonical pricing outputs.

            Pricing trace is checked before any later
            calculator can overwrite a valid value with null.
        */


        published.breakEvenPrice =

            this.firstValue([

                pricing.breakEvenPrice,

                source.breakEvenPrice,

                source.break_even_price

            ]);


        published.targetSellingPrice =

            this.firstValue([

                pricing.targetSellingPrice,

                source.targetSellingPrice,

                source.target_selling_price,

                source.sellingPrice

            ]);


        published.maximumCost =

            this.firstValue([

                pricing.maximumCost,

                pricing.maxCost,

                pricing.targetSellingPriceMaxCost,

                source.maximumCost,

                source.maxCost,

                source.targetSellingPriceMaxCost

            ]);


        published.maxCost =

            published.maximumCost;






        /*
            Canonical financial values at the selected
            Target Selling Price.
        */


        published.profit =

            this.firstValue([

                pricing.targetPriceProfitValue,

                source.targetPriceProfitValue,

                source.resolvedFinancialProfit,

                pricing.resolvedFinancialProfit,

                finalFinancialValues.profit,

                source.profit

            ]);


        published.roi =

            this.firstValue([

                pricing.targetPriceRoiValue,

                source.targetPriceRoiValue,

                source.resolvedFinancialRoi,

                pricing.resolvedFinancialRoi,

                finalFinancialValues.roiPercent,

                finalFinancialValues.roi,

                source.roiPercent,

                source.roi

            ]);


        published.roiPercent =

            published.roi;


        published.margin =

            this.firstValue([

                pricing.targetPriceMarginValue,

                source.targetPriceMarginValue,

                source.resolvedFinancialMargin,

                pricing.resolvedFinancialMargin,

                finalFinancialValues.marginPercent,

                finalFinancialValues.margin,

                source.marginPercent,

                source.margin

            ]);


        published.marginPercent =

            published.margin;






        /*
            Complete canonical financial payload.
        */


        published.financial =

            finalFinancial;


        published.financialValues =

            finalFinancialValues;


        published.fees =

            Object.keys(

                finalFinancialFees

            ).length > 0

                ? finalFinancialFees

                : this.getObject(

                    source.fees

                );


        published.tax =

            Object.keys(

                finalFinancialTax

            ).length > 0

                ? finalFinancialTax

                : this.getObject(

                    source.tax

                );


        published.vatOnCost =

            this.firstValue([

                source.resolvedFinancialVatOnCost,

                pricing.resolvedFinancialVatOnCost,

                finalFinancialTax.vatOnCost,

                finalFinancialTax.costVatAmount,

                source.vatOnCost

            ]);


        published.vatDue =

            this.firstValue([

                source.resolvedFinancialVatDue,

                pricing.resolvedFinancialVatDue,

                finalFinancialTax.vatDue,

                finalFinancialTax.taxDue,

                source.vatDue

            ]);






        /*
            Preserve candidate prices and audit information.
        */


        published.targetPriceRoi =

            this.firstValue([

                pricing.targetPriceRoi,

                source.targetPriceRoi

            ]);


        published.targetPriceMargin =

            this.firstValue([

                pricing.targetPriceMargin,

                source.targetPriceMargin

            ]);


        published.targetPriceProfit =

            this.firstValue([

                pricing.targetPriceProfit,

                source.targetPriceProfit

            ]);


        published.selectedTargetMethod =

            this.firstValue([

                pricing.selectedTargetMethod,

                source.selectedTargetMethod

            ])

            ??

            "";


        published.costResolution =

            costResolution;


        published.calculationAudit =

            audit;


        return published;


    }






    async calculateScore(

        row,

        publishedCalculation

    ){


        if(

            !this.scoreEngine

            ||

            typeof this.scoreEngine.calculate !==

                "function"

        ){


            return null;


        }


        try{


            const scoreResult =

                await this.scoreEngine.calculate({

                    row:

                        row,


                    calc:

                        publishedCalculation

                });


            if(

                scoreResult

                &&

                typeof scoreResult.toJSON ===

                    "function"

            ){


                return scoreResult.toJSON();


            }


            return scoreResult

            &&

            typeof scoreResult ===

                "object"

                ? scoreResult

                : null;


        }

        catch(error){


            console.error(

                "[PHX SCORE CALCULATION ERROR]",

                {

                    asin:

                        row?.asin

                        ??

                        row?._asin

                        ??

                        "",


                    error:

                        error

                }

            );


            return {

                rawScore:

                    0,


                maxScore:

                    0,


                percent:

                    0,


                completed:

                    false,


                rules:

                    [],


                breakdown:

                    [],


                error:{

                    message:

                        error?.message

                        ??

                        String(

                            error

                        ),


                    stack:

                        error?.stack

                        ??

                        ""

                }

            };


        }


    }






    normaliseEngineResult(result){


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

            : null;


    }






    async calculateBuySignal(

        row,

        publishedCalculation,

        score

    ){


        if(

            !this.buySignalEngine

            ||

            typeof this.buySignalEngine.calculate !==

                "function"

        ){


            return null;


        }


        try{


            const result =

                await this.buySignalEngine.calculate({

                    row:

                        row,


                    calc:

                        publishedCalculation,


                    score:

                        score,


                    scoreResult:

                        score

                });


            return this.normaliseEngineResult(

                result

            );


        }

        catch(error){


            console.error(

                "[PHX BUY SIGNAL CALCULATION ERROR]",

                {

                    asin:

                        row?.asin

                        ??

                        row?._asin

                        ??

                        "",


                    error:

                        error

                }

            );


            return {

                signal:

                    "Avoid",


                buySignal:

                    "Avoid",


                buy_signal:

                    "Avoid",


                colour:

                    "avoid",


                reason:

                    error?.message

                    ??

                    "Buy Signal calculation failed",


                reasonCode:

                    "BUY_SIGNAL_CALCULATION_ERROR",


                rules:

                    [],


                completed:

                    false

            };


        }


    }






    async calculateStatusTransition(

        row

    ){


        if(

            !this.statusEngine

            ||

            typeof this.statusEngine.calculateTransition !==

                "function"

        ){


            return null;


        }


        try{


            const transition =

                await this.statusEngine.calculateTransition(

                    row

                );


            return transition ===

                "Qualified"

                ||

                transition ===

                    "Qualified Out"

                ? transition

                : null;


        }

        catch(error){


            console.error(

                "[PHX STATUS TRANSITION ERROR]",

                {

                    asin:

                        row?.asin

                        ??

                        row?._asin

                        ??

                        "",


                    error:

                        error

                }

            );


            return null;


        }


    }





    async calculateRow(

        row,

        dashboardConstants = {}

    ){


        if(

            !row

            ||

            typeof row !==

                "object"

        ){


            return row;


        }


        const enrichedRow =

            this.enrichCalculationSettings(

                row,

                dashboardConstants

            );


        const context =

            new CalculationContext(

                enrichedRow,

                dashboardConstants

            );


        const result =

            this.createInitialResult(

                context

            );


        for(

            const calculator of this.calculators

        ){


            await this.runCalculator(

                calculator,

                context,

                result

            );


        }


        result.complete();


        const calculation =

            result.toJSON();


        const publishedCalculation =

            this.buildPublishedCalculation(

                calculation

            );


        const score =

            await this.calculateScore(

                enrichedRow,

                publishedCalculation

            );


        const scorePercent =

            Number(

                score?.percent

                ??

                0

            );


        const scoreRaw =

            Number(

                score?.rawScore

                ??

                0

            );


        const scoreMax =

            Number(

                score?.maxScore

                ??

                0

            );


        const scoreRules =

            Array.isArray(

                score?.rules

            )

                ? score.rules

                : [];


        if(score){


            publishedCalculation.score =

                score;


            publishedCalculation.opportunityScore =

                scorePercent;


            publishedCalculation.opportunity_score =

                scorePercent;


        }


        const buySignal =

            await this.calculateBuySignal(

                enrichedRow,

                publishedCalculation,

                score

            );


        const buySignalLabel =

            String(

                buySignal?.signal

                ??

                buySignal?.buySignal

                ??

                buySignal?.buy_signal

                ??

                ""

            ).trim();


        const buySignalColour =

            String(

                buySignal?.colour

                ??

                buySignal?.color

                ??

                ""

            ).trim();


        const buySignalReason =

            String(

                buySignal?.reason

                ??

                buySignal?.reasonText

                ??

                ""

            ).trim();


        const buySignalReasonCode =

            String(

                buySignal?.reasonCode

                ??

                buySignal?.code

                ??

                ""

            ).trim();


        const buySignalRules =

            Array.isArray(

                buySignal?.rules

            )

                ? buySignal.rules

                : [];


        if(buySignal){


            publishedCalculation.buySignal =

                buySignal;


            publishedCalculation.buy_signal =

                buySignalLabel;


            publishedCalculation.buySignalLabel =

                buySignalLabel;


            publishedCalculation.buySignalColour =

                buySignalColour;


            publishedCalculation.buySignalReason =

                buySignalReason;


            publishedCalculation.buySignalReasonCode =

                buySignalReasonCode;


            publishedCalculation.buySignalRules =

                buySignalRules;


        }


        const canonicalRowBeforeStatus = {

            ...enrichedRow,


            opportunity_score:

                scorePercent,


            opportunityScore:

                scorePercent,


            score:

                scorePercent,


            _score:

                scorePercent,


            score_raw:

                scoreRaw,


            score_max:

                scoreMax,


            score_rules:

                scoreRules,


            score_breakdown:

                score,


            buy_signal:

                buySignalLabel,


            buySignal:

                buySignalLabel,


            BuySignal:

                buySignalLabel,


            _buySignal:

                buySignalLabel,


            __finalBuySignal:

                buySignalLabel,


            signal:

                buySignalLabel,


            buy_signal_colour:

                buySignalColour,


            buySignalColour:

                buySignalColour,


            buy_signal_reason:

                buySignalReason,


            buySignalReason:

                buySignalReason,


            _buySignalReason:

                buySignalReason,


            buy_signal_reason_text:

                buySignalReason,


            buySignalReasonText:

                buySignalReason,


            buy_signal_reason_code:

                buySignalReasonCode,


            buySignalReasonCode:

                buySignalReasonCode,


            _buySignalReasonCode:

                buySignalReasonCode,


            buy_signal_rules:

                buySignalRules,


            calc:

                publishedCalculation

        };


        const statusTracker =

            canonicalRowBeforeStatus.status_tracker

            ||

            null;


        const currentStatus =

            String(

                statusTracker?.status

                ??

                canonicalRowBeforeStatus.status

                ??

                "Review"

            ).trim()

            ||

            "Review";


        const overrideStatus =

            String(

                statusTracker?.override

                ??

                canonicalRowBeforeStatus.override

                ??

                canonicalRowBeforeStatus._override

                ??

                canonicalRowBeforeStatus.override_status

                ??

                canonicalRowBeforeStatus._override_status

                ??

                canonicalRowBeforeStatus.tracker_override

                ??

                canonicalRowBeforeStatus.status_tracker_override

                ??

                ""

            ).trim();


        const overrideEnabled =

            overrideStatus !==

            "";


        const statusTransition =

            overrideEnabled

                ? null

                : await this.calculateStatusTransition(

                    canonicalRowBeforeStatus

                );


        const status =

            overrideEnabled

                ? overrideStatus

                : statusTransition

                    ??

                    currentStatus;


        const statusReason =

            overrideEnabled

                ? "Manual override"

                : statusTransition

                    &&

                    statusTransition !==

                        currentStatus

                    ? "Automatic status update"

                    : "";


        const statusChanged =

            status !==

            currentStatus;


        publishedCalculation.status =

            status;


        publishedCalculation.status_reason =

            statusReason;


        publishedCalculation.status_changed =

            statusChanged;


        return {

            ...canonicalRowBeforeStatus,


            status:

                status,


            status_reason:

                statusReason,


            statusReason:

                statusReason,


            status_changed:

                statusChanged,


            statusChanged:

                statusChanged,


            calc:

                publishedCalculation

        };


    }






    async calculateRows(

        rows = [],

        dashboardConstants = {}

    ){


        if(

            !Array.isArray(

                rows

            )

        ){


            return [];


        }


        const calculatedRows =

            [];


        for(

            const row of rows

        ){


            calculatedRows.push(

                await this.calculateRow(

                    row,

                    dashboardConstants

                )

            );


        }


        return calculatedRows;


    }


}