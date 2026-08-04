import { RuleResult }
    from "../RuleResult.js";


export class PriceDeviationRule {


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

        fallback = null

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






    getDirectDeviation(row){


        return this.number(

            this.firstValue(

                row,

                [

                    "buybox_deviation_30day",

                    "buybox_deviation_30_day",

                    "buybox_deviation_30days",

                    "buybox_deviation_30_days",

                    "buy_box_deviation_30_day",

                    "buy_box_deviation_30_days",

                    "buy_box_standard_deviation_30_days",

                    "buy_box_standard_deviation_30_day",

                    "buy_box_std_dev_30_days",

                    "buy_box_std_dev_30_day",

                    "standard_deviation_30_days",

                    "standard_deviation_30_day",

                    "std_dev_30_days",

                    "std_dev_30_day",

                    "price_deviation_30_day",

                    "price_deviation_30_days",

                    "thirty_day_price_deviation"

                ]

            ),

            null

        );


    }






    getCurrentPrice(

        row,

        calc

    ){


        return this.number(

            this.firstValue(

                calc,

                [

                    "sellPrice",

                    "sellingPrice",

                    "targetSellingPrice"

                ]

            )

            ??

            this.firstValue(

                row,

                [

                    "new_current",

                    "new_current_price",

                    "validated_sales_price",

                    "buy_box_current",

                    "current_sale_price"

                ]

            ),

            0

        );


    }






    getAverage30DayPrice(row){


        return this.number(

            this.firstValue(

                row,

                [

                    "avg_price_30_day",

                    "avg_price_30",

                    "average_price_30_days",

                    "buy_box_30_day_avg",

                    "buy_box_30_days_avg"

                ]

            ),

            0

        );


    }






    calculateFallbackDeviation(

        row,

        calc

    ){


        const currentPrice =

            this.getCurrentPrice(

                row,

                calc

            );


        const average30DayPrice =

            this.getAverage30DayPrice(

                row

            );


        if(

            currentPrice <= 0

            ||

            average30DayPrice <= 0

        ){


            return {

                value:

                    null,


                currentPrice:

                    currentPrice,


                average30DayPrice:

                    average30DayPrice,


                source:

                    ""

            };


        }


        return {

            value:

                Math.abs(

                    currentPrice

                    -

                    average30DayPrice

                )

                /

                average30DayPrice,


            currentPrice:

                currentPrice,


            average30DayPrice:

                average30DayPrice,


            source:

                "CALCULATED_FROM_CURRENT_AND_30_DAY_AVERAGE"

        };


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


        const directDeviation =

            this.getDirectDeviation(

                row

            );


        if(

            directDeviation !== null

            &&

            Number.isFinite(

                directDeviation

            )

        ){


            return new RuleResult({

                rule:

                    "price_deviation_30_day",


                label:

                    "30 Day Price Deviation",


                outcome:

                    "High",


                value:

                    directDeviation,


                validated:

                    directDeviation.toFixed(

                        2

                    ),


                ruleApplied:

                    "Configured 30 Day Price Deviation band",


                calculation:

                    "Uses buybox_deviation_30day",


                resolverType:

                    "band",


                fallbackScore:

                    0

            });


        }


        const fallback =

            this.calculateFallbackDeviation(

                row,

                calc

            );


        if(

            fallback.value === null

            ||

            !Number.isFinite(

                fallback.value

            )

        ){


            return new RuleResult({

                rule:

                    "price_deviation_30_day",


                label:

                    "30 Day Price Deviation",


                outcome:

                    "No Match",


                value:

                    null,


                validated:

                    "No value",


                ruleApplied:

                    "buybox_deviation_30day",


                calculation:

                    "Field missing or blank",


                /*
                    This missing-value path must score zero
                    rather than asking the band resolver to
                    interpret null as numeric zero.
                */


                resolverType:

                    "direct",


                fallbackScore:

                    0

            });


        }


        return new RuleResult({

            rule:

                "price_deviation_30_day",


            label:

                "30 Day Price Deviation",


            outcome:

                "High",


            value:

                fallback.value,


            validated:

                fallback.value.toFixed(

                    2

                ),


            ruleApplied:

                "Configured 30 Day Price Deviation band",


            calculation:

                `|£${fallback.currentPrice.toFixed(2)}`
                +
                ` - £${fallback.average30DayPrice.toFixed(2)}|`
                +
                ` / £${fallback.average30DayPrice.toFixed(2)}`
                +
                ` = ${fallback.value.toFixed(2)}`,


            resolverType:

                "band",


            fallbackScore:

                0

        });


    }


}