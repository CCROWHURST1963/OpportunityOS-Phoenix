export class DashboardController {


    constructor(

        opportunityService,

        supplierOpportunityService,

        viewConfig,

        viewState,

        appState,

        gridRenderer,

        calculationEngine,

        dashboardConstantsService

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


        this.calculationEngine =

            calculationEngine;


        this.dashboardConstantsService =

            dashboardConstantsService;


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


        return Array.isArray(

            rows

        )

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






    async loadDashboardConstants(request){


        if(

            !this.dashboardConstantsService

            ||

            typeof this.dashboardConstantsService.load !==

                "function"

        ){


            console.warn(

                "[PHX DASHBOARD CONSTANTS SERVICE MISSING]"

            );


            return {};


        }


        const constants =

            await this.dashboardConstantsService.load(

                request.userKey

            );


        console.log(

            "[PHX DASHBOARD CONSTANTS]",

            constants

        );


        return constants

        &&

        typeof constants ===

            "object"

            ? constants

            : {};


    }






    async calculateRows(

        rows,

        dashboardConstants

    ){


        if(

            !this.calculationEngine

            ||

            typeof this.calculationEngine.calculateRows !==

                "function"

        ){


            console.warn(

                "[PHX CALCULATION ENGINE MISSING]"

            );


            return this.normaliseRows(

                rows

            );


        }


        const calculatedRows =

            await this.calculationEngine.calculateRows(

                this.normaliseRows(

                    rows

                ),

                dashboardConstants

            );


        console.log(

            "[PHX CALC COMPLETE]",

            calculatedRows[0]?.calc

            ??

            null

        );


        return this.normaliseRows(

            calculatedRows

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






            /*
                Load constants and opportunities in parallel.

                OpportunityService already performs the
                enrichment pipeline before returning rows.
            */


            const [

                dashboardConstants,

                loadedRows

            ] =

                await Promise.all([

                    this.loadDashboardConstants(

                        request

                    ),


                    request.opportunityMode ===

                        "By Supplier"

                        ? this.loadBySupplier(

                            request

                        )

                        : this.loadByView(

                            request

                        )

                ]);






            /*
                Calculation Engine runs after enrichment and
                before AppState publication and grid rendering.
            */


            const rows =

                await this.calculateRows(

                    loadedRows,

                    dashboardConstants

                );






            /*
                Temporary targeted parity trace.

                This records the final Phoenix values after
                repository loading, enrichment, domain
                resolution and calculation have completed.
            */


            const parityRow =

                rows.find(

                    row =>

                        this.normaliseText(

                            row?.asin

                            ??

                            row?._asin

                        ) ===

                            "B09X5WMPBL"

                );


            if(parityRow){


                console.group(

                    "[PHX PARITY B09X5WMPBL]"

                );


                console.log({

                    asin:

                        parityRow.asin

                        ??

                        parityRow._asin

                        ??

                        "",


                    validated_sales_price:

                        parityRow.validated_sales_price

                        ??

                        null,


                    validated_price_used:

                        parityRow.validated_price_used

                        ??

                        null,


                    break_even_price:

                        parityRow.break_even_price

                        ??

                        parityRow.calc?.breakEvenPrice

                        ??

                        parityRow.calc?.break_even_price

                        ??

                        null,


                    target_selling_price:

                        parityRow.target_selling_price

                        ??

                        parityRow.calc?.targetSellingPrice

                        ??

                        parityRow.calc?.target_selling_price

                        ??

                        null,


                    max_cost:

                        parityRow.max_cost

                        ??

                        parityRow.calc?.maximumCost

                        ??

                        parityRow.calc?.maxCost

                        ??

                        parityRow.calc?.max_cost

                        ??

                        null,


                    opportunity_score:

                        parityRow.opportunity_score

                        ??

                        parityRow.score

                        ??

                        parityRow._score

                        ??

                        parityRow.calc?.opportunityScore

                        ??

                        parityRow.calc?.opportunity_score

                        ??

                        null,


                    calc:

                        parityRow.calc

                        ??

                        null

                });


                console.groupEnd();


            }

            else {


                console.warn(

                    "[PHX PARITY ROW NOT FOUND]",

                    {

                        asin:

                            "B09X5WMPBL",


                        rowsAvailable:

                            rows.length

                    }

                );


            }


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


                dashboardConstants:

                    dashboardConstants,


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


                    calculatedRows:

                        rows.filter(

                            row =>

                                row?.calc

                        ).length,


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

                        ${

                            this.escapeHtml(

                                errorMessage

                            )

                        }

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