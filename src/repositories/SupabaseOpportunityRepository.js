export class SupabaseOpportunityRepository {


    constructor(

        supabaseClient,

        appState

    ) {


        this.supabaseClient =

            supabaseClient;


        this.appState =

            appState;


    }









    async getRows(

        view,

        limit = 100

    ) {



        const userKey =

            this.appState?.getUserKey?.()

            ||

            "DEFAULT";







        console.log(

            "[PHX REPOSITORY USER KEY]",

            userKey

        );








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








        const response =

            await this.supabaseClient.rpc(

                "get_opportunity_dataset",

                params

            );








        console.log(

            "[PHX RPC RAW RESPONSE]",

            response

        );









        /*
            Support both:

            1. direct array

            [
              {...}
            ]

            2. Supabase style:

            {
              data:[...],
              error:null
            }

        */





        const rows =



            Array.isArray(response)



            ?



            response



            :



            response?.data || [];








        console.log(

            "[PHX RPC ROW COUNT]",

            rows.length

        );







        console.log(

            "[PHX FIRST RPC ROW]",

            rows[0]

        );








        return rows;



    }



}