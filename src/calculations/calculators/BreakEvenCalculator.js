export class BreakEvenCalculator {


    constructor(){


        this.name =

            "BreakEvenCalculator";


        this.maximumExpansionIterations =

            14;


        this.maximumSearchIterations =

            34;


    }






    number(

        value,

        fallback = 0

    ){


        if(

            value === null

            ||

            value === undefined

            ||

            String(

                value

            ).trim() === ""

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

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : fallback;


    }






    roundMoney(value){


        const number =

            this.number(

                value,

                0

            );


        return Math.round(

            (

                number

                +

                Number.EPSILON

            )

            *

            100

        )

        /

        100;


    }






    positiveNumber(

        value,

        fallback = 0

    ){


        const number =

            this.number(

                value,

                fallback

            );


        return number > 0

            ? number

            : fallback;


    }






    getFulfilmentType(context){


        const value =

            String(

                context?.row?.fulfilment_type

                ??

                context?.row?.fulfillment_type

                ??

                context?.row?._phase777Fulfilment

                ??

                context?.row?.fulfilment

                ??

                "FBA"

            )

                .trim()

                .toUpperCase();


        return value === "FBM"

            ? "FBM"

            : "FBA";


    }






    getSupplierCostInclTax(context){


        const unitCostExclTax =

            this.positiveNumber(

                context?.unitCostExclTax,

                0

            );


        if(unitCostExclTax <= 0){


            return null;


        }


        const buyQty =

            this.positiveNumber(

                context?.buyQty,

                this.positiveNumber(

                    context?.packSize,

                    1

                )

            );


        const taxRateOnCost =

            this.number(

                context?.taxRateOnCost,

                0

            );


        const costExclTax =

            unitCostExclTax

            *

            buyQty;


        return this.roundMoney(

            costExclTax

            *

            (

                1

                +

                taxRateOnCost

            )

        );


    }






    getVatOnCost(

        supplierCostInclTax,

        taxRateOnCost

    ){


        const cost =

            this.number(

                supplierCostInclTax,

                0

            );


        const rate =

            this.number(

                taxRateOnCost,

                0

            );


        if(

            cost <= 0

            ||

            rate <= 0

        ){


            return 0;


        }


        return this.roundMoney(

            cost

            -

            (

                cost

                /

                (

                    1

                    +

                    rate

                )

            )

        );


    }






    getReferralFee(

        salePrice,

        context

    ){


        const sale =

            this.number(

                salePrice,

                0

            );


        const referralRate =

            this.number(

                context?.referralFeePercent,

                0

            );


        return this.roundMoney(

            sale

            *

            referralRate

        );


    }






    getFulfilmentFee(context){


        const fulfilmentType =

            this.getFulfilmentType(

                context

            );


        if(fulfilmentType === "FBM"){


            return this.roundMoney(

                context?.fbmCost

            );


        }


        return this.roundMoney(

            context?.fbaFee

        );


    }






    getDigitalServiceFee(

        referralFee,

        fulfilmentFee,

        context

    ){


        const digitalRate =

            this.number(

                context?.digitalServiceFeeRate,

                0

            );


        const fulfilmentType =

            this.getFulfilmentType(

                context

            );


        /*
            Legacy OpportunityOS formula:

            FBA:
            (Referral Fee + FBA Fee)
            × Digital Service Fee %

            FBM:
            Referral Fee
            × Digital Service Fee %
        */


        const feeBase =

            fulfilmentType === "FBM"

                ? referralFee

                : referralFee

                    +

                    fulfilmentFee;


        return this.roundMoney(

            feeBase

            *

            digitalRate

        );


    }






    calculateProfitAtPrice(

        salePrice,

        supplierCostInclTax,

        context

    ){


        const sale =

            this.roundMoney(

                salePrice

            );


        const referralFee =

            this.getReferralFee(

                sale,

                context

            );


        const fulfilmentFee =

            this.getFulfilmentFee(

                context

            );


        const prepFee =

            this.roundMoney(

                context?.nettPrepFee

            );


        const digitalServiceFee =

            this.getDigitalServiceFee(

                referralFee,

                fulfilmentFee,

                context

            );


        /*
            The production calculator rounds Total Fees
            once from the fee components.
        */


        const totalFees =

            this.roundMoney(

                referralFee

                +

                fulfilmentFee

                +

                prepFee

                +

                digitalServiceFee

            );


        const taxRateOnSale =

            this.number(

                context?.taxRateOnSale,

                0

            );


        const taxRateOnCost =

            this.number(

                context?.taxRateOnCost,

                0

            );


        const vatOnFees =

            this.roundMoney(

                totalFees

                *

                taxRateOnSale

            );


        const vatOnSale =

            taxRateOnSale > 0

                ? this.roundMoney(

                    sale

                    -

                    (

                        sale

                        /

                        (

                            1

                            +

                            taxRateOnSale

                        )

                    )

                )

                : 0;


        const vatOnCost =

            this.getVatOnCost(

                supplierCostInclTax,

                taxRateOnCost

            );


        const vatDue =

            this.roundMoney(

                vatOnSale

                -

                vatOnCost

                -

                vatOnFees

            );


        const profit =

            this.roundMoney(

                sale

                -

                supplierCostInclTax

                -

                totalFees

                -

                vatOnFees

                -

                vatDue

            );


        return {

            salePrice:

                sale,


            supplierCostInclTax:

                this.roundMoney(

                    supplierCostInclTax

                ),


            referralFee:

                referralFee,


            fulfilmentFee:

                fulfilmentFee,


            prepFee:

                prepFee,


            digitalServiceFee:

                digitalServiceFee,


            totalFees:

                totalFees,


            vatOnCost:

                vatOnCost,


            vatOnSale:

                vatOnSale,


            vatOnFees:

                vatOnFees,


            vatDue:

                vatDue,


            profit:

                profit

        };


    }






    findBreakEvenPrice(

        context,

        supplierCostInclTax

    ){


        let lowerPrice =

            0;


        let upperPrice =

            Math.max(

                supplierCostInclTax

                *

                3,

                30

            );


        /*
            Expand the upper boundary until it produces
            non-negative profit.
        */


        for(

            let iteration = 0;

            iteration <

                this.maximumExpansionIterations;

            iteration += 1

        ){


            const calculation =

                this.calculateProfitAtPrice(

                    upperPrice,

                    supplierCostInclTax,

                    context

                );


            if(

                calculation.profit >= 0

            ){


                break;


            }


            upperPrice =

                upperPrice

                *

                2;


        }


        /*
            Binary search for the first selling price at
            which profit becomes non-negative.
        */


        for(

            let iteration = 0;

            iteration <

                this.maximumSearchIterations;

            iteration += 1

        ){


            const middlePrice =

                (

                    lowerPrice

                    +

                    upperPrice

                )

                /

                2;


            const calculation =

                this.calculateProfitAtPrice(

                    middlePrice,

                    supplierCostInclTax,

                    context

                );


            if(

                calculation.profit >= 0

            ){


                upperPrice =

                    middlePrice;


            }

            else {


                lowerPrice =

                    middlePrice;


            }


        }


        return this.roundMoney(

            upperPrice

        );


    }






    calculate(

        context,

        result

    ){


        const supplierCostInclTax =

            this.getSupplierCostInclTax(

                context

            );


        if(supplierCostInclTax === null){


            result.update({

                supplierCost:

                    0,


                packCost:

                    0,


                breakEvenPrice:

                    null

            });


            result.addWarning(

                "Break-even price was not calculated because no supplier cost was available",

                {

                    asin:

                        context?.asin

                        ??

                        ""

                }

            );


            return result;


        }


        const breakEvenPrice =

            this.findBreakEvenPrice(

                context,

                supplierCostInclTax

            );


        const breakEvenCalculation =

            this.calculateProfitAtPrice(

                breakEvenPrice,

                supplierCostInclTax,

                context

            );


        result.update({

            supplierCost:

                supplierCostInclTax,


            packCost:

                supplierCostInclTax,


            breakEvenPrice:

                breakEvenPrice,


            breakEvenCalculation:

                breakEvenCalculation

        });


        return result;


    }


}