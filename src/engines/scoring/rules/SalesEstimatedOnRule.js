import { RuleResult }
    from "../RuleResult.js";


export class SalesEstimatedOnRule {


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


        const source =

            this.normaliseText(

                row.sales_estimated_on

                ??

                row.sales_source

                ??

                row.estimated_sales_source

                ??

                ""

            );


        return new RuleResult({

            rule:

                "sales_source",


            label:

                "Sales Estimated On",


            outcome:

                source,


            value:

                source,


            validated:

                source,


            ruleApplied:

                "Configured Sales Source",


            calculation:

                `Sales Source = ${source}`,


            resolverType:

                "score",


            fallbackScore:

                0

        });


    }


}