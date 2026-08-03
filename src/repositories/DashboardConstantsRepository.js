export class DashboardConstantsRepository {


    constructor(

        supabaseClient

    ){


        this.supabaseClient =

            supabaseClient;


        this.tableName =

            "dashboard_constants";


    }






    ensureConfigured(){


        if(

            !this.supabaseClient

            ||

            typeof this.supabaseClient.isConfigured !==

                "function"

            ||

            !this.supabaseClient.isConfigured()

        ){


            throw new Error(

                "Supabase client is not configured"

            );


        }


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseUserKey(value){


        return this.normaliseText(

            value

        )

        ||

        "DEFAULT";


    }






    buildHeaders(){


        return {

            apikey:

                this.supabaseClient.key,


            Authorization:

                `Bearer ${this.supabaseClient.key}`,


            Accept:

                "application/json"

        };


    }






    buildUrl(userKeys){


        const baseUrl =

            String(

                this.supabaseClient.url

                ??

                ""

            ).replace(

                /\/$/,

                ""

            );


        const encodedKeys =

            userKeys

                .map(value =>

                    `"${String(value).replaceAll("\"", "\\\"")}"`

                )

                .join(",");


        const params =

            new URLSearchParams();


        params.set(

            "select",

            "*"

        );


        params.set(

            "user_key",

            `in.(${encodedKeys})`

        );


        return (

            `${baseUrl}/rest/v1/${this.tableName}`

            +

            `?${params.toString()}`

        );


    }






    async getRows(userKey){


        this.ensureConfigured();


        const resolvedUserKey =

            this.normaliseUserKey(

                userKey

            );


        const userKeys =

            resolvedUserKey ===

                "DEFAULT"

                ? [

                    "DEFAULT"

                ]

                : [

                    "DEFAULT",

                    resolvedUserKey

                ];


        const response =

            await fetch(

                this.buildUrl(

                    userKeys

                ),

                {

                    method:

                        "GET",


                    headers:

                        this.buildHeaders()

                }

            );


        if(!response.ok){


            const responseText =

                await response.text();


            throw new Error(

                `dashboard_constants load failed `
                +
                `${response.status}: `
                +
                responseText.slice(

                    0,

                    500

                )

            );


        }


        const rows =

            await response.json();


        return Array.isArray(rows)

            ? rows

            : [];


    }


}