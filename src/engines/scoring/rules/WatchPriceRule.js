import { RuleResult }
    from "../RuleResult.js";


export class WatchPriceRule {


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


        return `£${this.number(value, 0).toFixed(2)}`;


    }






    percent(

        buyBox,

        target

    ){


        if(target <= 0){


            return 0;


        }


        return (

            (

                target

                -

                buyBox

            )

            /

            target

        )

        *

        100;


    }






    calculate(context){


        const row =

            context?.row

            ??

            {};


        const calc =

            context?.calc

            ??

            {};


        const buyBox =

            this.number(

                row.validated_sales_price

                ??

                row.new_current_price

                ??

                row.current_sale_price

                ??

                0,

                0

            );


        const target =

            this.number(

                calc.targetSellingPrice

                ??

                calc.target_selling_price

                ??

                row.target_selling_price

                ??

                0,

                0

            );






        /*
            When the Buy Box has already achieved the
            Target Selling Price, award the full two
            points directly.

            This path must bypass the band resolver.
            Otherwise a value of zero can match the
            wrong configured numeric band.
        */


        if(

            buyBox >= target

            &&

            target > 0

        ){


            return new RuleResult({

                rule:

                    "watch_price",


                label:

                    "Watch Price",


                outcome:

                    "Target Selling Price already achieved",


                value:

                    0,


                validated:

                    "£0.00",


                ruleApplied:

                    "Target Selling Price already achieved",


                calculation:

                    `Buy Box ${this.money(buyBox)} >= Target ${this.money(target)}`,


                resolverType:

                    "direct",


                fallbackScore:

                    2

            });


        }


        const watchPercent =

            this.percent(

                buyBox,

                target

            );


        return new RuleResult({

            rule:

                "watch_price",


            label:

                "Watch Price",


            outcome:

                "No Match",


            value:

                watchPercent,


            validated:

                `${watchPercent.toFixed(2)}%`,


            ruleApplied:

                "Configured Watch Price band",


            calculation:

                `(${this.money(target)} - ${this.money(buyBox)})`
                +
                ` / ${this.money(target)}`
                +
                ` = ${watchPercent.toFixed(2)}%`,


            resolverType:

                "band",


            fallbackScore:

                0

        });


    }


}