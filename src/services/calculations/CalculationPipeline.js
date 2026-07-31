export class CalculationPipeline {


    constructor(calculators = []) {


        this.calculators =
            calculators;


    }



    run(row) {


        let result =
            {
                ...row
            };



        this.calculators.forEach(

            calculator => {


                result =
                    calculator.calculate(
                        result
                    );


            }

        );



        return result;


    }


}