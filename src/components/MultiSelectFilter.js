export class MultiSelectFilter {


    constructor(){


        this.container =

            null;


        this.title =

            "";


        this.options =

            [];


        this.selectedValues =

            new Set();


        this.originalSelectedValues =

            new Set();


        this.searchValue =

            "";


        this.onDone =

            null;


        this.onCancel =

            null;


        this.isOpen =

            false;


    }






    mount(container){


        this.container =

            container;


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseNumber(value){


        const parsed =

            Number(

                value

            );


        return Number.isFinite(parsed)

            ? parsed

            : 0;


    }






    normaliseOption(option){


        if(

            typeof option ===

            "string"

        ){


            return {

                value:

                    this.normaliseText(

                        option

                    ),


                opportunityCount:

                    0,


                boughtCount:

                    0

            };


        }


        const source =

            option

            &&

            typeof option ===

                "object"

                ? option

                : {};


        return {

            value:

                this.normaliseText(

                    source.value

                    ??

                    source.attribute_value

                    ??

                    source.name

                    ??

                    source.label

                ),


            opportunityCount:

                this.normaliseNumber(

                    source.opportunityCount

                    ??

                    source.opportunity_count

                    ??

                    source.opportunities

                    ??

                    source.opp_count

                ),


            boughtCount:

                this.normaliseNumber(

                    source.boughtCount

                    ??

                    source.bought_count

                    ??

                    source.bought

                    ??

                    source.bought_past_month

                )

        };


    }






    normaliseOptions(options){


        if(!Array.isArray(options)){


            return [];


        }


        const uniqueOptions =

            new Map();


        for(

            const source of options

        ){


            const option =

                this.normaliseOption(

                    source

                );


            if(!option.value){


                continue;


            }


            const key =

                option.value.toLocaleLowerCase();


            if(!uniqueOptions.has(key)){


                uniqueOptions.set(

                    key,

                    option

                );


            }


        }


        return [

            ...uniqueOptions.values()

        ];


    }






    render({

        title,

        options = [],

        selectedValues = [],

        onDone,

        onCancel

    } = {}){


        if(!this.container){


            return;


        }


        this.title =

            this.normaliseText(

                title

            )

            ||

            "Values";


        this.options =

            this.normaliseOptions(

                options

            );


        const initialSelection =

            Array.isArray(

                selectedValues

            )

                ? selectedValues

                    .map(value =>

                        this.normaliseText(

                            value

                        )

                    )

                    .filter(Boolean)

                : [];


        this.selectedValues =

            new Set(

                initialSelection

            );


        this.originalSelectedValues =

            new Set(

                initialSelection

            );


        this.searchValue =

            "";


        this.onDone =

            typeof onDone ===

                "function"

                ? onDone

                : null;


        this.onCancel =

            typeof onCancel ===

                "function"

                ? onCancel

                : null;


        this.isOpen =

            true;


        this.renderWindow();


    }






    renderWindow(){


        if(!this.container){


            return;


        }


        this.container.innerHTML = `

            <div

                class="phoenix-multi-select"

                id="phoenix-multi-select"

            >


                <div class="phoenix-multi-select-header">


                    <strong>

                        Select ${this.escapeHtml(this.title)}

                    </strong>


                    <span

                        id="phoenix-multi-select-count"

                    >

                        ${this.selectedValues.size} selected

                    </span>


                </div>


                <div class="phoenix-multi-select-search">


                    <input

                        id="phoenix-multi-select-search"

                        type="search"

                        placeholder="Search values..."

                        autocomplete="off"

                        value="${this.escapeHtml(this.searchValue)}"

                    >


                </div>


                <div

                    class="phoenix-multi-select-list"

                    id="phoenix-multi-select-list"

                >

                    ${this.buildOptionRows()}

                </div>


                <div class="phoenix-multi-select-footer">


                    <div class="phoenix-multi-select-footer-left">


                        <button

                            type="button"

                            id="phoenix-multi-select-all"

                            class="toolbar-button"

                        >

                            Select All

                        </button>


                        <button

                            type="button"

                            id="phoenix-multi-select-clear"

                            class="toolbar-button"

                        >

                            Clear

                        </button>


                    </div>


                    <div class="phoenix-multi-select-footer-right">


                        <button

                            type="button"

                            id="phoenix-multi-select-cancel"

                            class="toolbar-button"

                        >

                            Cancel

                        </button>


                        <button

                            type="button"

                            id="phoenix-multi-select-done"

                            class="toolbar-button blue"

                        >

                            Done

                        </button>


                    </div>


                </div>


            </div>

        `;


        this.bind();


    }






    getFilteredOptions(){


        const search =

            this.searchValue

                .toLocaleLowerCase();


        if(!search){


            return this.options;


        }


        return this.options.filter(

            option =>

                option.value

                    .toLocaleLowerCase()

                    .includes(search)

        );


    }






    buildOptionRows(){


        const options =

            this.getFilteredOptions();


        if(options.length === 0){


            return `

                <div class="phoenix-multi-select-empty">

                    No matching values found.

                </div>

            `;


        }


        return options

            .map(option => {


                const checked =

                    this.selectedValues.has(

                        option.value

                    )

                        ? "checked"

                        : "";


                const opportunityCount =

                    option.opportunityCount

                        .toLocaleString();


                const boughtCount =

                    option.boughtCount

                        .toLocaleString();


                return `

                    <label

                        class="phoenix-multi-select-option"

                    >


                        <input

                            type="checkbox"

                            class="phoenix-multi-select-checkbox"

                            value="${this.escapeHtml(option.value)}"

                            ${checked}

                        >


                        <span class="phoenix-multi-select-option-text">

                            ${this.escapeHtml(option.value)}

                            (${opportunityCount} opps | ${boughtCount} bought)

                        </span>


                    </label>

                `;


            })

            .join("");


    }






    bind(){


        if(!this.container){


            return;


        }


        const searchInput =

            this.container.querySelector(

                "#phoenix-multi-select-search"

            );


        if(searchInput){


            searchInput.oninput = event => {


                this.searchValue =

                    this.normaliseText(

                        event.target.value

                    );


                this.renderListOnly();


            };


        }


        const checkboxes =

            this.container.querySelectorAll(

                ".phoenix-multi-select-checkbox"

            );


        for(

            const checkbox of checkboxes

        ){


            checkbox.onchange = event => {


                const value =

                    this.normaliseText(

                        event.target.value

                    );


                if(event.target.checked){


                    this.selectedValues.add(

                        value

                    );


                }

                else {


                    this.selectedValues.delete(

                        value

                    );


                }


                this.updateSelectedCount();


            };


        }


        const selectAllButton =

            this.container.querySelector(

                "#phoenix-multi-select-all"

            );


        if(selectAllButton){


            selectAllButton.onclick = () => {


                const filteredOptions =

                    this.getFilteredOptions();


                for(

                    const option of filteredOptions

                ){


                    this.selectedValues.add(

                        option.value

                    );


                }


                this.renderListOnly();


            };


        }


        const clearButton =

            this.container.querySelector(

                "#phoenix-multi-select-clear"

            );


        if(clearButton){


            clearButton.onclick = () => {


                this.selectedValues.clear();


                this.renderListOnly();


            };


        }


        const cancelButton =

            this.container.querySelector(

                "#phoenix-multi-select-cancel"

            );


        if(cancelButton){


            cancelButton.onclick = () => {


                this.selectedValues =

                    new Set(

                        this.originalSelectedValues

                    );


                this.isOpen =

                    false;


                if(this.onCancel){


                    this.onCancel(

                        [

                            ...this.selectedValues

                        ]

                    );


                }


            };


        }


        const doneButton =

            this.container.querySelector(

                "#phoenix-multi-select-done"

            );


        if(doneButton){


            doneButton.onclick = () => {


                const selectedValues =

                    [

                        ...this.selectedValues

                    ];


                this.originalSelectedValues =

                    new Set(

                        selectedValues

                    );


                this.isOpen =

                    false;


                if(this.onDone){


                    this.onDone(

                        selectedValues

                    );


                }


            };


        }


    }






    renderListOnly(){


        if(!this.container){


            return;


        }


        const list =

            this.container.querySelector(

                "#phoenix-multi-select-list"

            );


        if(!list){


            return;


        }


        list.innerHTML =

            this.buildOptionRows();


        const checkboxes =

            list.querySelectorAll(

                ".phoenix-multi-select-checkbox"

            );


        for(

            const checkbox of checkboxes

        ){


            checkbox.onchange = event => {


                const value =

                    this.normaliseText(

                        event.target.value

                    );


                if(event.target.checked){


                    this.selectedValues.add(

                        value

                    );


                }

                else {


                    this.selectedValues.delete(

                        value

                    );


                }


                this.updateSelectedCount();


            };


        }


        this.updateSelectedCount();


    }






    updateSelectedCount(){


        if(!this.container){


            return;


        }


        const countElement =

            this.container.querySelector(

                "#phoenix-multi-select-count"

            );


        if(countElement){


            countElement.textContent =

                `${this.selectedValues.size} selected`;


        }


    }






    close(){


        this.isOpen =

            false;


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
