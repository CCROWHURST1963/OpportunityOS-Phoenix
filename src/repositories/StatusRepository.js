export class StatusRepository {


    constructor(supabaseClient, config) {


        this.supabaseClient =
            supabaseClient;


        this.config =
            config;


    }



    async getStatus(
        asin,
        locale = "UK"
    ) {


        const userKey =

            this.config.getUserKey();



        const response =

            await fetch(

                `${this.supabaseClient.url}/rest/v1/status_tracker?asin=eq.${asin}&locale=eq.${locale}&user_id=eq.${userKey}`,

                {

                    method: "GET",

                    headers: {


                        "apikey":
                            this.supabaseClient.key,


                        "Authorization":
                            `Bearer ${this.supabaseClient.key}`


                    }


                }

            );



        if (!response.ok) {


            throw new Error(

                `Status tracker lookup failed: ${response.status}`

            );


        }



        const rows =
            await response.json();



        return rows[0] || null;


    }


}