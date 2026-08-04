import { RuleResult }
    from "../RuleResult.js";


export class BuyBoxAtOrAboveTargetRule {


    constructor(

        resolver

    ){


        this.resolver =

            resolver;


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






    money(value){


        return "£"

        +

        this.number(

            value,

            0

        ).toFixed(

            2

        );


    }






    calculate(context){


        const row =

            context.row;


        const calc =

            context.calc

            ||

            {};


        /*
            Production behaviour.

            Highest validated selling price wins.
        */


        const current =

            this.number(

                row.validated_sales_price

            );


        const price30 =

            this.number(

                row.avg_price_30

            );


        const price90 =

            this.number(

                row.avg_price_90

            );


        const price180 =

            this.number(

                row.avg_price_180

            );


        const buyBox =

            Math.max(

                current,

                price30,

                price90,

                price180

            );


        const target =

            this.number(

                calc.targetSellingPrice

            );


        const outcome =

            buyBox >= target

                ? "YES"

                : "NO";


        return new RuleResult({

            rule:

                "min_profit_target",


            label:

                "Buy Box At Or Above Target Selling Price",


            outcome:


                outcome,


            value:

                buyBox,


            validated:

                this.money(

                    buyBox

                ),


            ruleApplied:

                outcome === "YES"

                    ?

                    "Buy Box ≥ Target"

                    :

                    "Buy Box < Target",


            calculation:

                `${this.money(buyBox)} vs ${this.money(target)}`,


            resolverType:

                "score"

        });


    }


}