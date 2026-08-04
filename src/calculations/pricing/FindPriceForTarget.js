export class FindPriceForTarget {


    constructor(

        profitAtPrice

    ){


        this.profitAtPrice =

            profitAtPrice;


        this.lastTrace =

            null;


        this.cappedSearches =

            0;


    }






    ensureAvailable(){


        if(

            !this.profitAtPrice

            ||

            typeof this.profitAtPrice.calculate !==

                "function"

        ){


            throw new Error(

                "FindPriceForTarget requires ProfitAtPrice.calculate()"

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






    normaliseMethod(value){


        const method =

            String(

                value

                ??

                ""

            )

                .trim()

                .toLowerCase();


        if(

            method === "margin"

            ||

            method === "profit margin"

        ){


            return "margin";


        }


        if(

            method === "profit"

            ||

            method === "target profit"

        ){


            return "profit";


        }


        if(

            method === "roi"

            ||

            method === "return on investment"

        ){


            return "roi";


        }


        return "";


    }






    getSettings(context){


        const settings =

            context?.row?.calculationSettings;


        return settings

        &&

        typeof settings ===

            "object"

            ? settings

            : {};


    }






    getConstants(context){


        const settings =

            this.getSettings(

                context

            );


        const dashboardConstants =

            context?.dashboardConstants

            &&

            typeof context.dashboardConstants ===

                "object"

                ? context.dashboardConstants

                : {};


        return {

            ...dashboardConstants,


            targetRoiPercent:

                settings.targetRoiPercent

                ??

                dashboardConstants.targetRoiPercent

                ??

                dashboardConstants.target_roi

                ??

                dashboardConstants.target_roi_percent

                ??

                0,


            targetMarginPercent:

                settings.targetMarginPercent

                ??

                dashboardConstants.targetMarginPercent

                ??

                dashboardConstants.target_profit_margin

                ??

                dashboardConstants.target_profit_margin_percent

                ??

                0,


            targetProfitAmount:

                settings.targetProfitAmount

                ??

                dashboardConstants.targetProfitAmount

                ??

                dashboardConstants.target_profit

                ??

                0

        };


    }






    calculatePriceLoopStart(

        packCostInclTax

    ){


        return Math.max(

            0.01,

            Math.floor(

                this.number(

                    packCostInclTax,

                    0

                )

                *

                100

            )

            /

            100

        );


    }






    targetProfitRequirementForPrice(

        method,

        price,

        packCostInclTax,

        constants

    ){


        const resolvedPrice =

            Math.max(

                0,

                this.number(

                    price,

                    0

                )

            );


        const resolvedCost =

            Math.max(

                0,

                this.number(

                    packCostInclTax,

                    0

                )

            );


        const targetRoi =

            Math.max(

                0,

                this.number(

                    constants?.targetRoiPercent,

                    0

                )

            );


        const targetMargin =

            Math.max(

                0,

                this.number(

                    constants?.targetMarginPercent,

                    0

                )

            );


        const targetProfit =

            Math.max(

                0,

                this.number(

                    constants?.targetProfitAmount,

                    0

                )

            );


        if(method === "margin"){


    return (

        resolvedPrice

        *

        (

            targetMargin

            /

            100

        )

    );


}


        if(method === "profit"){


            return this.roundMoney(

                targetProfit

            );


        }


        return this.roundMoney(

            resolvedCost

            *

            (

                targetRoi

                /

                100

            )

        );


    }






    resultMeetsTargetMethod(

        result,

        price,

        packCostInclTax,

        constants,

        method

    ){


        const requiredProfit =

            this.targetProfitRequirementForPrice(

                method,

                price,

                packCostInclTax,

                constants

            );


        return this.number(

            result?.profit,

            0

        )

        +

        0.000001

        >=

        requiredProfit;


    }






    async runPredicate(

        predicate,

        result,

        price

    ){


        if(

            typeof predicate !==

                "function"

        ){


            return false;


        }


        return Boolean(

            await predicate(

                result,

                price

            )

        );


    }
        async calculateAt({

        price,

        maxPrice,

        packCostInclTax,

        constants,

        context,

        taxRateOnSale,

        rowInputs,

        packTaxAmount,

        predicate,

        method,

        debug,

        refine = ""

    }){


        const roundedPrice =

            this.roundMoney(

                Math.max(

                    0.01,

                    Math.min(

                        maxPrice,

                        price

                    )

                )

            );


        const result =

            await this.profitAtPrice.calculate({

                salePrice:

                    roundedPrice,


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


        const requiredProfit =

            method

                ? this.targetProfitRequirementForPrice(

                    method,

                    roundedPrice,

                    packCostInclTax,

                    constants

                )

                : null;


        const pass =

            method

                ? this.resultMeetsTargetMethod(

                    result,

                    roundedPrice,

                    packCostInclTax,

                    constants,

                    method

                )

                : await this.runPredicate(

                    predicate,

                    result,

                    roundedPrice

                );






        /*
            Temporary parity trace.

            This records the prices around the current
            OpportunityOS target so we can see exactly
            why Phoenix accepts or rejects each penny.
        */


        if(

            roundedPrice >= 7.60

            &&

            roundedPrice <= 7.66

        ){


            console.log(

                "[PHX TARGET TRACE]",

                {

                    price:

                        roundedPrice,


                    method:

                        method,


                    requiredProfit:

                        requiredProfit,


                    actualProfit:

                        this.number(

                            result?.profit,

                            0

                        ),


                    roi:

                        this.number(

                            result?.roiPercent,

                            0

                        ),


                    margin:

                        this.number(

                            result?.marginPercent,

                            0

                        ),


                    pass:

                        pass,


                    refine:

                        refine

                }

            );


        }


        const difference =

            method

                ? this.roundMoney(

                    requiredProfit

                    -

                    this.number(

                        result?.profit,

                        0

                    )

                )

                : 0;


        debug.push({

            iteration:

                debug.length

                +

                1,


            price:

                roundedPrice,


            profit:

                this.number(

                    result?.profit,

                    0

                ),


            roi:

                this.roundMoney(

                    result?.roiPercent

                ),


            margin:

                this.roundMoney(

                    result?.marginPercent

                ),


            requiredProfit:

                requiredProfit,


            difference:

                difference,


            pass:

                pass,


            refine:

                refine

        });


        return {

            price:

                roundedPrice,


            result:

                result,


            requiredProfit:

                requiredProfit,


            pass:

                pass,


            difference:

                difference

        };


    }






    recordCappedSearch({

        rowInputs,

        startPrice,

        maxPrice,

        debug,

        packCostInclTax,

        method

    }){


        this.cappedSearches +=

            1;


        this.lastTrace = {

            status:

                "capped",


            key:

                String(

                    rowInputs?.asin

                    ??

                    rowInputs?._asin

                    ??

                    rowInputs?.key

                    ??

                    rowInputs?.rowKey

                    ??

                    "unknown"

                ),


            start:

                startPrice,


            max:

                maxPrice,


            tests:

                debug.length,


            packCost:

                packCostInclTax,


            method:

                method,


            debug:

                debug,


            at:

                new Date().toISOString()

        };


        console.warn(

            "[PHX TARGET PRICE SEARCH CAPPED]",

            this.lastTrace

        );


    }






    recordCompletedSearch({

        method,

        startPrice,

        answer,

        packCostInclTax,

        debug,

        rowInputs

    }){


        this.lastTrace = {

            status:

                "complete",


            method:

                method,


            start:

                startPrice,


            answer:

                this.roundMoney(

                    answer

                ),


            iterations:

                debug.length,


            packCost:

                packCostInclTax,


            debug:

                debug,


            at:

                new Date().toISOString()

        };


        if(

            rowInputs

            &&

            typeof rowInputs ===

                "object"

        ){


            rowInputs._phoenixLastTargetPriceLoop =

                this.lastTrace;


        }


    }
        async find({

        packCostInclTax = 0,

        context,

        taxRateOnSale = null,

        rowInputs = {},

        packTaxAmount = 0,

        predicate,

        startPrice,

        mode = ""

    } = {}){


        this.ensureAvailable();


        const constants =

            this.getConstants(

                context

            );


        const resolvedPackCost =

            this.number(

                packCostInclTax,

                0

            );


        const method =

            this.normaliseMethod(

                mode

            );


        const initialPrice =

            this.hasValue(

                startPrice

            )

                ? Math.max(

                    0.01,

                    this.roundMoney(

                        startPrice

                    )

                )

                : this.calculatePriceLoopStart(

                    resolvedPackCost

                );


        const debug =

            [];


        const maximumDifferenceIterations =

            18;


        const configuredCap =

            this.number(

                constants.targetPriceMaxSearchPrice

                ??

                constants.target_price_max_search_price,

                0

            );


        const configuredSpan =

            this.number(

                constants.targetPriceMaxSearchSpan

                ??

                constants.target_price_max_search_span,

                0

            );


        const maximumSearchSpan =

            configuredSpan > 0

                ? configuredSpan

                : 150;


        const maximumPrice =

            configuredCap > 0

                ? Math.max(

                    initialPrice,

                    configuredCap

                )

                : Math.min(

                    999.99,

                    this.roundMoney(

                        initialPrice

                        +

                        maximumSearchSpan

                    )

                );






        /*
            Difference-jump loop.

            Compare required profit with actual profit and
            add the shortfall to the selling price.
        */


        let probe =

            await this.calculateAt({

                price:

                    initialPrice,


                maxPrice:

                    maximumPrice,


                packCostInclTax:

                    resolvedPackCost,


                constants:

                    constants,


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


                method:

                    method,


                debug:

                    debug

            });


        for(

            let iteration = 0;

            iteration <

                maximumDifferenceIterations

            &&

            !probe.pass;

            iteration += 1

        ){


            const increase =

                method

                    ? Math.max(

                        0.01,

                        probe.difference

                    )

                    : Math.max(

                        0.25,

                        Math.abs(

                            this.number(

                                probe.result?.profit,

                                0

                            )

                        )

                        ||

                        0.25

                    );


            const nextPrice =

                this.roundMoney(

                    probe.price

                    +

                    increase

                );


            if(

                nextPrice <=

                    probe.price

                ||

                nextPrice >=

                    maximumPrice

            ){


                break;


            }


            probe =

                await this.calculateAt({

                    price:

                        nextPrice,


                    maxPrice:

                        maximumPrice,


                    packCostInclTax:

                        resolvedPackCost,


                    constants:

                        constants,


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


                    method:

                        method,


                    debug:

                        debug

                });


        }






        /*
            Last-resort exponential search for unusual rows.
        */


        if(!probe.pass){


            let step =

                1;


            while(

                !probe.pass

                &&

                probe.price <

                    maximumPrice

                &&

                debug.length <

                    35

            ){


                step =

                    Math.min(

                        step

                        *

                        2,

                        25

                    );


                probe =

                    await this.calculateAt({

                        price:

                            this.roundMoney(

                                probe.price

                                +

                                step

                            ),


                        maxPrice:

                            maximumPrice,


                        packCostInclTax:

                            resolvedPackCost,


                        constants:

                            constants,


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


                        method:

                            method,


                        debug:

                            debug

                    });


            }


        }


        if(!probe.pass){


            this.recordCappedSearch({

                rowInputs:

                    rowInputs,


                startPrice:

                    initialPrice,


                maxPrice:

                    maximumPrice,


                debug:

                    debug,


                packCostInclTax:

                    resolvedPackCost,


                method:

                    method

            });


            return 0;


        }
                /*
            Final penny tightening.

            Walk down until the previous penny fails, then
            verify upwards if rounding left the answer short.
        */


        let answer =

            probe.price;


        let guard =

            0;


        while(guard++ < 30){


            const previousPrice =

                this.roundMoney(

                    answer

                    -

                    0.01

                );


            if(previousPrice < 0.01){


                break;


            }


            const previousProbe =

                await this.calculateAt({

                    price:

                        previousPrice,


                    maxPrice:

                        maximumPrice,


                    packCostInclTax:

                        resolvedPackCost,


                    constants:

                        constants,


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


                    method:

                        method,


                    debug:

                        debug,


                    refine:

                        "down"

                });


            if(previousProbe.pass){


                answer =

                    previousPrice;


            }

            else {


                break;


            }


        }


        while(guard++ < 60){


            const currentProbe =

                await this.calculateAt({

                    price:

                        answer,


                    maxPrice:

                        maximumPrice,


                    packCostInclTax:

                        resolvedPackCost,


                    constants:

                        constants,


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


                    method:

                        method,


                    debug:

                        debug,


                    refine:

                        "up-check"

                });


            if(currentProbe.pass){


                break;


            }


            answer =

                this.roundMoney(

                    answer

                    +

                    0.01

                );


        }


        this.recordCompletedSearch({

            method:

                method,


            startPrice:

                initialPrice,


            answer:

                answer,


            packCostInclTax:

                resolvedPackCost,


            debug:

                debug,


            rowInputs:

                rowInputs

        });


        return this.roundMoney(

            answer

        );


    }


}