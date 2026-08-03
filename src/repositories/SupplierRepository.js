export class SupplierRepository {


    constructor(

        supabaseClient

    ){


        this.supabaseClient =

            supabaseClient;


    }






    async getActiveSuppliers(){


        if(

            !this.supabaseClient ||

            !this.supabaseClient.isConfigured()

        ){


            console.warn(

                "[PHX SUPPLIERS] Supabase not configured"

            );


            return [];


        }





        const url =

            `${this.supabaseClient.url}/rest/v1/suppliers`
            +
            `?select=supplier_name`
            +
            `&is_active=eq.true`
            +
            `&order=supplier_name.asc`;





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

                `Active supplier lookup failed ${response.status}: ${responseText}`

            );


        }





        const rows =

            await response.json();





        const suppliers =

            Array.isArray(rows)

                ? rows

                    .map(row =>

                        String(

                            row?.supplier_name

                            ||

                            ""

                        ).trim()

                    )

                    .filter(Boolean)

                : [];





        const uniqueSuppliers =

            [

                ...new Set(

                    suppliers

                )

            ];





        uniqueSuppliers.sort(

            (supplierA, supplierB) =>

                supplierA.localeCompare(

                    supplierB,

                    undefined,

                    {

                        sensitivity:

                            "base"

                    }

                )

        );





        console.log(

            "[PHX ACTIVE SUPPLIERS]",

            uniqueSuppliers

        );





        return uniqueSuppliers;


    }


}