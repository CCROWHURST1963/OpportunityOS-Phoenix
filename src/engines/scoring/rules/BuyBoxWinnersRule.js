import { RuleResult }
    from "../RuleResult.js";


export class BuyBoxWinnersRule {


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


        const winners =

            this.number(

                row.buy_box_winners_30_day

                ??

                row.buybox_winners_30_day

                ??

                row.win_count_30_day

                ??

                row.buy_box_winners

                ??

                0,

                0

            );


        return new RuleResult({

            rule:

                "buy_box_winners",


            label:

                "Buy Box Winners (30 Day)",


            outcome:

                "",


            value:

                winners,


            validated:

                `${winners}`,


            ruleApplied:

                "Configured Buy Box Winners band",


            calculation:

                `Buy Box Winners = ${winners}`,


            resolverType:

                "band",


            fallbackScore:

                0

        });


    }


}