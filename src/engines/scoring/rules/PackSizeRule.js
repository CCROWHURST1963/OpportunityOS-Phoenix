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






    normalisePackSource(value){


        const source =

            this.normaliseText(

                value

            )

                .toLowerCase()

                .replaceAll(

                    "-",

                    "_"

                )

                .replaceAll(

                    " ",

                    "_"

                );


        if(

            source ===

                "manual"

        ){


            return "Manual";


        }


        if(

            source ===

                "derived"

        ){


            return "Derived";


        }


        if(

            source ===

                "number_of_items"

            ||

            source ===

                "numberofitems"

        ){


            return "Number of Items";


        }


        return "Default";


    }






    getPackSource(row){


        return this.normalisePackSource(

            row.pack_source

            ??

            row.pack_size_source

            ??

            row.amazonpackinfo_pack_source

            ??

            row._packSource

            ??

            "default"

        );


    }






    getFallbackScore(packLabel){


        if(

            packLabel ===

                "Manual"

        ){


            return 3;


        }


        if(

            packLabel ===

                "Derived"

        ){


            return 2;


        }


        if(

            packLabel ===

                "Number of Items"

        ){


            return 1;


        }


        return 2;


    }






    calculate(

        context

    ){


        const row =

            context?.row

            ??

            {};


        const packLabel =

            this.getPackSource(

                row

            );


        const fallbackScore =

            this.getFallbackScore(

                packLabel

            );


        return new RuleResult({

            rule:

                "pack_size",


            label:

                "Pack Size Confidence",


            outcome:

                packLabel,


            value:

                packLabel,


            validated:

                packLabel,


            ruleApplied:

                "Manual = 3 | Derived/Default = 2 | Number of Items = 1",


            calculation:

                "Uses HTML pack source value",


            resolverType:

                "score",


            fallbackScore:

                fallbackScore

        });


    }


}