export class ViewConfigRepository {


    constructor(

        supabaseClient

    ) {


        this.supabaseClient =

            supabaseClient;


    }






    async getViews(

        userKey = "DEFAULT"

    ) {


        if (

            !this.supabaseClient

            ||

            !this.supabaseClient.isConfigured()

        ) {


            return [];


        }






        const url =

            `${this.supabaseClient.url}/rest/v1/dashboard_views`
            +
            `?user_key=eq.${encodeURIComponent(userKey)}`
            +
            `&select=*`;






        const response =

            await fetch(

                url,

                {


                    method:

                        "GET",



                    headers:


                    {


                        "apikey":

                            this.supabaseClient.key,



                        "Authorization":

                            `Bearer ${this.supabaseClient.key}`


                    }


                }

            );







        if (

            !response.ok

        ) {


            console.error(

                "[PHX VIEW CONFIG FAILED]",

                response.status

            );


            return [];


        }







        const data =

            await response.json();






        console.log(

            "[PHX VIEW CONFIG RAW]",

            data

        );






        return data;


    }









    async getProcesses(){


        if (

            !this.supabaseClient

            ||

            !this.supabaseClient.isConfigured()

        ) {


            return [];


        }







        const url =

            `${this.supabaseClient.url}/rest/v1/dashboard_processes`
            +
            `?select=process_name`
            +
            `&order=process_name`;







        const response =

            await fetch(

                url,

                {


                    method:

                        "GET",



                    headers:


                    {


                        "apikey":

                            this.supabaseClient.key,



                        "Authorization":

                            `Bearer ${this.supabaseClient.key}`


                    }


                }

            );







        if (

            !response.ok

        ) {


            console.error(

                "[PHX PROCESS LOAD FAILED]",

                response.status

            );


            return [];


        }







        const data =

            await response.json();







        console.log(

            "[PHX PROCESSES RAW]",

            data

        );







        return data;


    }


}