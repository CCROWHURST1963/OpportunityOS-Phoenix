export class CanonicalOpportunity {


    constructor(

        source = {}

    ){


        this.source =

            source

            &&

            typeof source ===

                "object"

                ? source

                : {};


    }






    /*
    ----------------------------------------
    Identity
    ----------------------------------------
    */


    get asin(){


        return this.source.asin

            ??

            "";


    }


    get locale(){


        return this.source.locale

            ??

            "co.uk";


    }






    /*
    ----------------------------------------
    Validated Price
    ----------------------------------------
    */


    get validatedSalesPrice(){


        return this.source.validated_sales_price;


    }


    set validatedSalesPrice(

        value

    ){


        this.source.validated_sales_price =

            value;


    }






    get validatedPriceUsed(){


        return this.source.validated_price_used;


    }


    set validatedPriceUsed(

        value

    ){


        this.source.validated_price_used =

            value;


    }






    /*
    ----------------------------------------
    Pack
    ----------------------------------------
    */


    get packSize(){


        return this.source.pack_size;


    }


    set packSize(

        value

    ){


        this.source.pack_size =

            value;


    }






    get buyQuantity(){


        return this.source.buy_qty;


    }


    set buyQuantity(

        value

    ){


        this.source.buy_qty =

            value;


    }






    /*
    ----------------------------------------
    Eligibility
    ----------------------------------------
    */


    get eligibleToSell(){


        return this.source.eligible_to_sell;


    }


    set eligibleToSell(

        value

    ){


        this.source.eligible_to_sell =

            value;


    }






    /*
    ----------------------------------------
    Sales
    ----------------------------------------
    */


    get estimatedSales(){


        return this.source.estimated_sales;


    }


    set estimatedSales(

        value

    ){


        this.source.estimated_sales =

            value;


    }






    /*
    ----------------------------------------
    Financial
    ----------------------------------------
    */


    get breakEvenPrice(){


        return this.source.break_even_price;


    }


    set breakEvenPrice(

        value

    ){


        this.source.break_even_price =

            value;


    }






    get maximumCost(){


        return this.source.max_cost;


    }


    set maximumCost(

        value

    ){


        this.source.max_cost =

            value;


    }






    /*
    ----------------------------------------
    Raw Access
    ----------------------------------------
    */


    toJSON(){


        return this.source;


    }


}