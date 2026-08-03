import { SingleSelectFilter }
    from "../components/SingleSelectFilter.js";


import { AttributeFilterController }
    from "./AttributeFilterController.js";


export class FilterController {


    constructor(

        appState,

        viewFilterService,

        attributeService

    ){


        this.appState =

            appState;


        this.viewFilterService =

            viewFilterService;


        this.attributeService =

            attributeService;


        this.container =

            null;


        this.unsubscribe =

            null;


        this.singleSelectFilter =

            new SingleSelectFilter();


        this.attributeFilterController =

            new AttributeFilterController(

                appState,

                attributeService

            );


        this.attributeControllerMounted =

            false;


        this.refreshVersion =

            0;


        this.lastRenderedKey =

            "";


    }






    mount(container){


        if(!container){


            return;


        }


        if(

            this.container !==

            container

        ){


            this.unmountAttributeController();


        }


        this.container =

            container;


        this.singleSelectFilter.mount(

            container

        );


        if(this.unsubscribe){


            this.unsubscribe();


        }


        this.unsubscribe =

            this.appState.subscribe(

                () => {


                    this.refresh();


                }

            );


        this.lastRenderedKey =

            "";


        this.refresh();


    }






    destroy(){


        if(this.unsubscribe){


            this.unsubscribe();


            this.unsubscribe =

                null;


        }


        this.refreshVersion += 1;


        this.unmountAttributeController();


        this.lastRenderedKey =

            "";


        if(this.container){


            this.container.innerHTML =

                "";


        }


        this.container =

            null;


    }






    clear(){


        this.refreshVersion += 1;


        this.unmountAttributeController();


        this.lastRenderedKey =

            "";


        if(this.container){


            this.container.innerHTML =

                "";


        }


    }






    isAttributeView(view){


        return [

            "By Brand",

            "By Category",

            "By Sub Category"

        ].includes(

            view

        );


    }






    isLookupView(view){


        return [

            "By Assigned To",

            "By Status Tracker"

        ].includes(

            view

        );


    }






    isDateView(view){


        return [

            "By Date Created",

            "By Date Updated"

        ].includes(

            view

        );


    }






    mountAttributeController(){


        if(

            !this.container

            ||

            this.attributeControllerMounted

        ){


            return;


        }


        this.attributeFilterController.mount(

            this.container

        );


        this.attributeControllerMounted =

            true;


    }






    unmountAttributeController(){


        if(!this.attributeControllerMounted){


            return;


        }


        this.attributeFilterController.destroy();


        this.attributeControllerMounted =

            false;


    }






    async refresh(){


        if(!this.container){


            return;


        }


        const state =

            this.appState.getState();


        if(

            state.opportunityMode !==

            "By View"

        ){


            this.clear();


            return;


        }


        const opportunityView =

            String(

                state.opportunityView

                ??

                ""

            ).trim();


        if(!opportunityView){


            this.clear();


            return;


        }


        if(

            this.isAttributeView(

                opportunityView

            )

        ){


            this.lastRenderedKey =

                "";


            this.mountAttributeController();


            return;


        }


        this.unmountAttributeController();


        const refreshVersion =

            ++this.refreshVersion;


        if(

            this.isLookupView(

                opportunityView

            )

        ){


            await this.loadLookup(

                {

                    view:

                        opportunityView,


                    field:

                        opportunityView ===

                            "By Assigned To"

                            ? "assigned_to"

                            : "status",


                    label:

                        opportunityView ===

                            "By Assigned To"

                            ? "Assigned To"

                            : "Status",


                    refreshVersion:

                        refreshVersion

                }

            );


            return;


        }


        if(

            this.isDateView(

                opportunityView

            )

        ){


            this.renderDateFilter(

                {

                    view:

                        opportunityView,


                    field:

                        opportunityView ===

                            "By Date Created"

                            ? "created_at"

                            : "updated_at",


                    label:

                        opportunityView ===

                            "By Date Created"

                            ? "Date Created"

                            : "Date Updated"

                }

            );


            return;


        }


        this.clear();


    }






    async loadLookup({

        view,

        field,

        label,

        refreshVersion

    }){


        if(!this.container){


            return;


        }


        const renderKey =

            `lookup:${view}`;


        if(

            this.lastRenderedKey !==

            renderKey

        ){


            this.container.innerHTML = `

                <div

                    class="toolbar-pill toolbar-green"

                >

                    <span class="toolbar-pill-label">

                        ${this.escapeHtml(label)}

                    </span>


                    <span>

                        Loading...

                    </span>

                </div>

            `;


            this.lastRenderedKey =

                renderKey;


        }


        try{


            if(

                !this.viewFilterService

                ||

                typeof this.viewFilterService.getOptions !==

                    "function"

            ){


                throw new Error(

                    "View filter service is not available"

                );


            }


            const options =

                await this.viewFilterService.getOptions(

                    view

                );


            if(

                refreshVersion !==

                this.refreshVersion

                ||

                !this.container

            ){


                return;


            }


            const selectedValue =

                String(

                    this.appState.get(

                        "viewFilterValue"

                    )

                    ??

                    ""

                );


            this.singleSelectFilter.mount(

                this.container

            );


            this.singleSelectFilter.render({

                label:

                    label,


                options:

                    Array.isArray(options)

                        ? options

                        : [],


                selectedValue:

                    selectedValue,


                placeholder:

                    `Select ${label}`,


                onChange:

                    value => {


                        const normalisedValue =

                            String(

                                value

                                ??

                                ""

                            );


                        const state =

                            this.appState.getState();


                        if(

                            state.viewFilterType ===

                                field

                            &&

                            String(

                                state.viewFilterValue

                                ??

                                ""

                            ) ===

                                normalisedValue

                        ){


                            return;


                        }


                        this.appState.update({

                            viewFilterType:

                                field,


                            viewFilterValue:

                                normalisedValue,


                            viewFilterValues:

                                normalisedValue

                                    ? [

                                        normalisedValue

                                    ]

                                    : [],


                            viewFilterLabel:

                                label,


                            viewFilterOptions:

                                Array.isArray(options)

                                    ? options

                                    : [],


                            viewFilterLoading:

                                false,


                            viewFilterLoaded:

                                true,


                            viewFilterError:

                                "",


                            gridLoaded:

                                false,


                            totalOpportunities:

                                0

                        });


                    }

            });


            this.lastRenderedKey =

                renderKey;


        }

        catch(error){


            if(

                refreshVersion !==

                this.refreshVersion

                ||

                !this.container

            ){


                return;


            }


            const errorMessage =

                error?.message

                ||

                `Unable to load ${label}`;


            console.error(

                "[PHX LOOKUP FILTER ERROR]",

                {

                    view:

                        view,


                    field:

                        field,


                    error:

                        error

                }

            );


            this.container.innerHTML = `

                <div

                    class="toolbar-pill toolbar-green"

                >

                    <span class="toolbar-pill-label">

                        ${this.escapeHtml(label)}

                    </span>


                    <span>

                        ${this.escapeHtml(errorMessage)}

                    </span>

                </div>

            `;


            this.lastRenderedKey =

                `lookup-error:${view}`;


        }


    }






    renderDateFilter({

        view,

        field,

        label

    }){


        if(!this.container){


            return;


        }


        const dateValue =

            String(

                this.appState.get(

                    "viewDateValue"

                )

                ??

                ""

            );


        const renderKey =

            `date:${view}:${dateValue}`;


        if(

            this.lastRenderedKey ===

            renderKey

        ){


            return;


        }


        this.container.innerHTML = `

            <div

                class="toolbar-pill toolbar-green"

                data-filter-field="${this.escapeHtml(field)}"

            >

                <span class="toolbar-pill-label">

                    ${this.escapeHtml(label)}

                </span>


                <input

                    id="phoenix-date-filter"

                    type="date"

                    value="${this.escapeHtml(dateValue)}"

                    aria-label="${this.escapeHtml(label)}"

                >

            </div>

        `;


        this.lastRenderedKey =

            renderKey;


        const dateInput =

            this.container.querySelector(

                "#phoenix-date-filter"

            );


        if(dateInput){


            dateInput.onchange = event => {


                const nextDateValue =

                    String(

                        event.target.value

                        ??

                        ""

                    );


                const state =

                    this.appState.getState();


                if(

                    state.viewFilterType ===

                        field

                    &&

                    String(

                        state.viewDateValue

                        ??

                        ""

                    ) ===

                        nextDateValue

                ){


                    return;


                }


                this.appState.update({

                    viewFilterType:

                        field,


                    viewFilterValue:

                        nextDateValue,


                    viewFilterValues:

                        nextDateValue

                            ? [

                                nextDateValue

                            ]

                            : [],


                    viewFilterLabel:

                        label,


                    viewDateValue:

                        nextDateValue,


                    viewFilterError:

                        "",


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


            };


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