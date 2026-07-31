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



        console.log(

            "[PHX SUPABASE GET ROWS]",

            {
                view,
                userKey
            }

        );





        const rows =

            await this.supabaseClient.rpc(

                "get_opportunity_dataset",

                {

                    p_view: view,

                    p_user_key: userKey

                }

            );







        console.log(

            "[PHX RPC ROW COUNT]",

            rows?.length

        );





        console.log(

            "[PHX RPC RAW KEYS]",

            Object.keys(

                rows?.[0] || {}

            )

        );





        console.log(

            "[PHX RPC RAW SAMPLE]",

            rows?.[0]

        );







        return (rows || []).map(row => {


            const mapped = {


                asin:

                    row.asin || "",



                locale:

                    row.locale || "",



                brand:

                    row.brand || "",



                title:

                    row.title || "",



                category:

                    row.category || "",



                sub_category:

                    row.sub_category || "",



                validated_sales_price:

                    row.validated_sales_price || 0,



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





            console.log(

                "[PHX REPOSITORY MAPPED ROW]",

                {

                    asin:
                        mapped.asin,

                    category:
                        mapped.category,

                    sub_category:
                        mapped.sub_category

                }

            );





            return mapped;


        });


    }


}