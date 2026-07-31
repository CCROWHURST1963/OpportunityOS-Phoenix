export class UserRepository {


    constructor(

        supabaseClient

    ) {


        this.supabaseClient =
            supabaseClient;


    }





    async getUserByKey(

        userKey

    ) {


        if (

            !this.supabaseClient.isConfigured()

        ) {


            return null;


        }



        const url =

            `${this.supabaseClient.url}/rest/v1/app_users`
            +
            `?user_key=eq.${encodeURIComponent(userKey)}`
            +
            `&select=*`;



        const response =

            await fetch(

                url,

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



        if (

            !response.ok

        ) {


            throw new Error(

                `User lookup failed ${response.status}`

            );


        }



        const rows =

            await response.json();



        return (

            rows &&
            rows.length > 0

        )

            ? rows[0]

            : null;


    }


}