import { MultiSelectFilter }
    from "../components/MultiSelectFilter.js";


export class AttributeFilterController {


    constructor(

        appState,

        attributeService

    ){


        this.appState =

            appState;


        this.attributeService =

            attributeService;


        this.container =

            null;


        this.pickerHost =

            null;


        this.multiSelectFilter =

            new MultiSelectFilter();


        this.unsubscribe =

            null;


        this.requestVersion =

            0;


        this.activeRequestKey =

            "";


        this.lastRenderKey =

            "";


        this.lastOpenedKey =

            "";


        /*
            Prevents the picker from reopening whenever
            unrelated AppState values change.

            It becomes false when the user changes the
            filter type, Top count, or clicks the
            selection-count button.

            It becomes true when Done or Cancel is pressed.
        */


        this.pickerDismissed =

            false;


    }






    mount(container){


        if(!container){


            return;


        }


        this.container =

            container;


        this.ensurePickerHost();


        if(this.unsubscribe){


            this.unsubscribe();


        }


        this.unsubscribe =

            this.appState.subscribe(

                () => {


                    this.refresh();


                }

            );


        this.lastRenderKey =

            "";


        this.refresh();


    }






    destroy(){


        if(this.unsubscribe){


            this.unsubscribe();


            this.unsubscribe =

                null;


        }


        this.requestVersion += 1;


        this.activeRequestKey =

            "";


        this.lastRenderKey =

            "";


        this.lastOpenedKey =

            "";


        this.pickerDismissed =

            true;


        this.closePicker();


        if(this.container){


            this.container.innerHTML =

                "";


        }


        this.container =

            null;


    }






    ensurePickerHost(){


        let pickerHost =

            document.getElementById(

                "phoenix-attribute-picker-host"

            );


        if(!pickerHost){


            pickerHost =

                document.createElement(

                    "div"

                );


            pickerHost.id =

                "phoenix-attribute-picker-host";


            pickerHost.style.position =

                "fixed";


            pickerHost.style.inset =

                "0";


            pickerHost.style.zIndex =

                "10000";


            pickerHost.style.display =

                "none";


            pickerHost.style.alignItems =

                "center";


            pickerHost.style.justifyContent =

                "center";


            pickerHost.style.padding =

                "24px";


            pickerHost.style.background =

                "rgba(15, 23, 42, 0.45)";


            document.body.appendChild(

                pickerHost

            );


        }


        this.pickerHost =

            pickerHost;


    }






    getConfiguration(view){


        switch(view){


            case "By Brand":


                return {

                    field:

                        "brand",


                    label:

                        "Brand"

                };


            case "By Category":


                return {

                    field:

                        "categories_root",


                    label:

                        "Category"

                };


            case "By Sub Category":


                return {

                    field:

                        "sub_category",


                    label:

                        "Sub Category"

                };


            default:


                return null;


        }


    }






    ownsView(view){


        return Boolean(

            this.getConfiguration(

                view

            )

        );


    }






    isTopSelectionType(value){


        return value ===

            "top_opportunities"

            ||

            value ===

            "top_bought";


    }






    normaliseTopCount(value){


        const parsed =

            Number(

                value

            );


        const allowedValues =

            [

                10,

                25,

                50,

                100

            ];


        return allowedValues.includes(

            parsed

        )

            ? parsed

            : 10;


    }






    normaliseSelectedValues(values){


        if(!Array.isArray(values)){


            return [];


        }


        const seen =

            new Set();


        const results =

            [];


        for(

            const source of values

        ){


            const value =

                String(

                    source

                    ??

                    ""

                ).trim();


            if(!value){


                continue;


            }


            const key =

                value.toLocaleLowerCase();


            if(seen.has(key)){


                continue;


            }


            seen.add(key);


            results.push(

                value

            );


        }


        return results;


    }






    buildRequestKey(

        configuration,

        state

    ){


        return [

            configuration.field,

            String(

                state.attributeSelectionType

                ??

                ""

            ),

            this.normaliseTopCount(

                state.attributeTopCount

            )

        ].join(":");


    }






    async refresh(){


        if(!this.container){


            return;


        }


        const state =

            this.appState.getState();


        const opportunityView =

            String(

                state.opportunityView

                ??

                ""

            ).trim();


        if(

            state.opportunityMode !==

                "By View"

            ||

            !this.ownsView(

                opportunityView

            )

        ){


            this.clearInlineControls();


            this.closePicker();


            return;


        }


        const configuration =

            this.getConfiguration(

                opportunityView

            );


        this.renderControls(

            configuration,

            state

        );


        const selectionType =

            String(

                state.attributeSelectionType

                ??

                ""

            ).trim();


        if(!selectionType){


            this.closePicker();


            return;


        }


        /*
            A failed request must not automatically retry.
        */


        if(

            String(

                state.attributeOptionsError

                ??

                ""

            ).trim()

        ){


            this.closePicker();


            return;


        }


        if(state.attributeOptionsLoading){


            return;


        }


        /*
            Options have already loaded.

            Only open automatically when the picker has not
            already been dismissed by Done or Cancel.

            Dashboard state changes must not reopen it.
        */


        if(

            state.attributeOptionsLoaded

            &&

            Array.isArray(

                state.attributeOptions

            )

        ){


            const dashboardBusy =

                state.dashboardStatus ===

                    "Loading"

                ||

                state.dashboardStatus ===

                    "Rendering";


            if(

                !this.pickerDismissed

                &&

                !dashboardBusy

            ){


                this.openPickerFromState(

                    configuration,

                    state

                );


            }


            return;


        }


        await this.loadOptions(

            configuration,

            state

        );


    }






    renderControls(

        configuration,

        state

    ){


        if(!this.container){


            return;


        }


        const selectionType =

            String(

                state.attributeSelectionType

                ??

                ""

            );


        const topCount =

            this.normaliseTopCount(

                state.attributeTopCount

            );


        const showTopSelector =

            this.isTopSelectionType(

                selectionType

            );


        const loading =

            state.attributeOptionsLoading ===

            true;


        const errorMessage =

            String(

                state.attributeOptionsError

                ??

                ""

            ).trim();


        const selectedValues =

            this.normaliseSelectedValues(

                state.selectedAttributeValues

            );


        const selectedCount =

            selectedValues.length;


        const optionsReady =

            state.attributeOptionsLoaded ===

                true

            &&

            Array.isArray(

                state.attributeOptions

            );


        const canOpenSelections =

            Boolean(

                selectionType

                &&

                optionsReady

                &&

                !loading

                &&

                !errorMessage

            );


        const renderKey =

            [

                configuration.field,

                selectionType,

                showTopSelector

                    ? topCount

                    : "no-top",

                loading

                    ? "loading"

                    : "idle",

                errorMessage,

                selectedCount,

                optionsReady

                    ? "options-ready"

                    : "options-not-ready"

            ].join(":");


        if(

            this.lastRenderKey ===

            renderKey

        ){


            return;


        }


        const topSelectorHtml =

            showTopSelector

                ? `

                    <div

                        class="toolbar-pill toolbar-green"

                        id="phoenix-attribute-top-pill"

                    >


                        <span class="toolbar-pill-label">

                            Top

                        </span>


                        <select

                            id="phoenix-attribute-top-count"

                            ${loading ? "disabled" : ""}

                        >


                            <option
                                value="10"
                                ${topCount === 10 ? "selected" : ""}
                            >
                                Top 10
                            </option>


                            <option
                                value="25"
                                ${topCount === 25 ? "selected" : ""}
                            >
                                Top 25
                            </option>


                            <option
                                value="50"
                                ${topCount === 50 ? "selected" : ""}
                            >
                                Top 50
                            </option>


                            <option
                                value="100"
                                ${topCount === 100 ? "selected" : ""}
                            >
                                Top 100
                            </option>


                        </select>


                    </div>

                `

                : "";


        const selectedCountHtml =

            selectionType

                ? `

                    <button

                        type="button"

                        id="phoenix-attribute-selected-count"

                        class="toolbar-button green"

                        ${canOpenSelections ? "" : "disabled"}

                    >

                        ${selectedCount} selected

                    </button>

                `

                : "";


        const loadingHtml =

            loading

                ? `

                    <div

                        class="toolbar-pill toolbar-green"

                        id="phoenix-attribute-loading-pill"

                    >

                        <span class="toolbar-pill-label">

                            Loading

                        </span>


                        <span>

                            ${this.escapeHtml(configuration.label)} values...

                        </span>

                    </div>

                `

                : "";


        const errorHtml =

            errorMessage

                ? `

                    <div

                        class="toolbar-pill toolbar-green"

                        id="phoenix-attribute-error-pill"

                    >

                        <span class="toolbar-pill-label">

                            Error

                        </span>


                        <button

                            type="button"

                            id="phoenix-attribute-retry"

                            class="toolbar-button blue"

                        >

                            Retry

                        </button>

                    </div>

                `

                : "";


        this.container.innerHTML = `

            <div

                class="phoenix-filter-row"

                style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    flex-wrap:nowrap;
                "

            >


                <div

                    class="toolbar-pill toolbar-green"

                    id="phoenix-attribute-type-pill"

                >


                    <span class="toolbar-pill-label">

                        ${this.escapeHtml(configuration.label)}

                    </span>


                    <select

                        id="phoenix-attribute-selection-type"

                        ${loading ? "disabled" : ""}

                    >


                        <option
                            value=""
                            ${selectionType === "" ? "selected" : ""}
                        >
                            Select Type
                        </option>


                        <option
                            value="alphabetical"
                            ${selectionType === "alphabetical" ? "selected" : ""}
                        >
                            Alphabetical
                        </option>


                        <option
                            value="top_opportunities"
                            ${selectionType === "top_opportunities" ? "selected" : ""}
                        >
                            Top Opportunities
                        </option>


                        <option
                            value="top_bought"
                            ${selectionType === "top_bought" ? "selected" : ""}
                        >
                            Top Bought
                        </option>


                    </select>


                </div>


                ${topSelectorHtml}


                ${selectedCountHtml}


                ${loadingHtml}


                ${errorHtml}


            </div>

        `;


        this.lastRenderKey =

            renderKey;


        this.bindControls(

            configuration

        );


    }






    bindControls(configuration){


        if(!this.container){


            return;


        }


        const typeSelect =

            this.container.querySelector(

                "#phoenix-attribute-selection-type"

            );


        if(typeSelect){


            typeSelect.onchange = event => {


                const selectionType =

                    String(

                        event.target.value

                        ??

                        ""

                    );


                this.requestVersion += 1;


                this.activeRequestKey =

                    "";


                this.lastOpenedKey =

                    "";


                this.pickerDismissed =

                    false;


                this.closePicker();


                this.appState.update({

                    viewFilterType:

                        configuration.field,


                    viewFilterLabel:

                        configuration.label,


                    viewFilterValue:

                        "",


                    viewFilterValues:

                        [],


                    attributeSelectionType:

                        selectionType,


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


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


            };


        }


        const topCountSelect =

            this.container.querySelector(

                "#phoenix-attribute-top-count"

            );


        if(topCountSelect){


            topCountSelect.onchange = event => {


                const topCount =

                    this.normaliseTopCount(

                        event.target.value

                    );


                this.requestVersion += 1;


                this.activeRequestKey =

                    "";


                this.lastOpenedKey =

                    "";


                this.pickerDismissed =

                    false;


                this.closePicker();


                this.appState.update({

                    viewFilterType:

                        configuration.field,


                    viewFilterLabel:

                        configuration.label,


                    viewFilterValue:

                        "",


                    viewFilterValues:

                        [],


                    attributeTopCount:

                        topCount,


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


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


            };


        }


        const selectedCountButton =

            this.container.querySelector(

                "#phoenix-attribute-selected-count"

            );


        if(selectedCountButton){


            selectedCountButton.onclick = () => {


                const state =

                    this.appState.getState();


                if(

                    state.attributeOptionsLoading

                    ||

                    !state.attributeOptionsLoaded

                    ||

                    !Array.isArray(

                        state.attributeOptions

                    )

                ){


                    return;


                }


                this.pickerDismissed =

                    false;


                this.lastOpenedKey =

                    "";


                this.openPickerFromState(

                    configuration,

                    state

                );


            };


        }


        const retryButton =

            this.container.querySelector(

                "#phoenix-attribute-retry"

            );


        if(retryButton){


            retryButton.onclick = () => {


                this.requestVersion += 1;


                this.activeRequestKey =

                    "";


                this.lastOpenedKey =

                    "";


                this.pickerDismissed =

                    false;


                this.closePicker();


                this.appState.update({

                    attributeOptions:

                        [],


                    attributeOptionsLoading:

                        false,


                    attributeOptionsLoaded:

                        false,


                    attributeOptionsError:

                        ""

                });


            };


        }


    }






    async loadOptions(

        configuration,

        state

    ){


        if(!this.attributeService){


            this.appState.update({

                attributeOptions:

                    [],


                attributeOptionsLoading:

                    false,


                attributeOptionsLoaded:

                    false,


                attributeOptionsError:

                    "Attribute service is not available"

            });


            return;


        }


        const requestKey =

            this.buildRequestKey(

                configuration,

                state

            );


        if(

            this.activeRequestKey ===

            requestKey

        ){


            return;


        }


        this.activeRequestKey =

            requestKey;


        const requestVersion =

            ++this.requestVersion;


        const selectionType =

            String(

                state.attributeSelectionType

                ??

                ""

            );


        const topCount =

            this.normaliseTopCount(

                state.attributeTopCount

            );


        this.appState.update({

            viewFilterType:

                configuration.field,


            viewFilterLabel:

                configuration.label,


            attributeOptions:

                [],


            attributeOptionsLoading:

                true,


            attributeOptionsLoaded:

                false,


            attributeOptionsError:

                ""

        });


        try{


            console.count(

                "[PHX ATTRIBUTE LOAD CALL]"

            );


            const options =

                await this.attributeService.getOptions({

                    attribute:

                        configuration.field,


                    selectionType:

                        selectionType,


                    topCount:

                        topCount

                });


            if(

                requestVersion !==

                this.requestVersion

            ){


                return;


            }


            this.activeRequestKey =

                "";


            const normalisedOptions =

                Array.isArray(options)

                    ? options

                    : [];


            this.pickerDismissed =

                false;


            this.appState.update({

                attributeOptions:

                    normalisedOptions,


                attributeOptionsLoading:

                    false,


                attributeOptionsLoaded:

                    true,


                attributeOptionsError:

                    ""

            });


        }

        catch(error){


            if(

                requestVersion !==

                this.requestVersion

            ){


                return;


            }


            this.activeRequestKey =

                "";


            this.pickerDismissed =

                true;


            const errorMessage =

                error?.message

                ||

                `Unable to load ${configuration.label} values`;


            console.error(

                "[PHX ATTRIBUTE FILTER LOAD ERROR]",

                error

            );


            this.appState.update({

                attributeOptions:

                    [],


                attributeOptionsLoading:

                    false,


                attributeOptionsLoaded:

                    false,


                attributeOptionsError:

                    errorMessage

            });


        }


    }






    openPickerFromState(

        configuration,

        state

    ){


        if(

            !this.pickerHost

            ||

            !Array.isArray(

                state.attributeOptions

            )

        ){


            return;


        }


        if(

            state.attributeOptions.length ===

            0

        ){


            return;


        }


        const selectionType =

            String(

                state.attributeSelectionType

                ??

                ""

            );


        const topCount =

            this.normaliseTopCount(

                state.attributeTopCount

            );


        const openKey =

            [

                configuration.field,

                selectionType,

                topCount,

                state.attributeOptions.length

            ].join(":");


        if(

            this.lastOpenedKey ===

            openKey

            &&

            this.pickerHost.style.display ===

                "flex"

        ){


            return;


        }


        this.lastOpenedKey =

            openKey;


        this.pickerHost.style.display =

            "flex";


        this.pickerHost.innerHTML = `

            <div

                id="phoenix-attribute-picker-panel"

                style="
                    width:min(720px, 95vw);
                    max-height:85vh;
                    overflow:auto;
                    background:#ffffff;
                    border-radius:14px;
                    padding:18px;
                    box-shadow:0 24px 70px rgba(15,23,42,0.30);
                "

            ></div>

        `;


        const panel =

            this.pickerHost.querySelector(

                "#phoenix-attribute-picker-panel"

            );


        if(!panel){


            this.closePicker();


            return;


        }


        this.multiSelectFilter.mount(

            panel

        );


        this.multiSelectFilter.render({

            title:

                configuration.label,


            options:

                state.attributeOptions,


            selectedValues:

                this.normaliseSelectedValues(

                    state.selectedAttributeValues

                ),


            onDone:

                values => {


                    const selectedValues =

                        this.normaliseSelectedValues(

                            values

                        );


                    this.lastOpenedKey =

                        openKey;


                    this.pickerDismissed =

                        true;


                    this.closePicker();


                    this.appState.update({

                        viewFilterType:

                            configuration.field,


                        viewFilterLabel:

                            configuration.label,


                        viewFilterValue:

                            "",


                        viewFilterValues:

                            selectedValues,


                        selectedAttributeValues:

                            selectedValues,


                        gridLoaded:

                            false,


                        totalOpportunities:

                            0

                    });


                },


            onCancel:

                () => {


                    this.pickerDismissed =

                        true;


                    this.closePicker();


                }

        });


    }






    closePicker(){


        if(!this.pickerHost){


            return;


        }


        this.pickerHost.style.display =

            "none";


        this.pickerHost.innerHTML =

            "";


    }






    clearInlineControls(){


        this.requestVersion += 1;


        this.activeRequestKey =

            "";


        this.lastRenderKey =

            "";


        this.lastOpenedKey =

            "";


        this.pickerDismissed =

            true;


        if(this.container){


            this.container.innerHTML =

                "";


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