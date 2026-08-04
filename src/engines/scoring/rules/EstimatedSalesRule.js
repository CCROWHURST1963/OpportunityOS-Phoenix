import { RuleResult }
    from "../RuleResult.js";


export class EstimatedSalesRule {


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






    firstValue(

        source,

        fields = []

    ){


        for(

            const field of fields

        ){


            const value =

                source?.[field];


            if(

                this.hasValue(

                    value

                )

            ){


                return value;


            }


        }


        return null;


    }






    getBoughtPastMonth(row){


        return this.number(

            this.firstValue(

                row,

                [

                    "_boughtPastMonthRaw",

                    "bought_past_month",

                    "monthly_sold",

                    "monthly_sales",

                    "boughtPastMonth",

                    "_boughtPastMonth"

                ]

            ),

            0

        );


    }






    getLastKnownBoughtPastMonth(row){


        return this.number(

            this.firstValue(

                row,

                [

                    "_lastKnownBoughtPastMonthRaw",

                    "last_known_bought_past_month",

                    "monthly_sold_last_known",

                    "bought_past_month_last_known",

                    "lastKnownBoughtPastMonth",

                    "_lastKnownBoughtPastMonth"

                ]

            ),

            0

        );


    }






    getSalesRankDropsLast30Days(row){


        return this.number(

            this.firstValue(

                row,

                [

                    "_salesRankDrops30Raw",

                    "sales_rank_drops_last_30_days",

                    "sales_rank_drops_30_days",

                    "sales_drops_last_30_days",

                    "sales_rank_drops_30_day",

                    "salesRankDropsLast30Days",

                    "_salesRankDropsLast30Days"

                ]

            ),

            0

        );


    }






    resolveEstimatedSales(row){


        const boughtPastMonth =

            this.getBoughtPastMonth(

                row

            );


        if(

            boughtPastMonth !==

                0

        ){


            return {

                sales:

                    boughtPastMonth,


                source:

                    "Bought Past Month"

            };


        }


        const lastKnownBoughtPastMonth =

            this.getLastKnownBoughtPastMonth(

                row

            );


        if(

            lastKnownBoughtPastMonth !==

                0

        ){


            return {

                sales:

                    lastKnownBoughtPastMonth,


                source:

                    "Last Known Bought Past Month"

            };


        }


        const salesRankDropsLast30Days =

            this.getSalesRankDropsLast30Days(

                row

            );


        if(

            salesRankDropsLast30Days !==

                0

        ){


            return {

                sales:

                    salesRankDropsLast30Days,


                source:

                    "Sales Drops last 30 days"

            };


        }


        return {

            sales:

                0,


            source:

                "No Sales Evidence"

        };


    }






    calculate(

        context

    ){


        const row =

            context?.row

            ??

            {};


        const calc =

            context?.calc

            ??

            {};


        const resolved =

            this.resolveEstimatedSales(

                row

            );


        /*
            Publish the canonical production values
            for downstream scoring and presentation.
        */


        row.estimated_sales =

            resolved.sales;


        row.sales_estimated =

            resolved.sales;


        row.sales_estimated_on =

            resolved.source;


        row.sales_source =

            resolved.source;


        row.estimated_sales_source =

            resolved.source;


        calc.estimatedSales =

            resolved.sales;


        return new RuleResult({

            rule:

                "estimated_sales",


            label:

                "Estimated Sales",


            outcome:

                "0 - 29",


            value:

                resolved.sales,


            validated:

                `${resolved.sales}`,


            ruleApplied:

                "Configured Estimated Sales band",


            calculation:

                `Derived from: ${resolved.source}`,


            resolverType:

                "band",


            fallbackScore:

                1

        });


    }


}