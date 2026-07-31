export class PriceValidationCalculator {


    calculate(row) {


        const currentPrice =
            Number(row.validated_sales_price || 0);


        const avg30 =
            Number(row.avg_price_30 || 0);


        const avg90 =
            Number(row.avg_price_90 || 0);


        const avg180 =
            Number(row.avg_price_180 || 0);


        const competitiveThreshold =
            Number(row.competitive_price_threshold || 0);



        const averages = [

            avg30,
            avg90,
            avg180

        ].filter(

            value => value > 0

        );



        const averagePrice =

            averages.length

                ? averages.reduce(
                    (a, b) => a + b,
                    0
                ) / averages.length

                : 0;



        const priceVariance =

            averagePrice

                ? (

                    currentPrice -
                    averagePrice

                ) / averagePrice

                : 0;



        return {


            ...row,


            priceContext: {


                currentPrice,

                avg30,

                avg90,

                avg180,

                averagePrice,

                priceVariance,

                competitiveThreshold


            },


            priceValidation: {


                hasHistory:
                    averages.length > 0,


                aboveAverage:
                    currentPrice >= averagePrice,


                withinCompetitiveRange:

                    !competitiveThreshold

                    ||

                    currentPrice >= competitiveThreshold


            }


        };


    }


}