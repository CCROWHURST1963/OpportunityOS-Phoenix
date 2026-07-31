export class SupabaseOpportunityRepository {


    constructor(supabaseClient) {


        this.supabaseClient =
            supabaseClient;


    }



    async getRows(view = "default") {


        const result =
            await this.supabaseClient.rpc(
                "get_opportunity_dataset",
                {
                    p_view: view
                }
            );


        return result || [];


    }


}