export class AppState {


    constructor(){


        this.state = {


            /*
                User context
            */


            wixUserId:

                null,


            userKey:

                "DEFAULT",


            userName:

                "",


            role:

                "",


            multiUsers:

                false,





            /*
                Dashboard configuration
            */


            processes:

                [],


            process:

                "Can We Sell",


            opportunityMode:

                "By View",


            currentView:

                "",


            currentViewConfig:

                null,


            views:

                [],





            /*
                By View selection
            */


            opportunityView:

                "",





            /*
                By View filter state
            */


            viewFilterType:

                "",


            viewFilterValue:

                "",


            viewFilterValues:

                [],


            viewFilterLabel:

                "",


            viewFilterOptions:

                [],


            viewFilterLoading:

                false,


            viewFilterLoaded:

                false,


            viewFilterError:

                "",


            viewDateValue:

                "",





            /*
                Attribute filter state
            */


            attributeSelectionType:

                "",


            attributeTopCount:

                100,


            attributeOptions:

                [],


            selectedAttributeValues:

                [],


            attributeOptionsLoading:

                false,


            attributeOptionsLoaded:

                false,


            attributeOptionsError:

                "",





            /*
                Sub Category dependency
            */


            selectedCategory:

                "",


            selectedSubCategory:

                "",





            /*
                Supplier selection
            */


            suppliers:

                [],


            selectedSupplier:

                "",


            suppliersLoading:

                false,


            suppliersLoaded:

                false,


            supplierLoadError:

                "",





            /*
                Import selection
            */


            importType:

                "",


            importFileName:

                "",


            importValues:

                [],


            importLoading:

                false,


            importLoaded:

                false,


            importError:

                "",





            /*
                Tracker lookup configuration
            */


            trackerLookups:{

                eligible_to_sell:

                    [],


                product_type:

                    [],


                hazmat_status:

                    [],


                override:

                    []

            },





            /*
                Dashboard calculation constants
            */


            dashboardConstants:

                {},


            configurationLoading:

                false,


            configurationLoaded:

                false,


            configurationError:

                "",





            /*
                Grid state
            */


            rowsLimit:

                100,


            filterMode:

                "show_all",


            totalRecords:

                0,


            rows:

                [],


            gridLoaded:

                false,


            totalOpportunities:

                0,





            /*
                Status
            */


            status:

                "System Ready",


            dashboardStatus:

                "Ready"


        };


        this.listeners =

            [];


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseAsin(value){


        return this.normaliseText(

            value

        ).toUpperCase();


    }






    normaliseLocale(value){


        return this.normaliseText(

            value

        ).toLowerCase()

        ||

        "co.uk";


    }






    getRowAsin(row){


        return this.normaliseAsin(

            row?.asin

            ??

            row?.ASIN

            ??

            row?.matched_asin

        );


    }






    getRowLocale(row){


        return this.normaliseLocale(

            row?.locale

            ??

            row?.Locale

            ??

            row?.matched_locale

        );


    }






    get(key){


        return this.state[key];


    }






    set(

        key,

        value

    ){


        this.state[key] =

            value;


        this.notify();


    }






    update(values){


        if(

            !values

            ||

            typeof values !==

                "object"

        ){


            return;


        }


        Object.assign(

            this.state,

            values

        );


        this.notify();


    }






    updateRow(

        source,

        changes

    ){


        if(

            !source

            ||

            !changes

            ||

            typeof changes !==

                "object"

        ){


            return null;


        }


        const asin =

            this.getRowAsin(

                source

            );


        const locale =

            this.getRowLocale(

                source

            );


        if(!asin){


            return null;


        }


        const rows =

            Array.isArray(

                this.state.rows

            )

                ? this.state.rows

                : [];


        let updatedRow =

            null;


        let changed =

            false;


        const updatedRows =

            rows.map(row => {


                if(

                    this.getRowAsin(

                        row

                    ) !==

                        asin

                    ||

                    this.getRowLocale(

                        row

                    ) !==

                        locale

                ){


                    return row;


                }


                changed =

                    true;


                updatedRow = {

                    ...row,

                    ...changes

                };


                return updatedRow;


            });


        if(!changed){


            return null;


        }


        this.state.rows =

            updatedRows;


        this.notify();


        return updatedRow;


    }






    updateRowByIdentity({

        asin,

        locale = "co.uk",

        changes

    } = {}){


        return this.updateRow(

            {

                asin:

                    asin,


                locale:

                    locale

            },

            changes

        );


    }






    cloneTrackerLookups(){


        const source =

            this.state.trackerLookups

            ||

            {};


        return {

            eligible_to_sell:

                Array.isArray(

                    source.eligible_to_sell

                )

                    ? [

                        ...source.eligible_to_sell

                    ]

                    : [],


            product_type:

                Array.isArray(

                    source.product_type

                )

                    ? [

                        ...source.product_type

                    ]

                    : [],


            hazmat_status:

                Array.isArray(

                    source.hazmat_status

                )

                    ? [

                        ...source.hazmat_status

                    ]

                    : [],


            override:

                Array.isArray(

                    source.override

                )

                    ? [

                        ...source.override

                    ]

                    : []

        };


    }






    getState(){


        return {


            ...this.state,


            suppliers:

                Array.isArray(

                    this.state.suppliers

                )

                    ? [

                        ...this.state.suppliers

                    ]

                    : [],


            importValues:

                Array.isArray(

                    this.state.importValues

                )

                    ? [

                        ...this.state.importValues

                    ]

                    : [],


            processes:

                Array.isArray(

                    this.state.processes

                )

                    ? [

                        ...this.state.processes

                    ]

                    : [],


            views:

                Array.isArray(

                    this.state.views

                )

                    ? [

                        ...this.state.views

                    ]

                    : [],


            viewFilterOptions:

                Array.isArray(

                    this.state.viewFilterOptions

                )

                    ? [

                        ...this.state.viewFilterOptions

                    ]

                    : [],


            viewFilterValues:

                Array.isArray(

                    this.state.viewFilterValues

                )

                    ? [

                        ...this.state.viewFilterValues

                    ]

                    : [],


            attributeOptions:

                Array.isArray(

                    this.state.attributeOptions

                )

                    ? [

                        ...this.state.attributeOptions

                    ]

                    : [],


            selectedAttributeValues:

                Array.isArray(

                    this.state.selectedAttributeValues

                )

                    ? [

                        ...this.state.selectedAttributeValues

                    ]

                    : [],


            trackerLookups:

                this.cloneTrackerLookups(),


            dashboardConstants:

                {

                    ...(

                        this.state.dashboardConstants

                        ||

                        {}

                    )

                },


            rows:

                Array.isArray(

                    this.state.rows

                )

                    ? this.state.rows.map(row => ({

                        ...row

                    }))

                    : []


        };


    }






    subscribe(callback){


        if(

            typeof callback !==

            "function"

        ){


            return () => {};


        }


        this.listeners.push(

            callback

        );


        return () => {


            this.listeners =

                this.listeners.filter(

                    listener =>

                        listener !== callback

                );


        };


    }






    notify(){


        const snapshot =

            this.getState();


        for(

            const listener of this.listeners

        ){


            try{


                listener(

                    snapshot

                );


            }

            catch(error){


                console.error(

                    "[PHX APP STATE LISTENER ERROR]",

                    error

                );


            }


        }


    }


}