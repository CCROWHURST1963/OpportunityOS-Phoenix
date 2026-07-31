export class ColumnRegistry {


    constructor() {


        this.resolvers = {


            "_asin":

                row =>

                    row.asin
                    ??
                    row._asin
                    ??
                    "",



            "actions":

                row =>

                    "",



            "status":

                row =>

                    row.status
                    ??
                    "",



            "override_status":

                row =>

                    row.override_status
                    ??
                    "",



            "buy_signal":

                row =>

                    row.buy_signal
                    ??
                    "",



            "score":

                row =>

                    row.opportunity_score
                    ??
                    row.score
                    ??
                    "",



            "_supplier":

                row =>

                    row.supplier
                    ??
                    row._supplier
                    ??
                    "",



            "supplier":

                row =>

                    row.supplier
                    ??
                    "",



            "hazmat_status":

                row =>

                    row.hazmat_status
                    ??
                    "",



            "eligible_to_sell":

                row =>

                    row.eligible_to_sell
                    ??
                    "",



            "ungate_qty":

                row =>

                    row.ungate_qty
                    ??
                    "",



            "pack_size":

                row =>

                    row.pack_size
                    ??
                    "",



            "pack_source":

                row =>

                    row.pack_source
                    ??
                    "",



            "comment":

                row =>

                    row.comment
                    ??
                    "",



            "buy_qty":

                row =>

                    row.buy_qty
                    ??
                    "",



            "_brand":

                row =>

                    row.brand
                    ??
                    row._brand
                    ??
                    "",



            "_category":

                row =>

                    row.category
                    ??
                    row._category
                    ??
                    "",



            "_title":

                row =>

                    row.title
                    ??
                    row._title
                    ??
                    "",



            "max_cost":

                row =>

                    row.max_cost
                    ??
                    "",



            "target_selling_price":

                row =>

                    row.target_selling_price
                    ??
                    "",



            "break_even_price":

                row =>

                    row.break_even_price
                    ??
                    "",



            "product_type":

                row =>

                    row.product_type
                    ??
                    "",



            "competing_sellers":

                row =>

                    row.competing_sellers
                    ??
                    "",



            "competing_stock":

                row =>

                    row.competing_stock
                    ??
                    "",



            "competing_price":

                row =>

                    row.competing_price
                    ??
                    "",



            "decision":

                row =>

                    row.decision
                    ??
                    "",



            "total_seller_sales":

                row =>

                    row.total_seller_sales
                    ??
                    "",



            "30_day_seller_sales":

                row =>

                    row["30_day_seller_sales"]
                    ??
                    "",



            "revised_estimated_share_of_sales":

                row =>

                    row.revised_estimated_share_of_sales
                    ??
                    ""

        };


    }





    getValue(

        key,

        row

    ) {


        const resolver =

            this.resolvers[key];



        if (

            resolver

        ) {


            return resolver(row);


        }



        /*
            fallback for direct fields

        */


        if (

            row[key] !== undefined

        ) {


            return row[key];


        }



        return "";


    }





    has(

        key

    ) {


        return !!this.resolvers[key];


    }


}