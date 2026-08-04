import { RuleResult }
    from "../RuleResult.js";


export class EligibleToSellRule {


    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    calculate(

        context

    ){


        const row =

            context?.row

            ??

            {};


        /*
            Production uses the Eligible To Sell
            status exactly as produced by the
            qualification pipeline.

            The database determines the score.
        */


        const eligible =

            this.normaliseText(

                row.eligible_to_sell

                ??

                row.eligibleToSell

                ??

                ""

            );


        return new RuleResult({

            rule:

                "eligible_to_sell",


            label:

                "Eligible To Sell",


            outcome:

                eligible,


            value:

                eligible,


            validated:

                eligible,


            ruleApplied:

                "Configured Eligible To Sell Rule",


            calculation:

                `Eligible To Sell = ${eligible}`,


            resolverType:

                "score",


            fallbackScore:

                0

        });


    }


}