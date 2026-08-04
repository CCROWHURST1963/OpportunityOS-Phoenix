import { RuleResult }
    from "../RuleResult.js";


export class AmazonOOSRule {


    hasValue(value){


        return (

            value !== null

            &&

            value !== undefined

            &&

            String(value).trim() !== ""

        );


    }






    number(

        value,

        fallback = 0

    ){


        if(

            !this.hasValue(value)

        ){

            return fallback;

        }


        const parsed =

            Number(value);


        return Number.isFinite(parsed)

            ? parsed

            : fallback;


    }






    calculate(

        context

    ){


        const row =

            context?.row

            ??

            {};


        const amazonOosDays =

            this.number(

                row.amazon_oos_90_day

                ??

                row.amazon_oos_days

                ??

                row.amazon_oos

                ??

                0,

                0

            );


        return new RuleResult({

            rule:

                "amazon_oos_90_day",


            label:

                "Amazon 90 Day OOS",


            outcome:

                "",


            value:

                amazonOosDays,


            validated:

                `${amazonOosDays} days`,


            ruleApplied:

                "Configured Amazon OOS band",


            calculation:

                `Amazon OOS = ${amazonOosDays} days`,


            resolverType:

                "band",


            fallbackScore:

                0

        });


    }


}