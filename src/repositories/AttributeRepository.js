export class AttributeRepository {


    constructor(

        supabaseClient,

        appState

    ){


        this.supabaseClient =

            supabaseClient;


        this.appState =

            appState;


        this.pageSize =

            1000;


        this.tableName =

            "opportunity_grid_view";


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






    normaliseNumber(value){


        if(

            value ===

            null

            ||

            value ===

            undefined

            ||

            value ===

            ""

        ){


            return 0;


        }


        const cleaned =

            String(

                value

            )

                .replaceAll(

                    ",",

                    ""

                )

                .replace(

                    /[^0-9.-]/g,

                    ""

                );


        const parsed =

            Number(

                cleaned

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : 0;


    }






    normaliseAttributeField(value){


        const field =

            this.normaliseText(

                value

            );


        const allowedFields =

            new Set([

                "brand",

                "categories_root",

                "sub_category"

            ]);


        if(

            !allowedFields.has(

                field

            )

        ){


            throw new Error(

                `Unsupported attribute field: ${field}`

            );


        }


        return field;


    }






    getState(){


        return this.appState?.getState?.()

            ||

            {};


    }






    getUserKey(){


        const state =

            this.getState();


        return this.normaliseText(

            state.userKey

        )

        ||

        "DEFAULT";


    }






    getLocale(){


        const state =

            this.getState();


        return this.normaliseText(

            state.locale

        )

        ||

        "co.uk";


    }






    getRestrictAssigned(){


        const state =

            this.getState();


        return state.restrictAssigned ===

            true;


    }






    getSelectedColumns(field){


        const columns =

            new Set([

                field,

                "brand",

                "locale",

                "assigned_to",

                "tracker_status",

                "last_known_bought_past_month",

                "bought_past_month"

            ]);


        return [

            ...columns

        ];


    }






    buildHeaders(){


        return {

            apikey:

                this.supabaseClient.key,


            Authorization:

                `Bearer ${this.supabaseClient.key}`,


            Accept:

                "application/json",


            Prefer:

                "count=exact"

        };


    }






    buildRequestUrl({

        field,

        start,

        end

    }){


        const columns =

            this.getSelectedColumns(

                field

            );


        const params =

            new URLSearchParams();


        params.set(

            "select",

            columns.join(",")

        );


        params.append(

            field,

            "not.is.null"

        );


        params.append(

            "order",

            `${field}.asc`

        );


        const locale =

            this.getLocale();


        if(locale){


            params.append(

                "locale",

                `eq.${locale}`

            );


        }


        if(

            this.getRestrictAssigned()

        ){


            params.append(

                "assigned_to",

                `eq.${this.getUserKey()}`

            );


        }


        return {

            url:

                `${this.supabaseClient.url}`
                +
                `/rest/v1/${this.tableName}`
                +
                `?${params.toString()}`,


            range:

                `${start}-${end}`

        };


    }






    async fetchPage({

        field,

        start,

        end

    }){


        const request =

            this.buildRequestUrl({

                field,

                start,

                end

            });


        const response =

            await fetch(

                request.url,

                {

                    method:

                        "GET",


                    headers:{

                        ...this.buildHeaders(),


                        Range:

                            request.range

                    }

                }

            );


        if(!response.ok){


            const responseText =

                await response.text();


            throw new Error(

                `Attribute row fetch failed `
                +
                `${response.status}: ${responseText}`

            );


        }


        const rows =

            await response.json();


        return {

            rows:

                Array.isArray(rows)

                    ? rows

                    : [],


            contentRange:

                response.headers.get(

                    "content-range"

                )

                ||

                ""

        };


    }






    getTotalFromContentRange(value){


        const contentRange =

            this.normaliseText(

                value

            );


        if(!contentRange){


            return null;


        }


        const slashIndex =

            contentRange.lastIndexOf(

                "/"

            );


        if(slashIndex < 0){


            return null;


        }


        const totalText =

            contentRange.slice(

                slashIndex + 1

            );


        if(

            totalText ===

            "*"

        ){


            return null;


        }


        const parsed =

            Number(

                totalText

            );


        return Number.isFinite(parsed)

            ? parsed

            : null;


    }






    isExcludedStatus(value){


        const status =

            this.normaliseText(

                value

            ).toLocaleLowerCase();


        return [

            "lead",

            "lead created",

            "converted",

            "converted to lead"

        ].includes(

            status

        );


    }






    normaliseRow(

        source,

        field

    ){


        const row =

            source

            &&

            typeof source ===

                "object"

                ? source

                : {};


        const value =

            this.normaliseText(

                row[field]

            );


        const bought =

            this.normaliseNumber(

                row.last_known_bought_past_month

                ??

                row.bought_past_month

                ??

                0

            );


        return {

            value:

                value,


            brand:

                this.normaliseText(

                    row.brand

                ),


            bought:

                bought,


            locale:

                this.normaliseText(

                    row.locale

                )

                ||

                "co.uk",


            assignedTo:

                this.normaliseText(

                    row.assigned_to

                ),


            status:

                this.normaliseText(

                    row.tracker_status

                )

        };


    }






    async getRows({

        attribute

    } = {}){


        this.ensureConfigured();


        const field =

            this.normaliseAttributeField(

                attribute

            );


        const collectedRows =

            [];


        let start =

            0;


        let totalRows =

            null;


        let pageNumber =

            0;


        console.log(

            "[PHX ATTRIBUTE REST LOAD START]",

            {

                table:

                    this.tableName,


                attribute:

                    field,


                pageSize:

                    this.pageSize,


                locale:

                    this.getLocale(),


                restrictAssigned:

                    this.getRestrictAssigned()

            }

        );


        while(true){


            const end =

                start

                +

                this.pageSize

                -

                1;


            pageNumber += 1;


            const result =

                await this.fetchPage({

                    field,

                    start,

                    end

                });


            if(

                totalRows ===

                null

            ){


                totalRows =

                    this.getTotalFromContentRange(

                        result.contentRange

                    );


            }


            const pageRows =

                result.rows;


            for(

                const source of pageRows

            ){


                const row =

                    this.normaliseRow(

                        source,

                        field

                    );


                if(!row.value){


                    continue;


                }


                if(

                    this.isExcludedStatus(

                        row.status

                    )

                ){


                    continue;


                }


                collectedRows.push(

                    row

                );


            }


            console.log(

                "[PHX ATTRIBUTE REST PAGE]",

                {

                    attribute:

                        field,


                    page:

                        pageNumber,


                    received:

                        pageRows.length,


                    acceptedTotal:

                        collectedRows.length,


                    databaseTotal:

                        totalRows

                }

            );


            if(

                pageRows.length <

                this.pageSize

            ){


                break;


            }


            start +=

                this.pageSize;


            if(

                totalRows !==

                null

                &&

                start >=

                totalRows

            ){


                break;


            }


        }


        console.log(

            "[PHX ATTRIBUTE REST LOAD COMPLETE]",

            {

                attribute:

                    field,


                rows:

                    collectedRows.length,


                pages:

                    pageNumber

            }

        );


        return collectedRows;


    }






    /*
        Compatibility method used by AttributeService.

        The repository now returns lightweight raw rows.
        Aggregation, ranking and Top N are performed by
        AttributeService.
    */


    async getOptions({

        attribute

    } = {}){


        return this.getRows({

            attribute

        });


    }


}