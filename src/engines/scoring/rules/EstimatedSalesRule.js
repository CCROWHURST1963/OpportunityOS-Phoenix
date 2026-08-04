import { RuleResult }
    from "../RuleResult.js";


export class EstimatedSalesRule {


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


        const sales =

            this.number(

                row.estimated_sales

                ??

                row.sales_estimated

                ??

                row.monthly_sales

                ??

                0

            );


        return new RuleResult({

            rule:

                "estimated_sales",


            label:

                "Estimated Sales",


            outcome:

                "",


            value:

                sales,


            validated:

                `${sales}`,


            ruleApplied:

                "Configured Estimated Sales band",


            calculation:

                `Estimated Sales = ${sales}`,


            resolverType:

                "band",


            fallbackScore:

                0

        });


    }


}