export class ProfitCalculator {


    hasValue(value){

        return (

            value !== null &&

            value !== undefined &&

            String(value).trim() !== ""

        );

    }






    number(

        value,

        fallback = 0

    ){

        if(!this.hasValue(value)){

            return fallback;

        }

        const parsed = Number(

            String(value)

                .replaceAll(",","")

                .replace(/[£$€%\s]/g,"")

        );

        return Number.isFinite(parsed)

            ? parsed

            : fallback;

    }






    roundMoney(value){

        return Math.round(

            (this.number(value)+Number.EPSILON)

            *100

        )/100;

    }






    roundPercent(value){

        return Math.round(

            (this.number(value)+Number.EPSILON)

            *100

        )/100;

    }






    calculate(input={}){


        const salePrice =

            this.number(

                input.salePrice,

                0

            );


        const packCost =

            this.number(

                input.packCostInclTax,

                0

            );


        const fees =

            input.fees || {};


        const tax =

            input.tax || {};






        /*
            Canonical OpportunityOS formula

            Profit =
            Sale Price
            - Pack Cost
            - Total Fees (incl VAT on fees)
            - VAT Due
        */


        const totalFees =

            this.number(

                tax.totalFeesForProfit

                ??

                tax.totalFeesIncludingVatOnFees

                ??

                fees.totalFeesExTax,

                0

            );


        const vatDue =

            this.number(

                tax.taxDue

                ??

                tax.vatDue,

                0

            );


        const profit =

            salePrice

            -

            packCost

            -

            totalFees

            -

            vatDue;






        const roi =

            packCost > 0

                ? (

                    profit

                    /

                    packCost

                ) * 100

                : 0;






        const margin =

            salePrice > 0

                ? (

                    profit

                    /

                    salePrice

                ) * 100

                : 0;






        return {

            profit:

                this.roundMoney(

                    profit

                ),


            roi:

                this.roundPercent(

                    roi

                ),


            roiPercent:

                this.roundPercent(

                    roi

                ),


            margin:

                this.roundPercent(

                    margin

                ),


            marginPercent:

                this.roundPercent(

                    margin

                ),


            salePrice:

                this.roundMoney(

                    salePrice

                ),


            packCost:

                this.roundMoney(

                    packCost

                ),


            totalFees:

                this.roundMoney(

                    totalFees

                ),


            vatDue:

                this.roundMoney(

                    vatDue

                )

        };


    }


}