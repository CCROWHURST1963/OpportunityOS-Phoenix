import { RuleResult }
    from "../RuleResult.js";


export class PackSizeRule {


    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    number(

        value,

        fallback = 0

    ){


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


        const packSize =

            this.number(

                row.pack_size

                ??

                row.packSize

                ??

                0,

                0

            );


        /*
            Production behaviour:

            Pack Size 1

                ↓

            "Single"

            Pack Size >1

                ↓

            "Multi"

            Missing

                ↓

            "Unknown"
        */


        let outcome =

            "Unknown";


        if(packSize === 1){


            outcome =

                "Single";


        }

        else if(packSize > 1){


            outcome =

                "Multi";


        }


        return new RuleResult({

            rule:

                "pack_size",


            label:

                "Pack Size",


            outcome:


                outcome,


            value:

                packSize,


            validated:

                `${packSize}`,


            ruleApplied:

                "Configured Pack Size Rule",


            calculation:

                `Pack Size = ${packSize}`,


            resolverType:

                "score",


            fallbackScore:

                0

        });


    }


}