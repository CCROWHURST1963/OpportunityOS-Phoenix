import { RuleResult }
    from "../RuleResult.js";


export class EstimatedSharedSalesRule {


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






    getEstimatedSales(

        row,

        calc

    ){


        /*
            Prefer the value already produced by the scoring
            pipeline when available.
        */


        const existingValue =

            this.firstValue(

                calc,

                [

                    "estimatedSales",

                    "estimated_sales"

                ]

            );


        if(

            this.hasValue(

                existingValue

            )

        ){


            return Math.max(

                0,

                this.number(

                    existingValue,

                    0

                )

            );


        }






        /*
            Production sales-evidence priority:

            bought_past_month
                ↓
            last_known_bought_past_month
                ↓
            sales_rank_drops_last_30_days
        */


        const boughtPastMonth =

            this.number(

                this.firstValue(

                    row,

                    [

                        "_boughtPastMonthRaw",

                        "bought_past_month",

                        "monthly_sold",

                        "monthly_sales"

                    ]

                ),

                0

            );


        if(boughtPastMonth !== 0){


            return Math.max(

                0,

                boughtPastMonth

            );


        }


        const lastKnownBoughtPastMonth =

            this.number(

                this.firstValue(

                    row,

                    [

                        "_lastKnownBoughtPastMonthRaw",

                        "last_known_bought_past_month",

                        "monthly_sold_last_known",

                        "bought_past_month_last_known"

                    ]

                ),

                0

            );


        if(lastKnownBoughtPastMonth !== 0){


            return Math.max(

                0,

                lastKnownBoughtPastMonth

            );


        }


        const salesRankDrops30 =

            this.number(

                this.firstValue(

                    row,

                    [

                        "_salesRankDrops30Raw",

                        "sales_rank_drops_last_30_days",

                        "sales_rank_drops_30_days",

                        "sales_drops_last_30_days"

                    ]

                ),

                0

            );


        return Math.max(

            0,

            salesRankDrops30

        );


    }






    getWinnerCount(row){


        const value =

            this.firstValue(

                row,

                [

                    "_buyBoxWinners30Raw",

                    "win_count_30_day",

                    "buy_box_winners_30_day",

                    "buybox_winners_30_day",

                    "buy_box_winners"

                ]

            );


        return Math.max(

            0,

            Math.round(

                this.number(

                    value,

                    0

                )

            )

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


        const estimatedSales =

            this.getEstimatedSales(

                row,

                calc

            );


        const buyBoxWinners =

            this.getWinnerCount(

                row

            );


        /*
            Add one additional seller representing us.
        */


        const offers =

            buyBoxWinners

            +

            1;


        const sharedSales =

            estimatedSales > 0

                ? Math.round(

                    estimatedSales

                    /

                    offers

                )

                : 0;






        /*
            Publish the derived value for later score rules,
            caps and UI consumers.
        */


        calc.sharedSales =

            sharedSales;


        calc.shared_sales =

            sharedSales;


        return new RuleResult({

            rule:

                "estimated_shared_sales",


            label:

                "Estimated Shared Sales",


            outcome:

                "0 - 9",


            value:

                sharedSales,


            validated:

                String(

                    sharedSales

                ),


            ruleApplied:

                "Configured Estimated Shared Sales band",


            calculation:

                `${estimatedSales}`
                +
                ` / (${buyBoxWinners} winners + 1 us)`
                +
                ` = ${sharedSales}`,


            resolverType:

                "band",


            fallbackScore:

                1

        });


    }


}