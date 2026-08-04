import { RuleResult }
    from "../RuleResult.js";


export class CurrentMinimumEconomicsRule {


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






    money(value){


        const resolved =

            this.number(

                value,

                0

            );


        return resolved < 0

            ? `-£${Math.abs(resolved).toFixed(2)}`

            : `£${resolved.toFixed(2)}`;


    }






    percent(value){


        return `${this.number(value, 0).toFixed(1)}%`;


    }






    getSettings(context){


        const settings =

            context?.row?.calculationSettings

            ??

            context?.calc?.calculationSettings

            ??

            context?.calculationSettings

            ??

            {};


        return settings

        &&

        typeof settings ===

            "object"

            ? settings

            : {};


    }






    getProfit(

        row,

        calc

    ){


        return this.number(

            calc?.profit

            ??

            calc?.resolvedFinancialProfit

            ??

            row?.profit

            ??

            0,

            0

        );


    }






    getMargin(

        row,

        calc

    ){


        return this.number(

            calc?.margin

            ??

            calc?.marginPercent

            ??

            calc?.resolvedFinancialMargin

            ??

            row?.profit_margin

            ??

            row?.margin

            ??

            0,

            0

        );


    }






    getRoi(

        row,

        calc

    ){


        return this.number(

            calc?.roi

            ??

            calc?.roiPercent

            ??

            calc?.resolvedFinancialRoi

            ??

            row?.roi

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


        const settings =

            this.getSettings(

                context

            );


        const profit =

            this.getProfit(

                row,

                calc

            );


        const margin =

            this.getMargin(

                row,

                calc

            );


        const roi =

            this.getRoi(

                row,

                calc

            );


        const minimumProfit =

            this.number(

                settings.targetProfitAmount

                ??

                settings.target_profit

                ??

                settings.minProfit

                ??

                settings.min_profit

                ??

                0,

                0

            );


        const minimumMargin =

            this.number(

                settings.targetMarginPercent

                ??

                settings.target_profit_margin

                ??

                settings.target_profit_margin_percent

                ??

                settings.minMargin

                ??

                settings.min_margin

                ??

                0,

                0

            );


        const minimumRoi =

            this.number(

                settings.targetRoiPercent

                ??

                settings.target_roi

                ??

                settings.target_roi_percent

                ??

                settings.minRoi

                ??

                settings.min_roi

                ??

                0,

                0

            );


        const meetsCurrentEconomics =

            profit >= minimumProfit

            ||

            margin >= minimumMargin

            ||

            roi >= minimumRoi;


        const outcome =

            meetsCurrentEconomics

                ? "Yes"

                : "No";


        return new RuleResult({

            rule:

                "min_profit_target_buybox",


            label:

                "Current Minimum Economics",


            outcome:

                outcome,


            value:{

                profit:

                    profit,


                margin:

                    margin,


                roi:

                    roi

            },


            validated:

                `${this.money(profit)} profit`
                +
                ` / ${this.percent(margin)} margin`
                +
                ` / ${this.percent(roi)} ROI`,


            ruleApplied:

                `Min ${this.money(minimumProfit)} profit`
                +
                ` OR ${this.percent(minimumMargin)} margin`
                +
                ` OR ${this.percent(minimumRoi)} ROI`,


            calculation:

                meetsCurrentEconomics

                    ? "At least one minimum economics target achieved"

                    : "No minimum economics target achieved",


            resolverType:

                "score",


            fallbackScore:

                meetsCurrentEconomics

                    ? 2

                    : 1

        });


    }


}