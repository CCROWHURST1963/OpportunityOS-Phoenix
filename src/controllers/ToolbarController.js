export class ToolbarController {


    constructor(

        appState,

        supplierRepository = null

    ){


        this.appState =

            appState;


        this.supplierRepository =

            supplierRepository;


        this.element =

            null;


        this.openTools =

            false;


        this.supplierLoadPromise =

            null;


    }






    mount(element){


        this.element =

            element;


        this.render();


        this.bind();


        this.notifyToolbarRendered();


        const state =

            this.appState.getState();


        if(

            state.opportunityMode ===

            "By Supplier"

        ){


            this.ensureSuppliersLoaded();


        }


    }






    notifyToolbarRendered(){


        document.dispatchEvent(

            new CustomEvent(

                "phoenix-toolbar-rendered"

            )

        );


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






    getOpportunityViewOptions(){


        return [

            {

                value:

                    "By Assigned To",


                label:

                    "By Assigned To"

            },

            {

                value:

                    "By Brand",


                label:

                    "By Brand"

            },

            {

                value:

                    "By Category",


                label:

                    "By Category"

            },

            {

                value:

                    "By Date Created",


                label:

                    "By Date Created"

            },

            {

                value:

                    "By Date Updated",


                label:

                    "By Date Updated"

            },

            {

                value:

                    "By Status Tracker",


                label:

                    "By Status Tracker"

            },

            {

                value:

                    "By Sub Category",


                label:

                    "By Sub Category"

            }

        ];


    }






    renderViewOptions(state){


        const views =

            this.getOpportunityViewOptions();


        const currentOpportunityView =

            String(

                state.opportunityView

                ??

                ""

            ).trim();


        const options =

            views

                .map(view => {


                    const escapedValue =

                        this.escapeHtml(

                            view.value

                        );


                    const escapedLabel =

                        this.escapeHtml(

                            view.label

                        );


                    const selected =

                        currentOpportunityView ===

                        view.value

                            ? "selected"

                            : "";


                    return `

                        <option

                            value="${escapedValue}"

                            ${selected}

                        >

                            ${escapedLabel}

                        </option>

                    `;


                })

                .join("");


        const currentViewExists =

            views.some(view =>

                view.value ===

                currentOpportunityView

            );


        return `

            <option

                value=""

                ${currentViewExists ? "" : "selected"}

            >

                Select View

            </option>

            ${options}

        `;


    }






    renderViewSelector(state){


        if(

            state.opportunityMode !==

            "By View"

        ){


            return "";


        }


        return `

            <div

                class="toolbar-pill toolbar-green"

                id="phoenix-view-pill"

            >


                <span class="toolbar-pill-label">

                    View

                </span>


                <select

                    id="phoenix-view"

                >

                    ${this.renderViewOptions(state)}

                </select>


            </div>

        `;


    }






    renderSupplierOptions(state){


        if(state.suppliersLoading){


            return `

                <option value="">

                    Loading suppliers...

                </option>

            `;


        }


        if(state.supplierLoadError){


            return `

                <option value="">

                    Unable to load suppliers

                </option>

            `;


        }


        if(

            !Array.isArray(

                state.suppliers

            )

            ||

            state.suppliers.length === 0

        ){


            return `

                <option value="">

                    No active suppliers found

                </option>

            `;


        }


        const options =

            state.suppliers

                .map(supplierName => {


                    const escapedSupplierName =

                        this.escapeHtml(

                            supplierName

                        );


                    const selected =

                        state.selectedSupplier ===

                        supplierName

                            ? "selected"

                            : "";


                    return `

                        <option

                            value="${escapedSupplierName}"

                            ${selected}

                        >

                            ${escapedSupplierName}

                        </option>

                    `;


                })

                .join("");


        return `

            <option

                value=""

                ${state.selectedSupplier ? "" : "selected"}

            >

                Select Supplier

            </option>

            ${options}

        `;


    }






    renderSupplierSelector(state){


        if(

            state.opportunityMode !==

            "By Supplier"

        ){


            return "";


        }


        return `

            <div

                class="toolbar-pill toolbar-green"

                id="phoenix-supplier-pill"

            >


                <span class="toolbar-pill-label">

                    Supplier

                </span>


                <select

                    id="phoenix-supplier"

                    ${state.suppliersLoading ? "disabled" : ""}

                >

                    ${this.renderSupplierOptions(state)}

                </select>


            </div>

        `;


    }






    render(){


        if(!this.element){


            return;


        }


        const state =

            this.appState.getState();


        const process =

            state.process

            ||

            "Can We Sell";


        const opportunityMode =

            state.opportunityMode

            ||

            "By View";


        const rowsLimit =

            state.rowsLimit

            ||

            100;


        const safeProcess =

            this.escapeHtml(

                process

            );


        const viewSelector =

            this.renderViewSelector(

                state

            );


        const supplierSelector =

            this.renderSupplierSelector(

                state

            );


        this.element.innerHTML = `


<div class="phoenix-toolbar">


    <div class="phoenix-toolbar-top">


        <div class="toolbar-pill toolbar-green">


            <span class="toolbar-pill-label">

                Process

            </span>


            <select id="phoenix-process">


                <option value="${safeProcess}">

                    ${safeProcess}

                </option>


            </select>


        </div>


        <div class="toolbar-pill toolbar-green">


            <span class="toolbar-pill-label">

                Opportunities

            </span>


            <select id="phoenix-opportunity-mode">


                <option

                    value="By View"

                    ${opportunityMode === "By View" ? "selected" : ""}

                >

                    By View

                </option>


                <option

                    value="By Supplier"

                    ${opportunityMode === "By Supplier" ? "selected" : ""}

                >

                    By Supplier

                </option>


            </select>


        </div>


        ${viewSelector}


        ${supplierSelector}


        <div

            id="phoenix-filter-host"

            class="phoenix-inline-filter-host"

            style="display:contents;"

        ></div>


        <button

            id="phoenix-load-dashboard"

            class="toolbar-button blue"

        >

            Load Dashboard

        </button>


    </div>


    <div class="phoenix-toolbar-bottom">


        <div class="toolbar-pill toolbar-green">


            <span class="toolbar-pill-label">

                Load Rows

            </span>


            <select id="phoenix-row-limit">


                <option

                    value="100"

                    ${rowsLimit === 100 ? "selected" : ""}

                >

                    100

                </option>


                <option

                    value="250"

                    ${rowsLimit === 250 ? "selected" : ""}

                >

                    250

                </option>


                <option

                    value="500"

                    ${rowsLimit === 500 ? "selected" : ""}

                >

                    500

                </option>


                <option

                    value="1000"

                    ${rowsLimit === 1000 ? "selected" : ""}

                >

                    1000

                </option>


            </select>


        </div>


        <button class="toolbar-button orange">

            ⚠ Open Hazmat Check

        </button>


        <button class="toolbar-button blue">

            ↗ View Opportunities

        </button>


        <button class="toolbar-button green">

            🔍 Search Master Price File

        </button>


        <button

            id="phoenix-tools"

            class="toolbar-button tools"

        >

            ⚙ Tools ▼

        </button>


    </div>


</div>


`;


    }






    renderAndBind(){


        this.render();


        this.bind();


        this.notifyToolbarRendered();


    }






    async ensureSuppliersLoaded(){


        const state =

            this.appState.getState();


        if(

            state.suppliersLoaded

            &&

            Array.isArray(

                state.suppliers

            )

        ){


            return state.suppliers;


        }


        if(this.supplierLoadPromise){


            return this.supplierLoadPromise;


        }


        if(!this.supplierRepository){


            const errorMessage =

                "Supplier repository is not available";


            this.appState.update({

                suppliers:

                    [],


                suppliersLoading:

                    false,


                suppliersLoaded:

                    false,


                supplierLoadError:

                    errorMessage

            });


            this.renderAndBind();


            return [];


        }


        this.appState.update({

            suppliersLoading:

                true,


            supplierLoadError:

                ""

        });


        this.renderAndBind();


        this.supplierLoadPromise =

            this.supplierRepository

                .getActiveSuppliers()

                .then(suppliers => {


                    const currentState =

                        this.appState.getState();


                    const selectedSupplierStillExists =

                        suppliers.includes(

                            currentState.selectedSupplier

                        );


                    this.appState.update({

                        suppliers:

                            suppliers,


                        selectedSupplier:

                            selectedSupplierStillExists

                                ? currentState.selectedSupplier

                                : "",


                        suppliersLoading:

                            false,


                        suppliersLoaded:

                            true,


                        supplierLoadError:

                            ""

                    });


                    this.renderAndBind();


                    return suppliers;


                })

                .catch(error => {


                    console.error(

                        "[PHX SUPPLIERS] Failed to load active suppliers",

                        error

                    );


                    this.appState.update({

                        suppliers:

                            [],


                        selectedSupplier:

                            "",


                        suppliersLoading:

                            false,


                        suppliersLoaded:

                            false,


                        supplierLoadError:

                            error?.message

                            ||

                            "Unable to load suppliers"

                    });


                    this.renderAndBind();


                    return [];


                })

                .finally(() => {


                    this.supplierLoadPromise =

                        null;


                });


        return this.supplierLoadPromise;


    }






    bind(){


        if(!this.element){


            return;


        }


        const loadButton =

            this.element.querySelector(

                "#phoenix-load-dashboard"

            );


        if(loadButton){


            loadButton.onclick = () => {


                document.dispatchEvent(

                    new CustomEvent(

                        "phoenix-load-dashboard"

                    )

                );


            };


        }


        const rowsSelect =

            this.element.querySelector(

                "#phoenix-row-limit"

            );


        if(rowsSelect){


            rowsSelect.onchange = event => {


                this.appState.update({

                    rowsLimit:

                        Number(

                            event.target.value

                        )

                });


            };


        }


        const processSelect =

            this.element.querySelector(

                "#phoenix-process"

            );


        if(processSelect){


            processSelect.onchange = event => {


                this.appState.update({

                    process:

                        event.target.value

                });


            };


        }


        const opportunitySelect =

            this.element.querySelector(

                "#phoenix-opportunity-mode"

            );


        if(opportunitySelect){


            opportunitySelect.onchange = event => {


                const opportunityMode =

                    event.target.value;


                if(

                    opportunityMode ===

                    "By Supplier"

                ){


                    this.appState.update({

                        opportunityMode:

                            "By Supplier",


                        opportunityView:

                            "",


                        viewFilterType:

                            "",


                        viewFilterValue:

                            "",


                        viewFilterValues:

                            [],


                        viewDateValue:

                            "",


                        attributeSelectionType:

                            "",


                        attributeTopCount:

                            10,


                        attributeOptions:

                            [],


                        selectedAttributeValues:

                            [],


                        selectedCategory:

                            "",


                        selectedSubCategory:

                            "",


                        gridLoaded:

                            false,


                        totalOpportunities:

                            0

                    });


                    this.renderAndBind();


                    this.ensureSuppliersLoaded();


                    return;


                }


                this.appState.update({

                    opportunityMode:

                        "By View",


                    selectedSupplier:

                        "",


                    viewFilterType:

                        "",


                    viewFilterValue:

                        "",


                    viewFilterValues:

                        [],


                    viewDateValue:

                        "",


                    attributeSelectionType:

                        "",


                    attributeTopCount:

                        10,


                    attributeOptions:

                        [],


                    selectedAttributeValues:

                        [],


                    selectedCategory:

                        "",


                    selectedSubCategory:

                        "",


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


                this.renderAndBind();


            };


        }


        const viewSelect =

            this.element.querySelector(

                "#phoenix-view"

            );


        if(viewSelect){


            viewSelect.onchange = event => {


                this.appState.update({

                    opportunityView:

                        event.target.value,


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


                    attributeSelectionType:

                        "",


                    attributeTopCount:

                        10,


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


                    selectedCategory:

                        "",


                    selectedSubCategory:

                        "",


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


                this.renderAndBind();


            };


        }


        const supplierSelect =

            this.element.querySelector(

                "#phoenix-supplier"

            );


        if(supplierSelect){


            supplierSelect.onchange = event => {


                this.appState.update({

                    selectedSupplier:

                        event.target.value,


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


            };


        }


    }


}