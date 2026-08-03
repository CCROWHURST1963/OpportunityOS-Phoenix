export class StatusTrackerRepository {


    constructor(

        supabaseClient,

        appState

    ){


        this.supabaseClient =

            supabaseClient;


        this.appState =

            appState;


        this.tableName =

            "status_tracker";


        this.allowedFields =

            new Set([

                "status",

                "eligible_to_sell",

                "product_type",

                "hazmat_status",

                "ungate_qty",

                "comment",

                "override"

            ]);


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






    normaliseLocale(value){


        return this.normaliseText(

            value

        ).toLowerCase()

        ||

        "co.uk";


    }






    normaliseAsin(value){


        return this.normaliseText(

            value

        ).toUpperCase();


    }






    getState(){


        return this.appState?.getState?.()

            ||

            {};


    }






    getUserId(source = {}){


        return this.normaliseText(

            source.user_id

            ??

            source.userId

            ??

            source.userKey

            ??

            this.getState().userKey

        )

        ||

        "DEFAULT";


    }






    getAsin(source = {}){


        return this.normaliseAsin(

            source.asin

            ??

            source.ASIN

            ??

            source.matched_asin

        );


    }






    getLocale(source = {}){


        return this.normaliseLocale(

            source.locale

            ??

            source.Locale

            ??

            source.matched_locale

        );


    }






    normaliseUngateQty(value){


        if(

            value ===

            ""

            ||

            value ===

            null

            ||

            value ===

            undefined

        ){


            return null;


        }


        const parsed =

            Number(

                value

            );


        if(

            !Number.isFinite(

                parsed

            )

        ){


            return null;


        }


        return Math.max(

            0,

            Math.floor(

                parsed

            )

        );


    }






    normaliseFieldValue(

        field,

        value

    ){


        switch(field){


            case "ungate_qty":


                return this.normaliseUngateQty(

                    value

                );


            case "comment":

            case "status":

            case "eligible_to_sell":

            case "product_type":

            case "hazmat_status":

            case "override":


                return this.normaliseText(

                    value

                );


            default:


                return value;


        }


    }






    validateField(field){


        const resolvedField =

            this.normaliseText(

                field

            );


        if(

            !this.allowedFields.has(

                resolvedField

            )

        ){


            throw new Error(

                `Unsupported status_tracker field: ${resolvedField}`

            );


        }


        return resolvedField;


    }






    buildIdentity(source = {}){


        const identity = {

            user_id:

                this.getUserId(

                    source

                ),


            asin:

                this.getAsin(

                    source

                ),


            locale:

                this.getLocale(

                    source

                )

        };


        if(!identity.asin){


            throw new Error(

                "ASIN is required for status_tracker persistence"

            );


        }


        return identity;


    }






    buildHeaders(extra = {}){


        return {

            apikey:

                this.supabaseClient.key,


            Authorization:

                `Bearer ${this.supabaseClient.key}`,


            "Content-Type":

                "application/json",


            Accept:

                "application/json",


            ...extra

        };


    }






    buildTableUrl(){


        return (

            String(

                this.supabaseClient.url

                ??

                ""

            ).replace(

                /\/$/,

                ""

            )

            +

            `/rest/v1/${this.tableName}`

        );


    }






    extractRows(response){


        if(Array.isArray(response)){


            return response;


        }


        if(Array.isArray(response?.data)){


            return response.data;


        }


        return [];


    }






    async upsert(payload){


        this.ensureConfigured();


        const identity =

            this.buildIdentity(

                payload

            );


        const body = {

            ...identity

        };


        for(

            const field of this.allowedFields

        ){


            if(

                Object.prototype.hasOwnProperty.call(

                    payload,

                    field

                )

            ){


                body[field] =

                    this.normaliseFieldValue(

                        field,

                        payload[field]

                    );


            }


        }


        const url =

            this.buildTableUrl()

            +

            "?on_conflict="

            +

            encodeURIComponent(

                "user_id,asin,locale"

            );


        const response =

            await fetch(

                url,

                {

                    method:

                        "POST",


                    headers:

                        this.buildHeaders({

                            Prefer:

                                "resolution=merge-duplicates,return=representation"

                        }),


                    body:

                        JSON.stringify(

                            body

                        )

                }

            );


        if(!response.ok){


            const responseText =

                await response.text();


            throw new Error(

                `status_tracker upsert failed `
                +
                `${response.status}: `
                +
                responseText.slice(

                    0,

                    500

                )

            );


        }


        const result =

            await response.json()

                .catch(() => []);


        return {

            identity:

                identity,


            payload:

                body,


            rows:

                this.extractRows(

                    result

                )

        };


    }






    async saveField(

        source,

        field,

        value

    ){


        const resolvedField =

            this.validateField(

                field

            );


        return this.upsert({

            ...this.buildIdentity(

                source

            ),


            [resolvedField]:

                this.normaliseFieldValue(

                    resolvedField,

                    value

                )

        });


    }






    async saveFields(

        source,

        changes = {}

    ){


        if(

            !changes

            ||

            typeof changes !==

                "object"

            ||

            Array.isArray(

                changes

            )

        ){


            throw new Error(

                "Tracker changes must be an object"

            );


        }


        const payload = {

            ...this.buildIdentity(

                source

            )

        };


        let changeCount =

            0;


        for(

            const [

                sourceField,

                sourceValue

            ]

            of Object.entries(

                changes

            )

        ){


            const field =

                this.validateField(

                    sourceField

                );


            payload[field] =

                this.normaliseFieldValue(

                    field,

                    sourceValue

                );


            changeCount +=

                1;


        }


        if(changeCount === 0){


            throw new Error(

                "No status_tracker fields were supplied"

            );


        }


        return this.upsert(

            payload

        );


    }






    async saveStatus(

        source,

        value

    ){


        return this.saveField(

            source,

            "status",

            value

        );


    }






    async saveEligibleToSell(

        source,

        value,

        derivedStatus = undefined

    ){


        const changes = {

            eligible_to_sell:

                value

        };


        /*
            The production implementation permits a deliberate
            Eligible To Sell edit to also persist its derived
            tracker status.

            Status is included only when the caller supplies it.
        */


        if(

            derivedStatus !==

            undefined

        ){


            changes.status =

                derivedStatus;


        }


        return this.saveFields(

            source,

            changes

        );


    }






    async saveProductType(

        source,

        value

    ){


        return this.saveField(

            source,

            "product_type",

            value

        );


    }






    async saveHazmatStatus(

        source,

        value

    ){


        return this.saveField(

            source,

            "hazmat_status",

            value

        );


    }






    async saveUngateQty(

        source,

        value

    ){


        return this.saveField(

            source,

            "ungate_qty",

            value

        );


    }






    async saveComment(

        source,

        value

    ){


        return this.saveField(

            source,

            "comment",

            value

        );


    }






    async saveOverride(

        source,

        value

    ){


        /*
            Override is intentionally persisted by itself.

            It must never overwrite status unless a separate
            explicit status change is supplied by the caller.
        */


        return this.saveField(

            source,

            "override",

            value

        );


    }


}