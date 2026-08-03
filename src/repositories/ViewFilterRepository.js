export class ViewFilterRepository {


    constructor(

        supabaseClient

    ){


        this.supabaseClient =

            supabaseClient;


    }






    ensureConfigured(){


        if(

            !this.supabaseClient

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






    normaliseOptionRows(

        rows,

        fieldName

    ){


        if(!Array.isArray(rows)){


            return [];


        }


        const values =

            rows

                .map(row =>

                    this.normaliseText(

                        row?.[fieldName]

                    )

                )

                .filter(Boolean);


        const uniqueValues =

            [

                ...new Set(

                    values

                )

            ];


        uniqueValues.sort(

            (valueA, valueB) =>

                valueA.localeCompare(

                    valueB,

                    undefined,

                    {

                        sensitivity:

                            "base"

                    }

                )

        );


        return uniqueValues;


    }






    async fetchDistinctColumn({

        table,

        column,

        additionalQuery = ""

    }){


        this.ensureConfigured();


        const query =

            [

                `select=${encodeURIComponent(column)}`,

                `${column}=not.is.null`,

                `order=${encodeURIComponent(column)}.asc`

            ];


        if(additionalQuery){


            query.push(

                additionalQuery

            );


        }


        const url =

            `${this.supabaseClient.url}/rest/v1/${table}?${query.join("&")}`;


        const response =

            await fetch(

                url,

                {

                    method:

                        "GET",


                    headers:{

                        "apikey":

                            this.supabaseClient.key,


                        "Authorization":

                            `Bearer ${this.supabaseClient.key}`

                    }

                }

            );


        if(!response.ok){


            const responseText =

                await response.text();


            throw new Error(

                `View filter lookup failed for ${table}.${column} `
                +
                `${response.status}: ${responseText}`

            );


        }


        const rows =

            await response.json();


        return this.normaliseOptionRows(

            rows,

            column

        );


    }






    async getBrands(){


        const brands =

            await this.fetchDistinctColumn({

                table:

                    "opportunity_database",


                column:

                    "brand"

            });


        console.log(

            "[PHX VIEW FILTER BRANDS]",

            brands

        );


        return brands;


    }






    async getCategories(){


        const categories =

            await this.fetchDistinctColumn({

                table:

                    "opportunity_database",


                column:

                    "categories_root"

            });


        console.log(

            "[PHX VIEW FILTER CATEGORIES]",

            categories

        );


        return categories;


    }






    async getSubCategories(){


        const subCategories =

            await this.fetchDistinctColumn({

                table:

                    "opportunity_database",


                column:

                    "sub_category"

            });


        console.log(

            "[PHX VIEW FILTER SUB CATEGORIES]",

            subCategories

        );


        return subCategories;


    }






    async getSubCategoriesByCategory(

        category

    ){


        const selectedCategory =

            this.normaliseText(

                category

            );


        if(!selectedCategory){


            return [];


        }


        const encodedCategory =

            encodeURIComponent(

                selectedCategory

            );


        const subCategories =

            await this.fetchDistinctColumn({

                table:

                    "opportunity_database",


                column:

                    "sub_category",


                additionalQuery:

                    `categories_root=eq.${encodedCategory}`

            });


        console.log(

            "[PHX VIEW FILTER SUB CATEGORIES BY CATEGORY]",

            {

                category:

                    selectedCategory,


                subCategories:

                    subCategories

            }

        );


        return subCategories;


    }






    async getAssignedTo(){


        const assignedTo =

            await this.fetchDistinctColumn({

                table:

                    "opportunity_database",


                column:

                    "assigned_to"

            });


        console.log(

            "[PHX VIEW FILTER ASSIGNED TO]",

            assignedTo

        );


        return assignedTo;


    }






    async getStatuses(){

        this.ensureConfigured();


        const url =

            `${this.supabaseClient.url}/rest/v1/status_tracker`
            +
            `?select=status`
            +
            `&status=not.is.null`
            +
            `&order=status.asc`;


        const response =

            await fetch(

                url,

                {

                    method:

                        "GET",


                    headers:{

                        "apikey":

                            this.supabaseClient.key,


                        "Authorization":

                            `Bearer ${this.supabaseClient.key}`

                    }

                }

            );


        if(!response.ok){


            const responseText =

                await response.text();


            throw new Error(

                `Status filter lookup failed ${response.status}: ${responseText}`

            );


        }


        const rows =

            await response.json();


        const statuses =

            this.normaliseOptionRows(

                rows,

                "status"

            );


        console.log(

            "[PHX VIEW FILTER STATUSES]",

            statuses

        );


        return statuses;


    }


}