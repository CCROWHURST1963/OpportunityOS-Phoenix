export class DashboardController {


    constructor(

        opportunityService,

        supplierOpportunityService,

        viewConfig,

        viewState,

        appState,

        gridRenderer

    ){


        this.opportunityService =

            opportunityService;


        this.supplierOpportunityService =

            supplierOpportunityService;


        this.viewConfig =

            viewConfig;


        this.viewState =

            viewState;


        this.appState =

            appState;


        this.gridRenderer =

            gridRenderer;


        this.container =

            null;


        this.gridContainer =

            null;


        this.loadEventHandler =

            null;


    }






    mount(container){


        this.container =

            container;


        this.render();


        this.bind();


    }






    bind(){


        if(this.loadEventHandler){


            document.removeEventListener(

                "phoenix-load-dashboard",

                this.loadEventHandler

            );


        }


        this.loadEventHandler =

            async () => {


                await this.loadDashboard();


            };


        document.addEventListener(

            "phoenix-load-dashboard",

            this.loadEventHandler

        );


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseMode(value){


        return this.normaliseText(

            value

        ) ===

            "By Supplier"

            ? "By Supplier"

            : "By View";


    }






    normaliseRows(rows){


        return Array.isArray(rows)

            ? rows

            : [];


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






    isAttributeView(value){


        return [

            "By Brand",

            "By Category",

            "By Sub Category"

        ].includes(

            this.normaliseText(

                value

            )

        );


    }






    getAttributeField(state){


        const stateField =

            this.normaliseText(

                state.viewFilterType

            );


        if(

            [

                "brand",

                "categories_root",

                "sub_category"

            ].includes(

                stateField

            )

        ){


            return stateField;


        }


        switch(

            this.normaliseText(

                state.opportunityView

            )

        ){


            case "By Brand":


                return "brand";


            case "By Category":


                return "categories_root";


            case "By Sub Category":


                return "sub_category";


            default:


                return "";


        }


    }






    buildDashboardRequest(state){


        const opportunityMode =

            this.normaliseMode(

                state.opportunityMode

            );


        const opportunityView =

            this.normaliseText(

                state.opportunityView

            );


        const selectedAttributeValues =

            this.normaliseStringArray(

                state.selectedAttributeValues

            );


        const viewFilterValues =

            this.normaliseStringArray(

                state.viewFilterValues

            );


        return {

            /*
                Workflow process
            */

            process:

                this.normaliseText(

                    state.process

                )

                ||

                "Can We Sell",



            /*
                Saved Custom View.

                This controls grid columns only.
            */

            currentView:

                this.normaliseText(

                    state.currentView

                ),


            currentViewConfig:

                state.currentViewConfig

                ||

                {},



            /*
                Dashboard data mode
            */

            opportunityMode:

                opportunityMode,


            opportunityView:

                opportunityView,



            /*
                Attribute filters
            */

            attributeField:

                this.getAttributeField(

                    state

                ),


            attributeSelectionType:

                this.normaliseText(

                    state.attributeSelectionType

                ),


            attributeTopCount:

                Number(

                    state.attributeTopCount

                    ??

                    10

                ),


            selectedAttributeValues:

                selectedAttributeValues,



            /*
                Lookup/date filters
            */

            viewFilterType:

                this.normaliseText(

                    state.viewFilterType

                ),


            viewFilterValue:

                this.normaliseText(

                    state.viewFilterValue

                ),


            viewFilterValues:

                viewFilterValues,


            viewDateValue:

                this.normaliseText(

                    state.viewDateValue

                ),



            /*
                Supplier mode
            */

            selectedSupplier:

                this.normaliseText(

                    state.selectedSupplier

                ),



            /*
                Request context
            */

            rowsLimit:

                Number(

                    state.rowsLimit

                    ??

                    100

                ),


            filterMode:

                this.normaliseText(

                    state.filterMode

                )

                ||

                "show_all",


            userKey:

                this.normaliseText(

                    state.userKey

                )

                ||

                "DEFAULT",


            locale:

                this.normaliseText(

                    state.locale

                )

                ||

                "co.uk",


            restrictAssigned:

                state.restrictAssigned ===

                true

        };


    }






    validateByViewRequest(request){


        if(

            !this.normaliseText(

                request.opportunityView

            )

        ){


            throw new Error(

                "Select a View before loading the dashboard"

            );


        }


        if(

            this.isAttributeView(

                request.opportunityView

            )

            &&

            request.selectedAttributeValues.length ===

                0

        ){


            throw new Error(

                "Choose at least one filter value before loading the dashboard"

            );


        }


    }






    async loadByView(request){


        if(

            !this.opportunityService

            ||

            typeof this.opportunityService.getRows !==

                "function"

        ){


            throw new Error(

                "Opportunity service is not available"

            );


        }


        this.validateByViewRequest(

            request

        );


        const rows =

            await this.opportunityService.getRows(

                request

            );


        return this.normaliseRows(

            rows

        );


    }






    async loadBySupplier(request){


        if(!request.selectedSupplier){


            throw new Error(

                "Select a supplier before loading the dashboard"

            );


        }


        if(

            !this.supplierOpportunityService

            ||

            typeof this.supplierOpportunityService.getRows !==

                "function"

        ){


            throw new Error(

                "Supplier opportunity service is not available"

            );


        }


        const rows =

            await this.supplierOpportunityService.getRows({

                supplier:

                    request.selectedSupplier,


                process:

                    request.process,


                currentView:

                    request.currentView,


                limit:

                    request.rowsLimit,


                userKey:

                    request.userKey,


                locale:

                    request.locale

            });


        return this.normaliseRows(

            rows

        );


    }






    async loadDashboard(){


        try{


            if(

                !this.appState

                ||

                typeof this.appState.getState !==

                    "function"

                ||

                typeof this.appState.update !==

                    "function"

            ){


                throw new Error(

                    "DashboardController did not receive a valid AppState instance"

                );


            }


            const state =

                this.appState.getState();


            const request =

                this.buildDashboardRequest(

                    state

                );


            console.log(

                "[PHX DASHBOARD REQUEST]",

                request

            );


            this.appState.update({

                status:

                    "Dashboard Loading",


                dashboardStatus:

                    "Loading",


                gridLoaded:

                    false,


                totalOpportunities:

                    0

            });


            if(this.gridContainer){


                this.gridContainer.innerHTML = `

                    <div class="phoenix-dashboard-message">

                        Dashboard Loading...

                    </div>

                `;


            }


            const rows =

                request.opportunityMode ===

                    "By Supplier"

                    ? await this.loadBySupplier(

                        request

                    )

                    : await this.loadByView(

                        request

                    );


            console.log(

                "[PHX DASHBOARD ROW COUNT]",

                rows.length

            );


            console.log(

                "[PHX DASHBOARD FIRST ROW]",

                rows[0]

                ||

                null

            );


            this.appState.update({

                rows:

                    rows,


                totalRecords:

                    rows.length,


                status:

                    "Dashboard Rendering",


                dashboardStatus:

                    "Rendering",


                gridLoaded:

                    false,


                totalOpportunities:

                    0

            });


            const renderSucceeded =

                this.renderRows(

                    rows

                );


            if(!renderSucceeded){


                throw new Error(

                    "Grid rendering did not complete successfully"

                );


            }


            this.appState.update({

                status:

                    rows.length > 0

                        ? `Total Opportunities - ${rows.length}`

                        : "No Opportunities Found",


                dashboardStatus:

                    "Ready",


                gridLoaded:

                    true,


                totalOpportunities:

                    rows.length

            });


            console.log(

                "[PHX GRID LOAD COMPLETE]",

                {

                    rowsRendered:

                        rows.length,


                    request:

                        request

                }

            );


        }

        catch(error){


            console.error(

                "[PHX DASHBOARD ERROR]",

                error

            );


            const errorMessage =

                error?.message

                ||

                "Dashboard load failed";


            if(

                this.appState

                &&

                typeof this.appState.update ===

                    "function"

            ){


                this.appState.update({

                    rows:

                        [],


                    totalRecords:

                        0,


                    status:

                        "Dashboard Error",


                    dashboardStatus:

                        "Error",


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


            }


            if(this.gridContainer){


                this.gridContainer.innerHTML = `

                    <div class="phoenix-dashboard-message phoenix-dashboard-error">

                        ${this.escapeHtml(errorMessage)}

                    </div>

                `;


            }


        }


    }






    render(){


        if(!this.container){


            return;


        }


        this.container.innerHTML = `

            <div

                id="phoenix-grid-container"

                class="phoenix-dashboard-grid"

            >

                

            </div>

        `;


        this.gridContainer =

            this.container.querySelector(

                "#phoenix-grid-container"

            );


    }






    getVisibleColumns(state){


        const config =

            state.currentViewConfig

            ||

            {};


        const visibleKeys =

            Array.isArray(

                config.visibleColumns

            )

                ? config.visibleColumns

                : [];


        const configuredColumns =

            Array.isArray(

                config.columns

            )

                ? config.columns

                : [];


        return configuredColumns.filter(

            column => {


                const columnKey =

                    column?.key

                    ??

                    column?.field;


                return visibleKeys.includes(

                    columnKey

                );


            }

        );


    }






    renderRows(rows){


        const state =

            this.appState.getState();


        const columns =

            this.getVisibleColumns(

                state

            );


        console.log(

            "[PHX RENDER COLUMNS]",

            columns

        );


        if(!this.gridContainer){


            console.error(

                "[PHX GRID CONTAINER MISSING]"

            );


            return false;


        }


        if(

            !this.gridRenderer

            ||

            typeof this.gridRenderer.render !==

                "function"

        ){


            this.gridContainer.innerHTML = `

                <div class="phoenix-dashboard-message phoenix-dashboard-error">

                    Grid renderer is not available.

                </div>

            `;


            return false;


        }


        try{


            this.gridRenderer.render(

                this.gridContainer,

                columns,

                rows

            );


            return true;


        }

        catch(error){


            console.error(

                "[PHX GRID RENDER ERROR]",

                error

            );


            return false;


        }


    }






    escapeHtml(value){


        return String(

            value

            ??

            ""

        )

            .replaceAll(

                "&",

                "&amp;"

            )

            .replaceAll(

                "<",

                "&lt;"

            )

            .replaceAll(

                ">",

                "&gt;"

            )

            .replaceAll(

                "\"",

                "&quot;"

            )

            .replaceAll(

                "'",

                "&#039;"

            );


    }


}