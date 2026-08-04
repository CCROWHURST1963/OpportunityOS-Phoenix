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






    hasValue(value){


        return (

            value !== null

            &&

            value !== undefined

            &&

            this.normaliseText(

                value

            ) !== ""

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

                    "bought_past_month",

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

                    "last_known_bought_past_month",

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

                    "sales_rank_drops_last_30_days",

                    "sales_rank_drops_30_day",

                    "sales_rank_drops_30_days",

                    "salesRankDropsLast30Days",

                    "_salesRankDropsLast30Days"

                ]

            ),

            0

        );


    }






    resolveSalesSource(row){


        const boughtPastMonth =

            this.getBoughtPastMonth(

                row

            );


        if(

            boughtPastMonth >

                0

        ){


            return {

                source:

                    "Bought Past Month",


                evidenceValue:

                    boughtPastMonth,


                fallbackScore:

                    3

            };


        }


        const lastKnownBoughtPastMonth =

            this.getLastKnownBoughtPastMonth(

                row

            );


        if(

            lastKnownBoughtPastMonth >

                0

        ){


            return {

                source:

                    "Last Known Bought Past Month",


                evidenceValue:

                    lastKnownBoughtPastMonth,


                fallbackScore:

                    2

            };


        }


        const salesRankDropsLast30Days =

            this.getSalesRankDropsLast30Days(

                row

            );


        if(

            salesRankDropsLast30Days >

                0

        ){


            return {

                source:

                    "Sales Rank Drops Last 30 Days",


                evidenceValue:

                    salesRankDropsLast30Days,


                fallbackScore:

                    2

            };


        }


        return {

            source:

                "No Sales Evidence",


            evidenceValue:

                0,


            fallbackScore:

                0

        };


    }






    calculate(

        context

    ){


        const row =

            context?.row

            ??

            {};


        const resolved =

            this.resolveSalesSource(

                row

            );


        /*
            Publish the canonical source so the
            Estimated Sales rule and downstream
            presentation use the same value.
        */


        row.sales_estimated_on =

            resolved.source;


        row.sales_source =

            resolved.source;


        row.estimated_sales_source =

            resolved.source;


        return new RuleResult({

            rule:

                "sales_estimated_on",


            label:

                "Sales Estimated On",


            outcome:

                resolved.source ===

                    "No Sales Evidence"

                    ? "No"

                    : "Yes",


            value:

                resolved.source,


            validated:

                resolved.source,


            ruleApplied:

                "bought_past_month > last_known_bought_past_month > sales_rank_drops_last_30_days",


            calculation:

                resolved.source ===

                    "No Sales Evidence"

                    ? "No positive sales evidence found"

                    : `${resolved.source} = ${resolved.evidenceValue}`,


            resolverType:

                "score",


            fallbackScore:

                resolved.fallbackScore

        });


    }


}