export class DashboardProcessRepository {


    constructor(

        supabaseClient

    ){


        this.supabaseClient =

            supabaseClient;


    }







    async getProcesses(){



        if(

            !this.supabaseClient ||

            !this.supabaseClient.isConfigured()

        ){


            console.warn(

                "[PHX PROCESS] Supabase not configured"

            );


            return [];


        }







        const url =


            `${this.supabaseClient.url}/rest/v1/dashboard_processes`
            +
            `?select=*`;







        const response =

            await fetch(

                url,

                {


                    method:"GET",


                    headers:{


                        "apikey":

                            this.supabaseClient.key,


                        "Authorization":

                            `Bearer ${this.supabaseClient.key}`


                    }


                }

            );








        if(!response.ok){


            throw new Error(

                `Dashboard processes failed ${response.status}`

            );


        }








        const rows =

            await response.json();





        console.log(

            "[PHX PROCESSES]",

            rows

        );






        return rows;



    }



}