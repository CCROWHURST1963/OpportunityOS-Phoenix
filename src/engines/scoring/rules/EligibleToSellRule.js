import { RuleResult }
    from "../RuleResult.js";


export class EligibleToSellRule {


    normaliseText(value){


        return String(

            value

            ??

            ""

        )

            .replace(

                /\s+/g,

                " "

            )

            .trim();


    }






    getEligibleToSellValue(row){


        return this.normaliseText(

            row._eligibleToSell

            ??

            row.status_tracker_eligible_to_sell

            ??

            row.tracker_eligible_to_sell

            ??

            row.eligible_to_sell

            ??

            row.eligibleToSell

            ??

            row.eligible

            ??

            row.eligibility

            ??

            row.ability_to_sell

            ??

            ""

        );


    }






    resolveScore(eligible){


        const value =

            this.normaliseText(

                eligible

            );


        const normalised =

            value.toLowerCase();


        if(!normalised){


            return {

                score:

                    1,


                result:

                    "Unknown / blank",


                optionLabel:

                    "Other / Review",


                rule:

                    "Blank or unrecognised values score 1",


                value:

                    "—"

            };


        }


        const scoreThreeValues =

            new Set([

                "no known issues",

                "no known issue",

                "gated - approved"

            ]);


        const scoreZeroValues =

            new Set([

                "qualified out",

                "gated - not accepting applications",

                "exclude",

                "not available",

                "gated - transparency code needed"

            ]);


        if(

            scoreThreeValues.has(

                normalised

            )

        ){


            return {

                score:

                    3,


                result:

                    "Clear / Approved",


                optionLabel:

                    "No Known Issues / Gated - Approved",


                rule:

                    "No Known Issues or Gated - Approved = 3",


                value:

                    value

            };


        }


        if(

            normalised ===

                "gated - approval needed"

        ){


            return {

                score:

                    2,


                result:

                    "Approval Needed",


                optionLabel:

                    "Gated - Approval Needed",


                rule:

                    "Gated - Approval Needed = 2",


                value:

                    value

            };


        }


        if(

            scoreZeroValues.has(

                normalised

            )

        ){


            return {

                score:

                    0,


                result:

                    "Blocked / Excluded",


                optionLabel:

                    "Qualified Out / Blocked",


                rule:

                    "Qualified Out, Not Accepting Applications, Exclude, Not Available or Transparency Code Needed = 0",


                value:

                    value

            };


        }


        return {

            score:

                1,


            result:

                "Review",


            optionLabel:

                "Other / Review",


            rule:

                "Any other Eligible To Sell value = 1",


            value:

                value

        };


    }






    calculate(

        context

    ){


        const row =

            context?.row

            ??

            {};


        const eligible =

            this.getEligibleToSellValue(

                row

            );


        const resolved =

            this.resolveScore(

                eligible

            );


        return new RuleResult({

            rule:

                "eligible_to_sell",


            label:

                "Eligible To Sell",


            outcome:

                resolved.optionLabel,


            value:

                resolved.value,


            validated:

                resolved.value,


            ruleApplied:

                "3 = No Known Issues / Gated - Approved; 2 = Gated - Approval Needed; 0 = blocked/excluded; 1 = other",


            calculation:

                resolved.rule,


            resolverType:

                "score",


            fallbackScore:

                resolved.score

        });


    }


}