export class SupabaseOpportunityRepository {


    constructor(
        supabaseClient,
        config
    ) {


        this.supabaseClient =
            supabaseClient;


        this.config =
            config;


    }



    async getRows(view = "default") {


        const userKey =
            this.config.getUserKey();



        const rows =

            await this.supabaseClient.rpc(

                "get_opportunity_dataset",

                {

                    p_view: view,

                    p_user_key: userKey

                }

            );



        return (rows || []).map(row => {


            return {


                asin:
                    row.asin,


                locale:
                    row.locale,


                brand:
                    row.brand,


                title:
                    row.title,


                validated_sales_price:
                    row.validated_sales_price,


                supplier:
                    row.supplier || null,


                supplier_price:
                    row.supplier_price || null,


                opportunity_score:
                    row.opportunity_score,


                buy_signal:
                    row.buy_signal,


                status:
                    row.status


            };


        });


    }


}