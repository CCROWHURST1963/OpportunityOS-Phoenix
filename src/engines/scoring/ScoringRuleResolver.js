export class ScoringRuleResolver {


    constructor(

        scoringRuleService

    ){


        this.scoringRuleService =

            scoringRuleService;


        this.rules = [];


        this.ruleLookup =

            new Map();


        /*
            Canonical aliases copied from the production
            OpportunityOS scoring engine.

            Old and new database rule names therefore resolve
            to the same scoring rule.
        */


        this.ruleAliases = {

            min_profit_target_buybox:

                "min_profit_target",


            min_profit_target:

                "min_profit_target",


            buybox_winners_30_day:

                "buy_box_winners",


            buy_box_winners:

                "buy_box_winners",


            top_seller_win_percent_30_day:

                "top_seller_win_percent",


            top_seller_win_percent:

                "top_seller_win_percent",


            sales_estimated_on:

                "sales_source",


            sales_source:

                "sales_source",


            estimated_shared_sales:

                "shared_sales",


            shared_sales:

                "shared_sales",


            price_used:

                "price_used",


            validated_price_type:

                "price_used",


            validated_price_used:

                "price_used",


            breakeven_wiggle:

                "breakeven_wiggle",


            break_even_wiggle:

                "breakeven_wiggle",


            breakeven_margin:

                "breakeven_wiggle",


            watch_price:

                "watch_price",


            target_price_watch:

                "watch_price",


            buybox_target_percent:

                "watch_price"

        };


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseLabel(value){


        return this.normaliseText(

            value

        ).toLowerCase();


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

            String(

                value

            ).trim() === ""

        ){


            return fallback;


        }


        const parsed =

            Number(

                value

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : fallback;


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






    canonicalRuleName(value){


        const normalised =

            this.normaliseLabel(

                value

            );


        return (

            this.ruleAliases[normalised]

            ??

            normalised

        );


    }






    async load(userKey){


        if(

            !this.scoringRuleService

            ||

            typeof this.scoringRuleService.loadRules !==

                "function"

        ){


            throw new Error(

                "ScoringRuleResolver requires ScoringRuleService.loadRules()"

            );


        }


        const loadedRules =

            await this.scoringRuleService.loadRules(

                userKey

            );


        this.rules =

            Array.isArray(

                loadedRules

            )

                ? loadedRules

                    .filter(

                        rule =>

                            rule

                            &&

                            rule.active !== false

                    )

                    .filter(

                        rule =>

                            this.canonicalRuleName(

                                rule.rule_name

                            ) !== "supplier"

                    )

                : [];


        this.buildLookup();


        return this.rules;


    }






    buildLookup(){


        this.ruleLookup.clear();


        for(

            let index = 0;

            index < this.rules.length;

            index += 1

        ){


            const rule =

                this.rules[index];


            const canonicalName =

                this.canonicalRuleName(

                    rule.rule_name

                );


            if(!canonicalName){


                continue;


            }


            if(

                !this.ruleLookup.has(

                    canonicalName

                )

            ){


                this.ruleLookup.set(

                    canonicalName,

                    []

                );


            }


            this.ruleLookup

                .get(

                    canonicalName

                )

                .push({

                    ...rule,


                    _canonicalRuleName:

                        canonicalName,


                    _sourceIndex:

                        index

                });


        }


        for(

            const rules of this.ruleLookup.values()

        ){


            rules.sort(

                (

                    first,

                    second

                ) => {


                    const firstOrder =

                        this.number(

                            first.sort_order,

                            first._sourceIndex

                        );


                    const secondOrder =

                        this.number(

                            second.sort_order,

                            second._sourceIndex

                        );


                    return firstOrder

                    -

                    secondOrder;


                }

            );


        }


    }






    getRules(ruleName){


        const canonicalName =

            this.canonicalRuleName(

                ruleName

            );


        return (

            this.ruleLookup.get(

                canonicalName

            )

            ??

            []

        );


    }






    ruleScore(

        ruleName,

        optionLabel,

        fallbackScore = 0

    ){


        const expectedLabel =

            this.normaliseLabel(

                optionLabel

            );


        const found =

            this.getRules(

                ruleName

            ).find(

                rule =>

                    this.normaliseLabel(

                        rule.option_label

                    ) ===

                    expectedLabel

            );


        if(!found){


            return {

                label:

                    this.normaliseText(

                        optionLabel

                    ),


                score:

                    this.number(

                        fallbackScore,

                        0

                    ),


                rule:

                    null,


                matched:

                    false

            };


        }


        return {

            label:

                this.normaliseText(

                    found.option_label

                ),


            score:

                this.number(

                    found.score,

                    fallbackScore

                ),


            rule:

                found,


            matched:

                true

        };


    }






    ruleBand(

        ruleName,

        value,

        fallbackLabel = "",

        fallbackScore = 0

    ){


        const numericValue =

            this.number(

                value,

                0

            );


        const rules =

            this.getRules(

                ruleName

            );


        for(

            const rule of rules

        ){


            const minimumMatches =

                !this.hasValue(

                    rule.min_value

                )

                ||

                numericValue >=

                    this.number(

                        rule.min_value,

                        Number.NEGATIVE_INFINITY

                    );


            const maximumMatches =

                !this.hasValue(

                    rule.max_value

                )

                ||

                numericValue <=

                    this.number(

                        rule.max_value,

                        Number.POSITIVE_INFINITY

                    );


            if(

                minimumMatches

                &&

                maximumMatches

            ){


                return {

                    label:

                        this.normaliseText(

                            rule.option_label

                        ),


                    score:

                        this.number(

                            rule.score,

                            fallbackScore

                        ),


                    rule:

                        rule,


                    matched:

                        true

                };


            }


        }


        return {

            label:

                this.normaliseText(

                    fallbackLabel

                ),


            score:

                this.number(

                    fallbackScore,

                    0

                ),


            rule:

                null,


            matched:

                false

        };


    }






    getRuleMaxScore(ruleName){


        return this.getRules(

            ruleName

        ).reduce(

            (

                maximum,

                rule

            ) =>

                Math.max(

                    maximum,

                    this.number(

                        rule.score,

                        0

                    )

                ),

            0

        );


    }






    getMaximumScore(){


        const maximumByRule =

            new Map();


        for(

            const rule of this.rules

        ){


            const canonicalName =

                this.canonicalRuleName(

                    rule.rule_name

                );


            if(

                !canonicalName

                ||

                canonicalName ===

                    "supplier"

            ){


                continue;


            }


            const score =

                this.number(

                    rule.score,

                    0

                );


            const existingMaximum =

                maximumByRule.get(

                    canonicalName

                )

                ??

                0;


            if(score > existingMaximum){


                maximumByRule.set(

                    canonicalName,

                    score

                );


            }


        }


        const total =

            Array.from(

                maximumByRule.values()

            ).reduce(

                (

                    sum,

                    value

                ) =>

                    sum

                    +

                    value,

                0

            );


        /*
            Production OpportunityOS fallback.
        */


        return total

        ||

        30;


    }






    getAudit(){


        const audit =

            [];


        for(

            const [

                canonicalName,

                rules

            ] of this.ruleLookup.entries()

        ){


            let maximumScore =

                0;


            let bestLabel =

                "";


            let rangeCount =

                0;


            let fixedCount =

                0;


            for(

                const rule of rules

            ){


                const score =

                    this.number(

                        rule.score,

                        0

                    );


                if(score > maximumScore){


                    maximumScore =

                        score;


                    bestLabel =

                        this.normaliseText(

                            rule.option_label

                        );


                }


                if(

                    this.hasValue(

                        rule.min_value

                    )

                    ||

                    this.hasValue(

                        rule.max_value

                    )

                ){


                    rangeCount +=

                        1;


                }

                else {


                    fixedCount +=

                        1;


                }


            }


            audit.push({

                ruleName:

                    canonicalName,


                rowCount:

                    rules.length,


                maximumScore:

                    maximumScore,


                bestLabel:

                    bestLabel,


                rangeCount:

                    rangeCount,


                fixedCount:

                    fixedCount,


                rules:

                    rules.slice()

            });


        }


        audit.sort(

            (

                first,

                second

            ) => {


                const firstRule =

                    first.rules[0];


                const secondRule =

                    second.rules[0];


                return this.number(

                    firstRule?.sort_order,

                    0

                )

                -

                this.number(

                    secondRule?.sort_order,

                    0

                );


            }

        );


        return {

            ruleCount:

                audit.length,


            maximumScore:

                this.getMaximumScore(),


            rules:

                audit

        };


    }


}