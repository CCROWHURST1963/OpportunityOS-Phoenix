export class OpportunityRepository {


    constructor(

        supabaseClient

    ){


        this.supabaseClient = supabaseClient;


    }








    async getOpportunityRows({

        process,

        view,

        limit

    }){





        const params = {


            p_view:

                view,


            p_user_key:

                "DEFAULT",


            p_limit:

                Number(

                    limit

                    ||

                    100

                )


        };







        console.log(

            "[PHX RPC PARAMS]",

            params

        );








        const response =

            await fetch(

                `${this.supabaseClient.url}/rest/v1/rpc/get_opportunity_dataset`,


                {


                    method:"POST",


                    headers:


                    {


                        apikey:

                            this.supabaseClient.key,



                        Authorization:

                            `Bearer ${this.supabaseClient.key}`,



                        "Content-Type":

                            "application/json"



                    },



                    body:

                        JSON.stringify(params)



                }


            );








        if(!response.ok){


            throw new Error(

                "Opportunity RPC failed"

            );


        }








        const data =

            await response.json();







        console.log(

            "[PHX RPC RAW RESPONSE]",

            data

        );








        console.log(

            "[PHX RPC DATA COUNT]",

            data?.length

        );








        return data || [];



    }



}