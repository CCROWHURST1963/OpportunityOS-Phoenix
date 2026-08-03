export class TrackerLookupRepository {


    constructor(

        supabaseClient

    ){


        this.supabaseClient =

            supabaseClient;


        /*
            Hazmat Status remains application-owned.

            Eligible To Sell, Product Type and Override
            Status are loaded from Supabase.
        */


        this.hazmatStatusValues = [

            "Unknown",

            "Not Dangerous Goods",

            "Fulfillable Dangerous Goods",

            "Under Dangerous Goods Review",

            "Safety Data Sheet Required",

            "Exemption Sheet Required",

            "Unable To Classify"

        ];


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






    normaliseOptionValues(values){


        if(!Array.isArray(values)){


            return [];


        }


        const seen =

            new Set();


        const result =

            [];


        for(

            const source of values

        ){


            const value =

                this.normaliseText(

                    source

                );


            if(!value){


                continue;


            }


            const key =

                value.toLocaleLowerCase();


            if(seen.has(key)){


                continue;


            }


            seen.add(key);


            result.push(

                value

            );


        }


        return result.sort(

            (left, right) =>

                left.localeCompare(

                    right,

                    undefined,

                    {

                        sensitivity:

                            "base",


                        numeric:

                            true

                    }

                )

        );


    }






    /*
        Used for status_values because the database
        sort_order must be preserved.

        Unlike normaliseOptionValues(), this method does
        not alphabetically sort the result.
    */


    deduplicatePreservingOrder(values){


        if(!Array.isArray(values)){


            return [];


        }


        const seen =

            new Set();


        const result =

            [];


        for(

            const source of values

        ){


            const value =

                this.normaliseText(

                    source

                );


            if(!value){


                continue;


            }


            const key =

                value.toLocaleLowerCase();


            if(seen.has(key)){


                continue;


            }


            seen.add(key);


            result.push(

                value

            );


        }


        return result;


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






    buildTableUrl(

        tableName,

        query = "select=*"

    ){


        const baseUrl =

            String(

                this.supabaseClient.url

                ??

                ""

            ).replace(

                /\/$/,

                ""

            );


        return (

            `${baseUrl}/rest/v1/${tableName}`

            +

            `?${query}`

        );


    }






    async fetchRows(

        tableName,

        query = "select=*"

    ){


        this.ensureConfigured();


        const response =

            await fetch(

                this.buildTableUrl(

                    tableName,

                    query

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

                `${tableName} lookup failed `
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






    extractFirstValue(

        row,

        possibleFields

    ){


        if(

            !row

            ||

            typeof row !==

                "object"

        ){


            return "";


        }


        for(

            const field of possibleFields

        ){


            const value =

                this.normaliseText(

                    row[field]

                );


            if(value){


                return value;


            }


        }


        return "";


    }






    extractOptions(

        rows,

        possibleFields

    ){


        return this.normaliseOptionValues(

            rows.map(row =>

                this.extractFirstValue(

                    row,

                    possibleFields

                )

            )

        );


    }






    getOrderValue(row){


        const possibleValues = [

            row?.sort_order,

            row?.display_order,

            row?.order,

            row?.sequence,

            row?.seq

        ];


        for(

            const value of possibleValues

        ){


            if(

                value ===

                    null

                ||

                value ===

                    undefined

                ||

                String(

                    value

                ).trim() ===

                    ""

            ){


                continue;


            }


            const parsed =

                Number(

                    value

                );


            if(Number.isFinite(parsed)){


                return parsed;


            }


        }


        /*
            Null sort orders appear after explicitly
            ordered statuses.
        */


        return Number.MAX_SAFE_INTEGER;


    }






    getStatusValue(row){


        return this.extractFirstValue(

            row,

            [

                "current_step",

                "status_value",

                "status",

                "value",

                "name",

                "label"

            ]

        );


    }






    sortStatusRows(rows){


        if(!Array.isArray(rows)){


            return [];


        }


        return [

            ...rows

        ].sort(

            (left, right) => {


                const leftOrder =

                    this.getOrderValue(

                        left

                    );


                const rightOrder =

                    this.getOrderValue(

                        right

                    );


                const orderDifference =

                    leftOrder

                    -

                    rightOrder;


                if(orderDifference !== 0){


                    return orderDifference;


                }


                const leftValue =

                    this.getStatusValue(

                        left

                    );


                const rightValue =

                    this.getStatusValue(

                        right

                    );


                return leftValue.localeCompare(

                    rightValue,

                    undefined,

                    {

                        sensitivity:

                            "base",


                        numeric:

                            true

                    }

                );


            }

        );


    }






    async getEligibleToSellOptions(){


        const rows =

            await this.fetchRows(

                "producteligible",

                "select=*&limit=1000"

            );


        return this.extractOptions(

            rows,

            [

                "eligible_to_sell",

                "eligibility",

                "value",

                "status",

                "name",

                "label"

            ]

        );


    }






    async getProductTypeOptions(){


        const rows =

            await this.fetchRows(

                "dangerous_hazma",

                "select=*&limit=1000"

            );


        return this.extractOptions(

            rows,

            [

                "product_type",

                "type",

                "value",

                "status",

                "name",

                "label"

            ]

        );


    }






    async getOverrideStatusOptions(){


        /*
            status_values schema:

            current_step
            sort_order

            Request database ordering first. The local sort
            remains as a defensive fallback.
        */


        const rows =

            await this.fetchRows(

                "status_values",

                "select=*&order=sort_order.asc.nullslast&limit=1000"

            );


        const sortedRows =

            this.sortStatusRows(

                rows

            );


        /*
            Preserve sort_order rather than alphabetically
            sorting the final values.
        */


        return this.deduplicatePreservingOrder(

            sortedRows.map(row =>

                this.getStatusValue(

                    row

                )

            )

        );


    }






    getHazmatStatusOptions(){


        return [

            ...this.hazmatStatusValues

        ];


    }






    async getAll(){


        const [

            eligibleToSell,

            productType,

            override

        ] =

            await Promise.all([

                this.getEligibleToSellOptions(),

                this.getProductTypeOptions(),

                this.getOverrideStatusOptions()

            ]);


        return {

            eligible_to_sell:

                eligibleToSell,


            product_type:

                productType,


            hazmat_status:

                this.getHazmatStatusOptions(),


            override:

                override

        };


    }


}