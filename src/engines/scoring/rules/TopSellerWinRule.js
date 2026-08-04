import { RuleResult }
    from "../RuleResult.js";


export class TopSellerWinRule {


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


        const percentage =

            this.number(

                row.top_seller_win_percent_30_day

                ??

                row.top_seller_win_percent

                ??

                row.buy_box_top_seller_percent

                ??

                0,

                0

            );


        return new RuleResult({

            rule:

                "top_seller_win_percent",


            label:

                "Top Seller Win % (30 Day)",


            outcome:

                "",


            value:

                percentage,


            validated:

                `${percentage.toFixed(1)}%`,


            ruleApplied:

                "Configured Top Seller Win % band",


            calculation:

                `Top Seller Win = ${percentage.toFixed(1)}%`,


            resolverType:

                "band",


            fallbackScore:

                0

        });


    }


}
