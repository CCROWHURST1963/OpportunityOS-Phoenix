import { RuleResult }
    from "../RuleResult.js";



export class ValidatedPriceTypeRule {


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






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    firstValue(

        row,

        fields = []

    ){


        for(

            const field of fields

        ){


            const value =

                row?.[field];


            if(

                this.hasValue(

                    value

                )

            ){


                return value;


            }


        }


        return "";


    }






    normalisePriceType(value){


        const raw =

            this.normaliseText(

                value

            );


        const normalised =

            raw.toLowerCase();


        if(

            normalised === "buy box"

            ||

            normalised === "buybox"

            ||

            normalised === "buy_box"

        ){


            return "Buy Box";


        }


        if(

            normalised === "30 day average"

            ||

            normalised === "30 day avg"

            ||

            normalised === "avg 30"

            ||

            normalised === "30_day_average"

        ){


            return "30 Day Average";


        }


        if(

            normalised === "90 day average"

            ||

            normalised === "90 day avg"

            ||

            normalised === "avg 90"

            ||

            normalised === "90_day_average"

        ){


            return "90 Day Average";


        }


        if(

            normalised === "180 day average"

            ||

            normalised === "180 day avg"

            ||

            normalised === "avg 180"

            ||

            normalised === "180_day_average"

        ){


            return "180 Day Average";


        }


        return raw;


    }






    calculate(context){


        const row =

            context?.row

            ??

            {};


        /*
            Production priority:

            validated_price_used
                ↓
            price_used

            Additional aliases are included only to support
            Phoenix row-shape migration.
        */


        const rawPriceType =

            this.firstValue(

                row,

                [

                    "validated_price_used",

                    "price_used",

                    "validatedPriceUsed",

                    "priceUsed",

                    "_validated_price_used",

                    "_price_used"

                ]

            );


        const priceType =

            this.normalisePriceType(

                rawPriceType

            );


        const outcome =

            priceType

            ||

            "No Price";


        return new RuleResult({

            rule:

                "price_used",


            label:

                "Validated Price Type",


            outcome:

                outcome,


            value:

                outcome,


            validated:

                outcome,


            ruleApplied:

                `Rule price_used = ${outcome}`,


            calculation:

                "Compares validated_price_used / price_used to scoring rule option_label",


            resolverType:

                "score",


            fallbackScore:

                0

        });


    }


}