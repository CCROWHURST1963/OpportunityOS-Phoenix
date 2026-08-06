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



    ensureConfigured(){


        if(!this.isConfigured()){


            throw new Error(
                "Supabase client not configured"
            );


        }


    }



    getHeaders(){


        return {

            "apikey":
                this.key,


            "Authorization":
                `Bearer ${this.key}`,


            "Content-Type":
                "application/json"

        };


    }



    async parseResponse(response){


        if(!response.ok){


            const responseText =
                await response.text();


            throw new Error(
                `Supabase request failed: ${response.status}${responseText ? ` - ${responseText}` : ""}`
            );


        }


        if(response.status === 204){


            return null;


        }


        return await response.json();


    }



    async rpc(
        functionName,
        params = {}
    ) {


        this.ensureConfigured();


        const response =

            await fetch(

                `${this.url}/rest/v1/rpc/${functionName}`,

                {

                    method: "POST",


                    headers:
                        this.getHeaders(),


                    body:

                        JSON.stringify(
                            params
                        )

                }

            );


        return this.parseResponse(
            response
        );


    }



    async selectRows(
        tableName,
        {
            select = "*",
            filters = {},
            or = "",
            limit = null
        } = {}
    ){


        this.ensureConfigured();


        const resolvedTableName =
            String(
                tableName
                ??
                ""
            ).trim();


        if(!resolvedTableName){


            throw new Error(
                "Supabase table name is required"
            );


        }


        const query =
            new URLSearchParams();


        query.set(
            "select",
            String(select || "*")
        );


        for(
            const [field, expression]
            of Object.entries(filters || {})
        ){


            if(
                expression === null
                ||
                expression === undefined
                ||
                expression === ""
            ){


                continue;


            }


            query.set(
                field,
                String(expression)
            );


        }


        if(or){


            query.set(
                "or",
                String(or)
            );


        }


        const parsedLimit =
            Number(limit);


        if(
            Number.isFinite(parsedLimit)
            &&
            parsedLimit > 0
        ){


            query.set(
                "limit",
                String(
                    Math.floor(parsedLimit)
                )
            );


        }


        const response =
            await fetch(
                `${this.url}/rest/v1/${encodeURIComponent(resolvedTableName)}?${query.toString()}`,
                {
                    method: "GET",
                    headers:
                        this.getHeaders()
                }
            );


        const rows =
            await this.parseResponse(
                response
            );


        return Array.isArray(rows)
            ? rows
            : [];


    }


}