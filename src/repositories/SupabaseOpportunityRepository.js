export class SupabaseOpportunityRepository {


    constructor(

        supabaseClient,

        config

    ){


        this.supabaseClient =

            supabaseClient;


        this.config =

            config;


    }







    async getRows(

        view = "default",

        limit = null

    ){



        const userKey =

            this.config.getUserKey();





        const params = {


            p_view:

                view,


            p_user_key:

                userKey,


            p_limit:

                limit


        };





        console.log(

            "[PHX RPC PARAMS]",

            params

        );







        const result =

            await this.supabaseClient.rpc(

                "get_opportunity_dataset",

                params

            );







        console.log(

            "[PHX RPC RAW RESPONSE]",

            result

        );







        const rows =


            Array.isArray(result)

            ?

            result

            :

            result?.data || [];







        console.log(

            "[PHX RPC DATA COUNT]",

            rows.length

        );







        return rows;


    }


}