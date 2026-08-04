export class CalculationResult {


    constructor(

        initialValues = {}

    ){


        this.values = {


            /*
                Input snapshots
            */


            sellingPrice:

                null,


            supplierCost:

                null,


            packCost:

                null,





            /*
                VAT
            */


            vatOnCost:

                null,


            vatOnSale:

                null,





            /*
                Fees
            */


            referralFee:

                null,


            fbaFee:

                null,


            fbmCost:

                null,


            prepFee:

                null,


            digitalServiceFee:

                null,


            totalFees:

                null,





            /*
                Core financial outputs
            */


            breakEvenPrice:

                null,


            profit:

                null,


            roi:

                null,


            margin:

                null,


            maxCost:

                null,


            targetSellingPrice:

                null,





            /*
                Execution information
            */


            completed:

                false,


            errors:

                [],


            warnings:

                [],


            calculatorTrace:

                [],


            ...initialValues

        };


    }






    get(key){


        return this.values[key];


    }






    set(

        key,

        value

    ){


        this.values[key] =

            value;


        return this;


    }






    update(values = {}){


        if(

            values

            &&

            typeof values === "object"

        ){


            Object.assign(

                this.values,

                values

            );


        }


        return this;


    }






    addError(

        message,

        details = null

    ){


        this.values.errors.push({

            message:

                String(

                    message

                    ??

                    "Calculation error"

                ),


            details:

                details

        });


        return this;


    }






    addWarning(

        message,

        details = null

    ){


        this.values.warnings.push({

            message:

                String(

                    message

                    ??

                    "Calculation warning"

                ),


            details:

                details

        });


        return this;


    }






    addTrace(

        calculator,

        values = {}

    ){


        this.values.calculatorTrace.push({

            calculator:

                String(

                    calculator

                    ??

                    "UnknownCalculator"

                ),


            values:

                {

                    ...values

                }

        });


        return this;


    }






    complete(){


        this.values.completed =

            this.values.errors.length === 0;


        return this;


    }






    toJSON(){


        return {

            ...this.values,


            errors:

                [

                    ...this.values.errors

                ],


            warnings:

                [

                    ...this.values.warnings

                ],


            calculatorTrace:

                this.values.calculatorTrace.map(

                    entry => ({

                        ...entry,


                        values:

                            {

                                ...entry.values

                            }

                    })

                )

        };


    }


}