import { ScoreResult }
    from "./ScoreResult.js";



export class ScoreEngine {


    constructor(

        resolver,

        rules = []

    ){


        this.resolver =

            resolver;


        this.rules =

            Array.isArray(

                rules

            )

                ? rules.filter(

                    rule =>

                        rule

                        &&

                        typeof rule.calculate ===

                            "function"

                )

                : [];


    }






    ensureAvailable(){


        if(

            !this.resolver

            ||

            typeof this.resolver.ruleScore !==

                "function"

            ||

            typeof this.resolver.ruleBand !==

                "function"

            ||

            typeof this.resolver.getRuleMaxScore !==

                "function"

        ){


            throw new Error(

                "ScoreEngine requires a configured ScoringRuleResolver"

            );


        }


    }






    getRuleResultJSON(ruleResult){


        if(

            ruleResult

            &&

            typeof ruleResult.toJSON ===

                "function"

        ){


            return ruleResult.toJSON();


        }


        return ruleResult

        &&

        typeof ruleResult ===

            "object"

            ? {

                ...ruleResult

            }

            : {};


    }






    resolveRuleScore(ruleResult){


        const result =

            this.getRuleResultJSON(

                ruleResult

            );


        const resolverType =

            String(

                result.resolverType

                ??

                "score"

            )

                .trim()

                .toLowerCase();


        /*
            Direct results deliberately bypass the resolver.

            This is required for cases such as missing
            Price Deviation, where null must score zero
            instead of being interpreted as numeric zero
            and matched to the best configured band.
        */


        if(resolverType === "direct"){


            return {

                label:

                    result.outcome

                    ??

                    "",


                score:

                    Number(

                        result.fallbackScore

                        ??

                        0

                    ),


                rule:

                    null,


                matched:

                    false

            };


        }






        if(resolverType === "band"){


            return this.resolver.ruleBand(

                result.rule,

                result.value,

                result.outcome,

                result.fallbackScore

            );


        }


        return this.resolver.ruleScore(

            result.rule,

            result.outcome,

            result.fallbackScore

        );


    }






    buildResolvedRule(

        ruleResult,

        resolvedScore

    ){


        const result =

            this.getRuleResultJSON(

                ruleResult

            );


        const configuredRule =

            resolvedScore?.rule

            &&

            typeof resolvedScore.rule ===

                "object"

                ? resolvedScore.rule

                : null;


        return {

            ...result,


            outcome:

                resolvedScore?.label

                ||

                result.outcome

                ||

                "",


            score:

                Number(

                    resolvedScore?.score

                    ??

                    result.fallbackScore

                    ??

                    0

                ),


            maxScore:

                Number(

                    this.resolver.getRuleMaxScore(

                        result.rule

                    )

                    ??

                    0

                ),


            matched:

                Boolean(

                    resolvedScore?.matched

                ),


            configuredRule:

                configuredRule

        };


    }






    async runRule(

        rule,

        context

    ){


        const ruleResult =

            await rule.calculate(

                context

            );


        if(!ruleResult){


            return null;


        }


        const resolvedScore =

            this.resolveRuleScore(

                ruleResult

            );


        return this.buildResolvedRule(

            ruleResult,

            resolvedScore

        );


    }






    async calculate(

        context = {}

    ){


        this.ensureAvailable();


        const scoreResult =

            new ScoreResult();


        for(

            const rule of this.rules

        ){


            try{


                const resolvedRule =

                    await this.runRule(

                        rule,

                        context

                    );


                if(resolvedRule){


                    scoreResult.add(

                        resolvedRule

                    );


                }


            }

            catch(error){


                console.error(

                    "[PHX SCORE RULE ERROR]",

                    {

                        asin:

                            context?.row?.asin

                            ??

                            context?.row?._asin

                            ??

                            "",


                        rule:

                            rule?.constructor?.name

                            ??

                            "UnknownRule",


                        error:

                            error

                    }

                );


            }


        }


        scoreResult.complete();


        return scoreResult;


    }


}