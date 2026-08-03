export class SupabaseOpportunityRepository {


    constructor(

        supabaseClient,

        appState

    ){


        this.supabaseClient =

            supabaseClient;


        this.appState =

            appState;


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






    normaliseLimit(value){


        const parsed =

            Number(

                value

            );


        if(

            !Number.isFinite(parsed)

            ||

            parsed <= 0

        ){


            return 100;


        }


        return Math.floor(

            parsed

        );


    }






    normaliseStringArray(values){


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






    getState(){


        return this.appState?.getState?.()

            ||

            {};


    }






    getUserKey(request){


        return this.normaliseText(

            request?.userKey

        )

        ||

        this.normaliseText(

            this.getState().userKey

        )

        ||

        "DEFAULT";


    }






    getLocale(request){


        return this.normaliseText(

            request?.locale

        )

        ||

        this.normaliseText(

            this.getState().locale

        )

        ||

        "co.uk";


    }






    getRestrictAssigned(request){


        if(

            request?.restrictAssigned ===

            true

        ){


            return true;


        }


        return this.getState().restrictAssigned ===

            true;


    }






    extractRows(response){


        if(Array.isArray(response)){


            return response;


        }


        if(Array.isArray(response?.data)){


            return response.data;


        }


        if(Array.isArray(response?.rows)){


            return response.rows;


        }


        if(Array.isArray(response?.result)){


            return response.result;


        }


        if(Array.isArray(response?.body)){


            return response.body;


        }


        if(Array.isArray(response?.payload)){


            return response.payload;


        }


        /*
            Some wrappers return:

            {
                data:{
                    rows:[...]
                }
            }
        */


        if(Array.isArray(response?.data?.rows)){


            return response.data.rows;


        }


        if(Array.isArray(response?.data?.result)){


            return response.data.result;


        }


        console.warn(

            "[PHX UNRECOGNISED RPC RESPONSE]",

            response

        );


        return [];


    }






    normaliseAttributeField(value){


        const field =

            this.normaliseText(

                value

            );


        switch(field){


            case "brand":

            case "brand_name":


                return "brand";


            case "category":

            case "categories_root":


                /*
                    The row RPC uses the logical field name
                    "category" and maps it internally to
                    categories_root.
                */


                return "category";


            case "sub_category":

            case "subcategory":


                return "sub_category";


            default:


                return "";


        }


    }






    isAttributeRequest(request){


        const field =

            this.normaliseAttributeField(

                request.attributeField

                ??

                request.viewFilterType

            );


        const values =

            this.normaliseStringArray(

                request.selectedAttributeValues

                ??

                request.viewFilterValues

            );


        return Boolean(

            field

            &&

            values.length > 0

        );


    }






    async loadRowsByAttribute(request){


        const field =

            this.normaliseAttributeField(

                request.attributeField

                ??

                request.viewFilterType

            );


        const values =

            this.normaliseStringArray(

                request.selectedAttributeValues

                ??

                request.viewFilterValues

            );


        if(!field){


            throw new Error(

                "Dashboard attribute field is missing"

            );


        }


        if(values.length === 0){


            throw new Error(

                "No dashboard attribute values were selected"

            );


        }


        const params = {

            p_field:

                field,


            p_values:

                values,


            p_user_key:

                this.getUserKey(

                    request

                ),


            p_limit:

                this.normaliseLimit(

                    request.rowsLimit

                    ??

                    request.limit

                ),


            p_locale:

                this.getLocale(

                    request

                ),


            p_restrict_assigned:

                this.getRestrictAssigned(

                    request

                )

        };


        console.log(

            "[PHX ATTRIBUTE ROW RPC PARAMS]",

            params

        );


        const response =

            await this.supabaseClient.rpc(

                "get_opportunity_rows_by_attribute_v1",

                params

            );


        console.log(

            "[PHX ATTRIBUTE ROW RAW RESPONSE]",

            response

        );


        const rows =

            this.extractRows(

                response

            );


        console.log(

            "[PHX ATTRIBUTE ROW RPC COUNT]",

            rows.length

        );


        console.log(

            "[PHX ATTRIBUTE ROW FIRST ROW]",

            rows[0]

            ||

            null

        );


        return rows;


    }






    async loadStandardRows(request){


        const view =

            this.normaliseText(

                request.currentView

                ??

                request.view

                ??

                request.process

            )

            ||

            "Can We Sell";


        const params = {

            p_view:

                view,


            p_user_key:

                this.getUserKey(

                    request

                ),


            p_limit:

                this.normaliseLimit(

                    request.rowsLimit

                    ??

                    request.limit

                )

        };


        console.log(

            "[PHX STANDARD DASHBOARD RPC PARAMS]",

            params

        );


        const response =

            await this.supabaseClient.rpc(

                "get_opportunity_dataset",

                params

            );


        console.log(

            "[PHX STANDARD DASHBOARD RAW RESPONSE]",

            response

        );


        const rows =

            this.extractRows(

                response

            );


        console.log(

            "[PHX STANDARD DASHBOARD RPC COUNT]",

            rows.length

        );


        return rows;


    }






    async getRows(request = {}){


        this.ensureConfigured();


        console.log(

            "[PHX OPPORTUNITY REPOSITORY REQUEST]",

            request

        );


        if(

            this.isAttributeRequest(

                request

            )

        ){


            return this.loadRowsByAttribute(

                request

            );


        }


        return this.loadStandardRows(

            request

        );


    }


}