export class FinancialResult {


    constructor(){


        this.values = {};


        this.fees = {};


        this.tax = {};


        this.audit = {};


        this.timings = {};


        this.warnings = [];


    }






    setValue(

        key,

        value

    ){


        this.values[key] = value;


        return this;


    }






    setFee(

        key,

        value

    ){


        this.fees[key] = value;


        return this;


    }






    setTax(

        key,

        value

    ){


        this.tax[key] = value;


        return this;


    }






    addAudit(

        key,

        value

    ){


        this.audit[key] = value;


        return this;


    }






    addWarning(message){


        this.warnings.push(

            message

        );


        return this;


    }






    addTiming(

        stage,

        milliseconds

    ){


        this.timings[stage] =

            milliseconds;


        return this;


    }






    toJSON(){


        return {

            values:

                structuredClone(

                    this.values

                ),


            fees:

                structuredClone(

                    this.fees

                ),


            tax:

                structuredClone(

                    this.tax

                ),


            audit:

                structuredClone(

                    this.audit

                ),


            timings:

                structuredClone(

                    this.timings

                ),


            warnings:

                [

                    ...this.warnings

                ]

        };


    }


}