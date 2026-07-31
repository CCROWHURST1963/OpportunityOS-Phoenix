export class AmazonPackInfoRepository {


    constructor(
        supabaseClient
    ) {


        this.supabaseClient =
            supabaseClient;


    }



    async getPackInfo(
        asin,
        locale
    ) {


        if (!asin || !locale) {


            return null;


        }



        const key =

            `${asin}-${locale}`;



        const response =

            await fetch(

                `${this.supabaseClient.url}/rest/v1/amazonpackinfo?key=eq.${encodeURIComponent(key)}`,

                {

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

                `Amazon pack info lookup failed: ${response.status}`

            );


        }



        const rows =
            await response.json();



        return rows[0] || null;


    }


}