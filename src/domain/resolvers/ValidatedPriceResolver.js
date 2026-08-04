import { DomainResolver }
    from "../DomainResolver.js";


export class ValidatedPriceResolver
    extends DomainResolver {


    number(

        value

    ){

        if(

            value === null

            ||

            value === undefined

            ||

            String(value).trim() === ""

        ){

            return null;

        }


        const parsed =

            Number(value);


        return Number.isFinite(parsed)

            ? parsed
            : null;

    }






    resolve(

        context

    ){

        const opportunity =

            context.opportunity;




        /*
        ---------------------------------------
        Buy Box
        ---------------------------------------
        */

        let price =

            this.number(

                opportunity.source.validated_sales_price

            );

        if(price !== null){

            opportunity.validatedSalesPrice =

                price;

            opportunity.validatedPriceUsed =

                "Buy Box";

            return context;

        }




        /*
        ---------------------------------------
        30 Day Average
        ---------------------------------------
        */

        price =

            this.number(

                opportunity.source.avg_price_30_day

            );

        if(price !== null){

            opportunity.validatedSalesPrice =

                price;

            opportunity.validatedPriceUsed =

                "30 Day";

            return context;

        }




        /*
        ---------------------------------------
        90 Day Average
        ---------------------------------------
        */

        price =

            this.number(

                opportunity.source.avg_price_90_day

            );

        if(price !== null){

            opportunity.validatedSalesPrice =

                price;

            opportunity.validatedPriceUsed =

                "90 Day";

            return context;

        }




        /*
        ---------------------------------------
        180 Day Average
        ---------------------------------------
        */

        price =

            this.number(

                opportunity.source.avg_price_180_day

            );

        if(price !== null){

            opportunity.validatedSalesPrice =

                price;

            opportunity.validatedPriceUsed =

                "180 Day";

            return context;

        }




        /*
        ---------------------------------------
        New Current
        ---------------------------------------
        */

        price =

            this.number(

                opportunity.source.new_current_price

            );

        if(price !== null){

            opportunity.validatedSalesPrice =

                price;

            opportunity.validatedPriceUsed =

                "New";

            return context;

        }




        /*
        ---------------------------------------
        Nothing Available
        ---------------------------------------
        */

        opportunity.validatedSalesPrice =

            null;

        opportunity.validatedPriceUsed =

            "No Price";


        return context;

    }


}