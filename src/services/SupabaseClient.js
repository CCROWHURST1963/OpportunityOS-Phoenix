export class SupabaseClient {


    constructor(config = {}) {


        this.url =
            config.url || null;


        this.key =
            config.key || null;


    }



    isConfigured() {


        return Boolean(

            this.url
            &&
            this.key

        );


    }



    async rpc(
        functionName,
        params = {}
    ) {


        if (!this.isConfigured()) {


            throw new Error(
                "Supabase client not configured"
            );


        }



        const response =

            await fetch(

                `${this.url}/rest/v1/rpc/${functionName}`,

                {

                    method: "POST",


                    headers: {


                        "apikey":
                            this.key,


                        "Authorization":
                            `Bearer ${this.key}`,


                        "Content-Type":
                            "application/json"


                    },


                    body:

                        JSON.stringify(
                            params
                        )

                }

            );



        if (!response.ok) {


            throw new Error(

                `Supabase RPC failed: ${response.status}`

            );


        }



        return await response.json();


    }


}