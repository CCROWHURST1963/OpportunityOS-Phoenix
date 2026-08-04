import { BuySignalResult }
    from "./BuySignalResult.js";


export class BuySignalEngine {


    constructor(

        rules = null

    ){


        this.defaultRules = [

            {

                buy_signal:

                    "Strong Buy",


                min_score:

                    80,


                sort_order:

                    10,


                active:

                    true

            },

            {

                buy_signal:

                    "Buy",


                min_score:

                    65,


                sort_order:

                    20,


                active:

                    true

            },

            {

                buy_signal:

                    "Review",


                min_score:

                    45,


                sort_order:

                    30,


                active:

                    true

            },

            {

                buy_signal:

                    "Avoid",


                min_score:

                    0,


                sort_order:

                    40,


                active:

                    true

            }

        ];


        this.rules =

            this.normaliseRules(

                rules

            );


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    number(

        value,

        fallback = 0

    ){


        if(

            value === null

            ||

            value === undefined

            ||

            this.normaliseText(

                value

            ) === ""

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






    normaliseRules(rules){


        const source =

            Array.isArray(

                rules

            )

            &&

            rules.length > 0

                ? rules

                : this.defaultRules;


        return source

            .filter(

                rule =>

                    rule

                    &&

                    typeof rule ===

                        "object"

                    &&

                    rule.active !==

                        false

            )

            .map(

                (

                    rule,

                    index

                ) => ({

                    buy_signal:

                        this.normaliseText(

                            rule.buy_signal

                            ??

                            rule.option_label

                            ??

                            rule.label

                        ),


                    min_score:

                        this.number(

                            rule.min_score

                            ??

                            rule.minimumScore,

                            0

                        ),


                    sort_order:

                        this.number(

                            rule.sort_order,

                            index

                        ),


                    active:

                        rule.active !==

                            false

                })

            )

            .filter(

                rule =>

                    Boolean(

                        rule.buy_signal

                    )

            )

            .sort(

                (

                    a,

                    b

                ) =>

                    b.min_score

                    -

                    a.min_score

                    ||

                    a.sort_order

                    -

                    b.sort_order

            );


    }






    setRules(rules){


        this.rules =

            this.normaliseRules(

                rules

            );


        return this;


    }






    getScore(context){


        const score =

            context?.score

            ??

            context?.scoreResult

            ??

            context?.calc?.score

            ??

            context?.row?.score_breakdown

            ??

            {};


        return score

        &&

        typeof score ===

            "object"

            ? score

            : {};


    }






    getScorePercent(score){


        return this.number(

            score?.percent

            ??

            score?.percentage

            ??

            score?.opportunityScore

            ??

            score?.opportunity_score,

            0

        );


    }






    getScoreRules(score){


        if(

            Array.isArray(

                score?.rules

            )

        ){


            return score.rules;


        }


        if(

            Array.isArray(

                score?.breakdown

            )

        ){


            return score.breakdown;


        }


        if(

            Array.isArray(

                score?.items

            )

        ){


            return score.items;


        }


        return [];


    }






    getRule(

        score,

        ruleName

    ){


        const target =

            this.normaliseText(

                ruleName

            ).toLowerCase();


        return this.getScoreRules(

            score

        ).find(

            rule =>

                this.normaliseText(

                    rule?.rule

                    ??

                    rule?.ruleName

                    ??

                    rule?.rule_name

                ).toLowerCase() ===

                    target

        )

        ??

        null;


    }






    getWatchPriceScore(score){


        const watchRule =

            this.getRule(

                score,

                "watch_price"

            );


        if(watchRule){


            return this.number(

                watchRule.score

                ??

                watchRule.points,

                0

            );


        }


        if(

            score?.watchPriceScore !==

                undefined

            &&

            score?.watchPriceScore !==

                null

        ){


            return this.number(

                score.watchPriceScore,

                0

            );


        }


        return null;


    }






    getTargetSellingPrice(

        row,

        calc

    ){


        return this.number(

            calc?.targetSellingPrice

            ??

            calc?.target_selling_price

            ??

            calc?.adjustedTargetSellingPrice

            ??

            calc?.adjusted_target_selling_price

            ??

            calc?.effectiveTargetSellingPriceForRule

            ??

            calc?.effective_target_selling_price_for_rule

            ??

            row?.target_selling_price

            ??

            row?.targetSellingPrice,

            0

        );


    }






    getHistoricalReferencePrice(row){


        return Math.max(

            this.number(

                row?.validated_sales_price

                ??

                row?.new_current_price

                ??

                row?.current_sale_price,

                0

            ),

            this.number(

                row?.avg_price_30_day

                ??

                row?.avg_30_day_price

                ??

                row?.average_30_day_price,

                0

            ),

            this.number(

                row?.avg_price_90_day

                ??

                row?.avg_90_day_price

                ??

                row?.average_90_day_price,

                0

            ),

            this.number(

                row?.avg_price_180_day

                ??

                row?.avg_180_day_price

                ??

                row?.average_180_day_price,

                0

            )

        );


    }






    targetIsAboveAllAveragePrices(

        row,

        targetPrice

    ){


        const averagePrices = [

            this.number(

                row?.avg_price_30_day

                ??

                row?.avg_30_day_price

                ??

                row?.average_30_day_price,

                0

            ),

            this.number(

                row?.avg_price_90_day

                ??

                row?.avg_90_day_price

                ??

                row?.average_90_day_price,

                0

            ),

            this.number(

                row?.avg_price_180_day

                ??

                row?.avg_180_day_price

                ??

                row?.average_180_day_price,

                0

            )

        ];


        return targetPrice > 0

        &&

        averagePrices.every(

            price =>

                price > 0

                &&

                targetPrice >

                    price

        );


    }






    getHardCaps(score){


        return Array.isArray(

            score?.caps

        )

            ? score.caps

            : [];


    }






    getColour(signal){


        const normalised =

            this.normaliseText(

                signal

            ).toLowerCase();


        if(

            normalised ===

                "strong buy"

            ||

            normalised ===

                "strong opportunity"

            ||

            normalised ===

                "buy"

        ){


            return "strong";


        }


        if(

            normalised ===

                "watch"

        ){


            return "watch";


        }


        if(

            normalised ===

                "review"

        ){


            return "review";


        }


        if(

            normalised ===

                "weak"

        ){


            return "weak";


        }


        return "avoid";


    }






    createResult({

        signal,

        score,

        reason = "",

        reasonCode = "",

        matchedRule = null,

        rules = [],

        targetAlreadyAchieved = false,

        watchPriceScore = null,

        hardCapApplied = false

    }){


        return new BuySignalResult({

            signal:

                signal,


            colour:

                this.getColour(

                    signal

                ),


            score:

                score,


            reason:

                reason,


            reasonCode:

                reasonCode,


            matchedRule:

                matchedRule,


            rules:

                rules,


            completed:

                true,


            targetAlreadyAchieved:

                targetAlreadyAchieved,


            watchPriceScore:

                watchPriceScore,


            hardCapApplied:

                hardCapApplied

        });


    }






    calculate(

        context = {}

    ){


        const row =

            context?.row

            ??

            {};


        const calc =

            context?.calc

            ??

            {};


        const score =

            this.getScore(

                context

            );


        const percent =

            this.getScorePercent(

                score

            );


        const targetPrice =

            this.getTargetSellingPrice(

                row,

                calc

            );


        const historicalReferencePrice =

            this.getHistoricalReferencePrice(

                row

            );


        const targetAlreadyAchieved =

            targetPrice > 0

            &&

            historicalReferencePrice >=

                targetPrice;


        const watchPriceScore =

            this.getWatchPriceScore(

                score

            );


        const rules =

            this.normaliseRules(

                context?.rules

                ??

                this.rules

            );


        const caps =

            this.getHardCaps(

                score

            );


        const hardCapApplied =

            caps.length > 0;






        /*
            Legacy Watch Price ownership.

            A Watch Price score of zero forces Avoid when
            no historical reference price has achieved the
            target. A score of one forces Watch.
        */


        if(

            !targetAlreadyAchieved

            &&

            watchPriceScore ===

                0

        ){


            const reasonCode =

                this.targetIsAboveAllAveragePrices(

                    row,

                    targetPrice

                )

                &&

                historicalReferencePrice <

                    targetPrice

                    ? "TARGET_SELLING_PRICE_NOT_ACHIEVED_6M"

                    : "";


            const reason =

                reasonCode

                    ? "Target Selling Price not achieved in last 6 months"

                    : "Watch Price rule requires qualification out";


            return this.createResult({

                signal:

                    "Avoid",


                score:

                    percent,


                reason:

                    reason,


                reasonCode:

                    reasonCode,


                rules:

                    rules,


                targetAlreadyAchieved:

                    false,


                watchPriceScore:

                    watchPriceScore,


                hardCapApplied:

                    hardCapApplied

            });


        }


        if(

            !targetAlreadyAchieved

            &&

            watchPriceScore ===

                1

        ){


            return this.createResult({

                signal:

                    "Watch",


                score:

                    percent,


                reason:

                    "Watch Price rule requires monitoring",


                reasonCode:

                    "WATCH_PRICE_OVERRIDE",


                rules:

                    rules,


                targetAlreadyAchieved:

                    false,


                watchPriceScore:

                    watchPriceScore,


                hardCapApplied:

                    hardCapApplied

            });


        }






        /*
            Apply the configured Buy Signal thresholds.

            When hard score caps exist, legacy behaviour
            prevents the highest Strong Buy outcome.
        */


        for(

            const rule of rules

        ){


            const label =

                this.normaliseText(

                    rule.buy_signal

                );


            if(

                hardCapApplied

                &&

                label.toLowerCase() ===

                    "strong buy"

            ){


                continue;


            }


            if(

                percent >=

                    this.number(

                        rule.min_score,

                        0

                    )

            ){


                return this.createResult({

                    signal:

                        label,


                    score:

                        percent,


                    reason:

                        `Opportunity Score ${percent}% meets ${label} threshold of ${rule.min_score}%`,


                    reasonCode:

                        "SCORE_THRESHOLD_MATCH",


                    matchedRule:

                        rule,


                    rules:

                        rules,


                    targetAlreadyAchieved:

                        targetAlreadyAchieved,


                    watchPriceScore:

                        watchPriceScore,


                    hardCapApplied:

                        hardCapApplied

                });


            }


        }






        /*
            Legacy target-achieved safety fallback.
        */


        if(targetAlreadyAchieved){


            return this.createResult({

                signal:

                    "Review",


                score:

                    percent,


                reason:

                    "Target Selling Price has been achieved but no configured Buy Signal threshold matched",


                reasonCode:

                    "TARGET_ACHIEVED_FALLBACK",


                rules:

                    rules,


                targetAlreadyAchieved:

                    true,


                watchPriceScore:

                    watchPriceScore,


                hardCapApplied:

                    hardCapApplied

            });


        }


        return this.createResult({

            signal:

                "Avoid",


            score:

                percent,


            reason:

                "No Buy Signal rule matched",


            reasonCode:

                "NO_RULE_MATCH",


            rules:

                rules,


            targetAlreadyAchieved:

                false,


            watchPriceScore:

                watchPriceScore,


            hardCapApplied:

                hardCapApplied

        });


    }


}