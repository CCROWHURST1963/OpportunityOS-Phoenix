export class SupplierOpportunityRepository {


    constructor(

        supabaseClient,

        appState

    ){


        this.supabaseClient =

            supabaseClient;


        this.appState =

            appState;


    }






    getUserKey(){


        const state =

            this.appState?.getState?.()

            ||

            {};


        return String(

            state.userKey

            ||

            "DEFAULT"

        ).trim()

        ||

        "DEFAULT";


    }






    normaliseSupplierName(value){


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






    extractRows(response){


        if(Array.isArray(response)){


            return response;


        }


        if(Array.isArray(response?.data)){


            return response.data;


        }


        return [];


    }






    normaliseNumber(value){


        if(

            value === null

            ||

            value === undefined

            ||

            value === ""

        ){


            return null;


        }


        const parsed =

            Number(

                value

            );


        return Number.isFinite(parsed)

            ? parsed

            : null;


    }






    normaliseBoolean(value){


        if(typeof value === "boolean"){


            return value;


        }


        if(

            value === 1

            ||

            value === "1"

            ||

            String(value).toLowerCase() === "true"

        ){


            return true;


        }


        return false;


    }






    normaliseRow(

        source,

        selectedSupplier

    ){


        const row = {

            ...(

                source

                ||

                {}

            )

        };


        const supplierName =

            String(

                row.supplier

                ??

                row.selected_supplier

                ??

                row.supplier_name

                ??

                selectedSupplier

                ??

                ""

            ).trim();


        const supplierCost =

            this.normaliseNumber(

                row.supplier_cost

                ??

                row.supplier_price

                ??

                row.std_supplier_price

                ??

                row.unit_cost_excl_tax

            );


        const lowestSupplierName =

            String(

                row.lowest_supplier

                ??

                ""

            ).trim();


        const lowestSupplierCost =

            this.normaliseNumber(

                row.lowest_supplier_cost

            );


        const supplierCostDifference =

            this.normaliseNumber(

                row.supplier_cost_difference

            );


        const isSelectedSupplierLowest =

            this.normaliseBoolean(

                row.is_selected_supplier_lowest

            );


        row.supplier =

            supplierName;


        row._supplier =

            supplierName;


        row.supplier_name =

            supplierName;


        row.selected_supplier =

            supplierName;


        row.__selectedSupplierName =

            supplierName;


        row.__selectedSupplierOwned =

            true;


        if(supplierCost !== null){


            row.supplier_cost =

                supplierCost;


            row.supplier_price =

                supplierCost;


            row.std_supplier_price =

                supplierCost;


            row.unit_cost_excl_tax =

                supplierCost;


            row._cost =

                supplierCost;


        }


        row.lowest_supplier =

            lowestSupplierName;


        row.lowest_supplier_cost =

            lowestSupplierCost;


        row.supplier_cost_difference =

            supplierCostDifference;


        row.is_selected_supplier_lowest =

            isSelectedSupplierLowest;


        row.selected_supplier_details = {

            supplier:

                supplierName,


            supplierCost:

                supplierCost,


            matchedAsin:

                row.matched_asin

                ??

                row.asin

                ??

                "",


            matchedEan:

                row.matched_ean

                ??

                "",


            taxRateOnCost:

                this.normaliseNumber(

                    row.tax_rate_on_cost

                ),


            taxRateOnSale:

                this.normaliseNumber(

                    row.tax_rate_on_sale

                )

        };


        row.lowest_supplier_details = {

            supplier:

                lowestSupplierName,


            supplierCost:

                lowestSupplierCost,


            matchedEan:

                row.lowest_matched_ean

                ??

                "",


            taxRateOnCost:

                this.normaliseNumber(

                    row.lowest_tax_rate_on_cost

                ),


            taxRateOnSale:

                this.normaliseNumber(

                    row.lowest_tax_rate_on_sale

                )

        };


        /*
            Financial calculations remain deliberately blank.

            Phoenix will calculate these later using the exact
            OpportunityOS business calculation engine.
        */


        row.calc_roi_percent =

            null;


        row.calc_margin_percent =

            null;


        row.opportunity_score =

            null;


        return row;


    }






    async getRows({

        supplier,

        limit = 100

    } = {}){


        if(

            !this.supabaseClient

            ||

            !this.supabaseClient.isConfigured()

        ){


            throw new Error(

                "Supabase client is not configured"

            );


        }


        const selectedSupplier =

            this.normaliseSupplierName(

                supplier

            );


        if(!selectedSupplier){


            throw new Error(

                "Select a supplier before loading the dashboard"

            );


        }


        const userKey =

            this.getUserKey();


        const resolvedLimit =

            this.normaliseLimit(

                limit

            );


        const params = {

            p_supplier:

                selectedSupplier,


            p_mode:

                "supplier",


            p_user_key:

                userKey,


            p_limit:

                resolvedLimit

        };


        console.log(

            "[PHX SUPPLIER RPC REQUEST]",

            {

                functionName:

                    "get_supplier_opportunities_phoenix",


                params:

                    params

            }

        );


        const response =

            await this.supabaseClient.rpc(

                "get_supplier_opportunities_phoenix",

                params

            );


        console.log(

            "[PHX SUPPLIER RPC RESPONSE]",

            response

        );


        const rows =

            this.extractRows(

                response

            );


        const normalisedRows =

            rows.map(

                row =>

                    this.normaliseRow(

                        row,

                        selectedSupplier

                    )

            );


        console.log(

            "[PHX SUPPLIER RPC ROW COUNT]",

            normalisedRows.length

        );


        console.log(

            "[PHX FIRST SUPPLIER ROW]",

            normalisedRows[0]

            ||

            null

        );


        console.log(

            "[PHX FIRST LOWEST SUPPLIER COMPARISON]",

            normalisedRows.length > 0

                ? {

                    asin:

                        normalisedRows[0].asin,


                    selectedSupplier:

                        normalisedRows[0].supplier,


                    selectedSupplierCost:

                        normalisedRows[0].supplier_cost,


                    lowestSupplier:

                        normalisedRows[0].lowest_supplier,


                    lowestSupplierCost:

                        normalisedRows[0].lowest_supplier_cost,


                    supplierCostDifference:

                        normalisedRows[0].supplier_cost_difference,


                    isSelectedSupplierLowest:

                        normalisedRows[0].is_selected_supplier_lowest

                }

                : null

        );


        return normalisedRows;


    }


}