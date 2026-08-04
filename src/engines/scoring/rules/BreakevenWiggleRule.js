import { RuleResult }
    from "../RuleResult.js";


export class BreakevenWiggleRule {


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






    number(

        value,

        fallback = 0

    ){


        if(

            !this.hasValue(

                value

            )

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

                    .trim()

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : fallback;


    }






    roundMoney(value){


        const resolved =

            this.number(

                value,

                0

            );


        return Math.round(

            (

                resolved

                +

                Number.EPSILON

            )

            *

            100

        )

        /

        100;


    }






    money(value){


        const resolved =

            this.roundMoney(

                value

            );


        return resolved < 0

            ? `-£${Math.abs(resolved).toFixed(2)}`

            : `£${resolved.toFixed(2)}`;


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

            row?.target_selling_price

            ??

            row?._targetSellingPrice

            ??

            0,

            0

        );


    }






    getBreakEvenPrice(

        row,

        calc

    ){


        return this.number(

            calc?.breakEvenPrice

            ??

            calc?.break_even_price

            ??

            row?.break_even_price

            ??

            row?.breakeven_price

            ??

            row?._breakEvenPrice

            ??

            0,

            0

        );


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


        const targetSellingPrice =

            this.getTargetSellingPrice(

                row,

                calc

            );


        const breakEvenPrice =

            this.getBreakEvenPrice(

                row,

                calc

            );


        const wiggle =

            this.roundMoney(

                targetSellingPrice

                -

                breakEvenPrice

            );


        return new RuleResult({

            rule:

                "breakeven_wiggle",


            label:

                "Breakeven Wiggle",


            outcome:

                "No Match",


            value:

                wiggle,


            validated:

                this.money(

                    wiggle

                ),


            ruleApplied:

                "Configured Breakeven Wiggle band",


            calculation:

                `Target ${this.money(targetSellingPrice)}`
                +
                ` - Breakeven ${this.money(breakEvenPrice)}`
                +
                ` = ${this.money(wiggle)}`,


            resolverType:

                "band",


            fallbackScore:

                0

        });


    }


}
