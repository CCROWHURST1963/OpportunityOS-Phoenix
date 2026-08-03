import { ColumnRegistry }
    from "../services/ColumnRegistry.js";


import { EDITABLE_COLUMNS }
    from "../config/EditableColumns.js";



export class GridRenderer {


    constructor(

        appState,

        statusTrackerService,

        amazonPackInfoService

    ){


        this.container = null;


        this.appState = appState;


        this.statusTrackerService =
            statusTrackerService;


        this.amazonPackInfoService =
            amazonPackInfoService;


        this.columnRegistry =
            new ColumnRegistry();


        this.renderedRows = [];


        this.activeCommentContext = null;


        this.commentModal = null;


        this.commentKeydownHandler = null;


        /*
            Tracker field aliases.

            Saved custom views may still contain legacy
            leading-underscore field names.
        */


        this.trackerFieldAliases = {


            override:
                "override",


            _override:
                "override",


            override_status:
                "override",


            _override_status:
                "override",


            tracker_override:
                "override",


            status_tracker_override:
                "override",





            eligible_to_sell:
                "eligible_to_sell",


            _eligible_to_sell:
                "eligible_to_sell",


            tracker_eligible_to_sell:
                "eligible_to_sell",


            status_tracker_eligible_to_sell:
                "eligible_to_sell",





            product_type:
                "product_type",


            _product_type:
                "product_type",


            tracker_product_type:
                "product_type",


            status_tracker_product_type:
                "product_type",





            hazmat_status:
                "hazmat_status",


            _hazmat_status:
                "hazmat_status",


            tracker_hazmat_status:
                "hazmat_status",


            status_tracker_hazmat_status:
                "hazmat_status",





            ungate_qty:
                "ungate_qty",


            _ungate_qty:
                "ungate_qty",


            tracker_ungate_qty:
                "ungate_qty",


            status_tracker_ungate_qty:
                "ungate_qty",





            comment:
                "comment",


            _comment:
                "comment",


            tracker_comment:
                "comment",


            status_tracker_comment:
                "comment"


        };


        this.trackerRowValueAliases = {


            override:[

                "override",

                "_override",

                "tracker_override",

                "status_tracker_override"

            ],


            eligible_to_sell:[

                "eligible_to_sell",

                "_eligible_to_sell",

                "tracker_eligible_to_sell",

                "status_tracker_eligible_to_sell"

            ],


            product_type:[

                "product_type",

                "_product_type",

                "tracker_product_type",

                "status_tracker_product_type"

            ],


            hazmat_status:[

                "hazmat_status",

                "_hazmat_status",

                "tracker_hazmat_status",

                "status_tracker_hazmat_status"

            ],


            ungate_qty:[

                "ungate_qty",

                "_ungate_qty",

                "tracker_ungate_qty",

                "status_tracker_ungate_qty"

            ],


            comment:[

                "comment",

                "_comment",

                "tracker_comment",

                "status_tracker_comment"

            ]


        };


        /*
            amazonpackinfo fields.
        */


        this.packInfoFieldAliases = {


            pack_size:
                "pack_size",


            _pack_size:
                "pack_size",


            amazonpackinfo_pack_size:
                "pack_size",


            manual_pack_size:
                "pack_size",





            buy_qty:
                "buy_qty",


            _buy_qty:
                "buy_qty",


            amazonpackinfo_buy_qty:
                "buy_qty"


        };


        this.packInfoRowValueAliases = {


            pack_size:[

                "pack_size",

                "_pack_size",

                "amazonpackinfo_pack_size",

                "manual_pack_size"

            ],


            buy_qty:[

                "buy_qty",

                "_buy_qty",

                "amazonpackinfo_buy_qty"

            ]


        };


    }






    createSelectionColumn(){


        return {

            field:
                "_selected",


            label:
                "",


            width:
                50,


            system:
                true

        };


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseNonNegativeInteger(value){


        if(

            value === ""

            ||

            value === null

            ||

            value === undefined

        ){


            return "";


        }


        const parsed =
            Number(value);


        if(!Number.isFinite(parsed)){


            return "";


        }


        return String(

            Math.max(

                0,

                Math.floor(parsed)

            )

        );


    }






    normalisePositiveInteger(value){


        if(

            value === ""

            ||

            value === null

            ||

            value === undefined

        ){


            return "";


        }


        const parsed =
            Number(value);


        if(

            !Number.isFinite(parsed)

            ||

            parsed <= 0

        ){


            return "";


        }


        return String(

            Math.max(

                1,

                Math.round(parsed)

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






    escapeAttribute(value){


        return this.escapeHtml(value);


    }






    normaliseOptions(values){


        if(!Array.isArray(values)){


            return [];


        }


        const seen =
            new Set();


        const result =
            [];


        for(const source of values){


            const value =
                this.normaliseText(source);


            if(!value){


                continue;


            }


            const key =
                value.toLocaleLowerCase();


            if(seen.has(key)){


                continue;


            }


            seen.add(key);


            result.push(value);


        }


        return result;


    }






    isEditable(field){


        return EDITABLE_COLUMNS.includes(field);


    }






    getColumnStyle(column){


        if(

            !column

            ||

            !column.width

        ){


            return "";


        }


        return `

            width:${column.width}px;

            min-width:${column.width}px;

            max-width:${column.width}px;

            flex:0 0 ${column.width}px;

            box-sizing:border-box;

        `;


    }






    getRowAsin(row){


        return this.normaliseText(

            row?.asin

            ??

            row?.matched_asin

            ??

            row?.ASIN

        ).toUpperCase();


    }






    getRowLocale(row){


        return (

            this.normaliseText(

                row?.locale

                ??

                row?.matched_locale

                ??

                "co.uk"

            ).toLowerCase()

            ||

            "co.uk"

        );


    }






    getCanonicalTrackerField(field){


        const resolvedField =
            this.normaliseText(field);


        return (

            this.trackerFieldAliases[resolvedField]

            ||

            ""

        );


    }






    isTrackerDropdownField(field){


        const canonicalField =
            this.getCanonicalTrackerField(field);


        return [

            "override",

            "eligible_to_sell",

            "product_type",

            "hazmat_status"

        ].includes(canonicalField);


    }






    isUngateQtyField(field){


        return (

            this.getCanonicalTrackerField(field)

            ===

            "ungate_qty"

        );


    }






    isCommentField(field){


        return (

            this.getCanonicalTrackerField(field)

            ===

            "comment"

        );


    }






    getCanonicalPackInfoField(field){


        const resolvedField =
            this.normaliseText(field);


        return (

            this.packInfoFieldAliases[resolvedField]

            ||

            ""

        );


    }






    isPackInfoField(field){


        return Boolean(

            this.getCanonicalPackInfoField(field)

        );


    }






    getTrackerLookups(){


        const state =

            this.appState?.getState?.()

            ||

            {};


        const lookups =

            state.trackerLookups

            ||

            {};


        return {


            override:

                this.normaliseOptions(

                    lookups.override

                ),


            eligible_to_sell:

                this.normaliseOptions(

                    lookups.eligible_to_sell

                ),


            product_type:

                this.normaliseOptions(

                    lookups.product_type

                ),


            hazmat_status:

                this.normaliseOptions(

                    lookups.hazmat_status

                )


        };


    }






    getTrackerOptions(field){


        const canonicalField =
            this.getCanonicalTrackerField(field);


        if(!canonicalField){


            return [];


        }


        const lookups =
            this.getTrackerLookups();


        return (

            lookups[canonicalField]

            ||

            []

        );


    }






    getTrackerValue(

        field,

        row

    ){


        const canonicalField =
            this.getCanonicalTrackerField(field);


        if(!canonicalField){


            return "";


        }


        const aliases =

            this.trackerRowValueAliases[canonicalField]

            ||

            [

                canonicalField

            ];


        for(const alias of aliases){


            if(

                row?.[alias] !== undefined

                &&

                row?.[alias] !== null

            ){


                return this.normaliseText(

                    row[alias]

                );


            }


        }


        return "";


    }






    getPackInfoValue(

        field,

        row

    ){


        const canonicalField =
            this.getCanonicalPackInfoField(field);


        if(!canonicalField){


            return "";


        }


        const aliases =

            this.packInfoRowValueAliases[canonicalField]

            ||

            [

                canonicalField

            ];


        for(const alias of aliases){


            if(

                row?.[alias] !== undefined

                &&

                row?.[alias] !== null

            ){


                return this.normalisePositiveInteger(

                    row[alias]

                );


            }


        }


        return "";


    }






    buildTrackerSelect(

        column,

        row,

        rowIndex

    ){


        const canonicalField =
            this.getCanonicalTrackerField(

                column.field

            );


        const currentValue =
            this.getTrackerValue(

                column.field,

                row

            );


        const configuredOptions =
            this.getTrackerOptions(

                column.field

            );


        /*
            Preserve a stored value even when it is not
            present in the current lookup table.
        */


        const options =
            this.normaliseOptions([

                currentValue,

                ...configuredOptions

            ]);


        const optionHtml = [

            `

                <option

                    value=""

                    ${currentValue === "" ? "selected" : ""}

                >

                </option>

            `,

            ...options.map(option => `

                <option

                    value="${

                        this.escapeAttribute(option)

                    }"

                    ${

                        option === currentValue

                            ? "selected"

                            : ""

                    }

                >

                    ${

                        this.escapeHtml(option)

                    }

                </option>

            `)

        ].join("");


        return `

            <select

                class="phoenix-grid-select ${

                    currentValue

                        ? "has-value"

                        : "is-blank"

                }"

                data-tracker-select="true"

                data-row-index="${rowIndex}"

                data-field="${

                    this.escapeAttribute(

                        canonicalField

                    )

                }"

                data-original-value="${

                    this.escapeAttribute(

                        currentValue

                    )

                }"

                data-asin="${

                    this.escapeAttribute(

                        this.getRowAsin(row)

                    )

                }"

                data-locale="${

                    this.escapeAttribute(

                        this.getRowLocale(row)

                    )

                }"

            >

                ${optionHtml}

            </select>

        `;


    }






    buildUngateQtyInput(

        column,

        row,

        rowIndex

    ){


        const currentValue =
            this.normaliseNonNegativeInteger(

                this.getTrackerValue(

                    column.field,

                    row

                )

            );


        return `

            <input

                type="number"

                min="0"

                step="1"

                inputmode="numeric"

                class="
                    phoenix-grid-input
                    phoenix-tracker-input
                "

                value="${

                    this.escapeAttribute(

                        currentValue

                    )

                }"

                data-tracker-input="true"

                data-row-index="${rowIndex}"

                data-field="ungate_qty"

                data-original-value="${

                    this.escapeAttribute(

                        currentValue

                    )

                }"

                data-asin="${

                    this.escapeAttribute(

                        this.getRowAsin(row)

                    )

                }"

                data-locale="${

                    this.escapeAttribute(

                        this.getRowLocale(row)

                    )

                }"

            >

        `;


    }






    buildPackInfoInput(

        column,

        row,

        rowIndex

    ){


        const canonicalField =
            this.getCanonicalPackInfoField(

                column.field

            );


        const currentValue =
            this.getPackInfoValue(

                column.field,

                row

            );


        return `

            <input

                type="number"

                min="1"

                step="1"

                inputmode="numeric"

                class="
                    phoenix-grid-input
                    phoenix-pack-info-input
                "

                value="${

                    this.escapeAttribute(

                        currentValue

                    )

                }"

                data-pack-info-input="true"

                data-row-index="${rowIndex}"

                data-field="${

                    this.escapeAttribute(

                        canonicalField

                    )

                }"

                data-original-value="${

                    this.escapeAttribute(

                        currentValue

                    )

                }"

                data-asin="${

                    this.escapeAttribute(

                        this.getRowAsin(row)

                    )

                }"

                data-locale="${

                    this.escapeAttribute(

                        this.getRowLocale(row)

                    )

                }"

            >

        `;


    }






    buildCommentCell(

        column,

        row,

        rowIndex

    ){


        const comment =
            this.getTrackerValue(

                column.field,

                row

            );


        return `

            <div

                class="phoenix-comment-cell ${

                    comment

                        ? "has-comment"

                        : "is-empty"

                }"

                role="button"

                tabindex="0"

                data-comment-cell="true"

                data-row-index="${rowIndex}"

                data-field="comment"

                data-original-value="${

                    this.escapeAttribute(comment)

                }"

                data-asin="${

                    this.escapeAttribute(

                        this.getRowAsin(row)

                    )

                }"

                data-locale="${

                    this.escapeAttribute(

                        this.getRowLocale(row)

                    )

                }"

                title="${

                    this.escapeAttribute(

                        comment

                        ||

                        ""

                    )

                }"

            >

                ${

                    this.escapeHtml(

                        comment

                        ||

                        ""

                    )

                }

            </div>

        `;


    }






    buildEditableInput(

        column,

        row,

        value,

        rowIndex

    ){


        return `

            <input

                class="phoenix-grid-input"

                value="${

                    this.escapeAttribute(

                        value

                        ??

                        ""

                    )

                }"

                data-row-index="${rowIndex}"

                data-field="${

                    this.escapeAttribute(

                        column.field

                    )

                }"

                data-asin="${

                    this.escapeAttribute(

                        this.getRowAsin(row)

                    )

                }"

                data-locale="${

                    this.escapeAttribute(

                        this.getRowLocale(row)

                    )

                }"

            >

        `;


    }






    buildCellContent(

        column,

        row,

        rowIndex

    ){


        if(

            column.field ===

            "_selected"

        ){


            return `

                <input

                    type="checkbox"

                    class="phoenix-row-selector"

                    data-row-index="${rowIndex}"

                    data-asin="${

                        this.escapeAttribute(

                            this.getRowAsin(row)

                        )

                    }"

                >

            `;


        }


        if(

            this.isTrackerDropdownField(

                column.field

            )

        ){


            return this.buildTrackerSelect(

                column,

                row,

                rowIndex

            );


        }


        if(

            this.isUngateQtyField(

                column.field

            )

        ){


            return this.buildUngateQtyInput(

                column,

                row,

                rowIndex

            );


        }


        if(

            this.isCommentField(

                column.field

            )

        ){


            return this.buildCommentCell(

                column,

                row,

                rowIndex

            );


        }


        if(

            this.isPackInfoField(

                column.field

            )

        ){


            return this.buildPackInfoInput(

                column,

                row,

                rowIndex

            );


        }


        const value =
            this.columnRegistry.getValue(

                column.field,

                row

            );


        if(

            this.isEditable(

                column.field

            )

        ){


            return this.buildEditableInput(

                column,

                row,

                value,

                rowIndex

            );


        }


        return this.escapeHtml(

            value

            ??

            ""

        );


    }






    render(

        container,

        columns,

        rows = []

    ){


        this.container =
            container;


        this.renderedRows =

            Array.isArray(rows)

                ? rows

                : [];


        const configuredColumns =

            Array.isArray(columns)

                ? columns

                : [];


        const renderColumns = [

            this.createSelectionColumn(),

            ...configuredColumns

        ];


        container.innerHTML = `

            <div class="phoenix-grid">


                <div

                    class="
                        phoenix-grid-row
                        phoenix-grid-head
                    "

                >

                    ${

                        renderColumns.map(column => `

                            <div

                                class="
                                    phoenix-grid-cell
                                    phoenix-grid-header-cell
                                "

                                style="${

                                    this.getColumnStyle(

                                        column

                                    )

                                }"

                            >

                                ${

                                    column.field ===

                                    "_selected"

                                        ? `

                                            <input

                                                type="checkbox"

                                                class="phoenix-select-all"

                                            >

                                        `

                                        : this.escapeHtml(

                                            column.label

                                            ??

                                            column.header

                                            ??

                                            column.field

                                            ??

                                            ""

                                        )

                                }

                            </div>

                        `).join("")

                    }

                </div>


                ${

                    this.renderedRows.length === 0

                        ? `

                            <div class="phoenix-grid-empty">

                                No opportunities loaded

                            </div>

                        `

                        : this.renderedRows

                            .map((row, rowIndex) => `

                                <div

                                    class="phoenix-grid-row"

                                    data-row-index="${rowIndex}"

                                    data-asin="${

                                        this.escapeAttribute(

                                            this.getRowAsin(row)

                                        )

                                    }"

                                    data-locale="${

                                        this.escapeAttribute(

                                            this.getRowLocale(row)

                                        )

                                    }"

                                >

                                    ${

                                        renderColumns.map(column => `

                                            <div

                                                class="phoenix-grid-cell"

                                                style="${

                                                    this.getColumnStyle(

                                                        column

                                                    )

                                                }"

                                            >

                                                ${

                                                    this.buildCellContent(

                                                        column,

                                                        row,

                                                        rowIndex

                                                    )

                                                }

                                            </div>

                                        `).join("")

                                    }

                                </div>

                            `).join("")

                }

            </div>

        `;


        this.bindSelectionEvents();


        this.bindTrackerDropdownEvents();


        this.bindTrackerInputEvents();


        this.bindPackInfoInputEvents();


        this.bindCommentEvents();


    }






    bindSelectionEvents(){


        if(!this.container){


            return;


        }


        const selectAll =
            this.container.querySelector(

                ".phoenix-select-all"

            );


        if(!selectAll){


            return;


        }


        selectAll.onchange = () => {


            const selectors =
                this.container.querySelectorAll(

                    ".phoenix-row-selector"

                );


            for(const selector of selectors){


                selector.checked =
                    selectAll.checked;


            }


        };


    }






    bindTrackerDropdownEvents(){


        if(!this.container){


            return;


        }


        const selects =
            this.container.querySelectorAll(

                "[data-tracker-select='true']"

            );


        for(const select of selects){


            select.onchange = async event => {


                await this.handleTrackerSelectChange(

                    event.currentTarget

                );


            };


        }


    }






    bindTrackerInputEvents(){


        if(!this.container){


            return;


        }


        const inputs =
            this.container.querySelectorAll(

                "[data-tracker-input='true']"

            );


        for(const input of inputs){


            input.onchange = async event => {


                await this.handleTrackerInputChange(

                    event.currentTarget

                );


            };


        }


    }






    bindPackInfoInputEvents(){


        if(!this.container){


            return;


        }


        const inputs =
            this.container.querySelectorAll(

                "[data-pack-info-input='true']"

            );


        for(const input of inputs){


            input.onchange = async event => {


                await this.handlePackInfoInputChange(

                    event.currentTarget

                );


            };


        }


    }






    bindCommentEvents(){


        if(!this.container){


            return;


        }


        const cells =
            this.container.querySelectorAll(

                "[data-comment-cell='true']"

            );


        for(const cell of cells){


            cell.onclick = event => {


                event.preventDefault();


                event.stopPropagation();


                this.openCommentModal(

                    event.currentTarget

                );


            };


            cell.onkeydown = event => {


                this.handleCommentCellKeydown(

                    event

                );


            };


        }


    }






    getRowByControl(control){


        const rowIndex =
            Number(

                control?.dataset?.rowIndex

            );


        if(

            !Number.isInteger(rowIndex)

            ||

            rowIndex < 0

        ){


            return null;


        }


        return (

            this.renderedRows[rowIndex]

            ||

            null

        );


    }






    updateSelectAppearance(select){


        if(!select){


            return;


        }


        const hasValue =
            Boolean(

                this.normaliseText(

                    select.value

                )

            );


        select.classList.toggle(

            "has-value",

            hasValue

        );


        select.classList.toggle(

            "is-blank",

            !hasValue

        );


    }






    setSavingState(

        control,

        saving

    ){


        if(!control){


            return;


        }


        control.disabled =
            saving;


        control.classList.toggle(

            "is-saving",

            saving

        );


        if(saving){


            control.classList.remove(

                "is-error"

            );


            control.removeAttribute(

                "data-save-error"

            );


        }


    }






    markControlSaved(control){


        if(!control){


            return;


        }


        control.classList.remove(

            "is-error",

            "is-saving"

        );


        control.classList.add(

            "is-saved"

        );


        window.setTimeout(

            () => {


                control.classList.remove(

                    "is-saved"

                );


            },

            800

        );


    }






    markControlError(

        control,

        error

    ){


        if(!control){


            return;


        }


        control.classList.remove(

            "is-saving",

            "is-saved"

        );


        control.classList.add(

            "is-error"

        );


        control.dataset.saveError =
            "true";


        control.title =

            error?.message

            ??

            "Unable to save value";


    }






    async handleTrackerSelectChange(select){


        const row =
            this.getRowByControl(select);


        const field =
            this.normaliseText(

                select?.dataset?.field

            );


        const value =
            this.normaliseText(

                select?.value

            );


        const previousValue =
            this.normaliseText(

                select?.dataset?.originalValue

            );


        if(

            !row

            ||

            !field

        ){


            return;


        }


        if(value === previousValue){


            this.updateSelectAppearance(

                select

            );


            return;


        }


        if(

            !this.statusTrackerService

            ||

            typeof this.statusTrackerService.saveField
            !== "function"

        ){


            select.value =
                previousValue;


            this.updateSelectAppearance(

                select

            );


            console.error(

                "[PHX TRACKER SAVE ERROR]",

                new Error(

                    "Status Tracker service is not available"

                )

            );


            return;


        }


        this.setSavingState(

            select,

            true

        );


        try{


            await this.statusTrackerService.saveField(

                row,

                field,

                value

            );


            select.dataset.originalValue =
                value;


            this.updateSelectAppearance(

                select

            );


            this.markControlSaved(

                select

            );


        }

        catch(error){


            console.error(

                "[PHX TRACKER SAVE ERROR]",

                error

            );


            select.value =
                previousValue;


            this.updateSelectAppearance(

                select

            );


            this.markControlError(

                select,

                error

            );


        }

        finally{


            this.setSavingState(

                select,

                false

            );


        }


    }






    async handleTrackerInputChange(input){


        const row =
            this.getRowByControl(input);


        const field =
            this.normaliseText(

                input?.dataset?.field

            );


        const previousValue =
            this.normaliseText(

                input?.dataset?.originalValue

            );


        const value =
            this.normaliseNonNegativeInteger(

                input?.value

            );


        if(

            !row

            ||

            !field

        ){


            return;


        }


        if(value === previousValue){


            return;


        }


        if(

            !this.statusTrackerService

            ||

            typeof this.statusTrackerService.saveField
            !== "function"

        ){


            input.value =
                previousValue;


            console.error(

                "[PHX TRACKER SAVE ERROR]",

                new Error(

                    "Status Tracker service is not available"

                )

            );


            return;


        }


        this.setSavingState(

            input,

            true

        );


        try{


            await this.statusTrackerService.saveField(

                row,

                field,

                value

            );


            input.value =
                value;


            input.dataset.originalValue =
                value;


            this.markControlSaved(

                input

            );


        }

        catch(error){


            console.error(

                "[PHX TRACKER SAVE ERROR]",

                error

            );


            input.value =
                previousValue;


            this.markControlError(

                input,

                error

            );


        }

        finally{


            this.setSavingState(

                input,

                false

            );


        }


    }






    async handlePackInfoInputChange(input){


        const row =
            this.getRowByControl(input);


        const field =
            this.normaliseText(

                input?.dataset?.field

            );


        const previousValue =
            this.normaliseText(

                input?.dataset?.originalValue

            );


        const value =
            this.normalisePositiveInteger(

                input?.value

            );


        if(

            !row

            ||

            !field

        ){


            return;


        }


        if(!value){


            input.value =
                previousValue;


            this.markControlError(

                input,

                new Error(

                    field === "pack_size"

                        ? "Pack Size must be a positive whole number"

                        : "Buy Qty must be a positive whole number"

                )

            );


            return;


        }


        if(value === previousValue){


            return;


        }


        if(

            !this.amazonPackInfoService

        ){


            input.value =
                previousValue;


            this.markControlError(

                input,

                new Error(

                    "Amazon Pack Info service is not available"

                )

            );


            return;


        }


        this.setSavingState(

            input,

            true

        );


        try{


            let result;


            if(field === "pack_size"){


                result =
                    await this.amazonPackInfoService.savePackSize(

                        row,

                        value

                    );


            }

            else if(field === "buy_qty"){


                result =
                    await this.amazonPackInfoService.saveBuyQty(

                        row,

                        value

                    );


            }

            else {


                throw new Error(

                    `Unsupported amazonpackinfo field: ${field}`

                );


            }


            const payload =

                result?.payload

                ||

                {};


            input.value =
                value;


            input.dataset.originalValue =
                value;


            this.updatePackInfoControls(

                Number(

                    input.dataset.rowIndex

                ),

                payload

            );


            this.markControlSaved(

                input

            );


        }

        catch(error){


            console.error(

                "[PHX AMAZON PACK INFO SAVE ERROR]",

                error

            );


            input.value =
                previousValue;


            this.markControlError(

                input,

                error

            );


        }

        finally{


            this.setSavingState(

                input,

                false

            );


        }


    }






    updatePackInfoControls(

        rowIndex,

        payload

    ){


        if(

            !this.container

            ||

            !Number.isInteger(rowIndex)

        ){


            return;


        }


        const rowElement =
            this.container.querySelector(

                `.phoenix-grid-row[data-row-index="${rowIndex}"]`

            );


        if(!rowElement){


            return;


        }


        const packSize =
            this.normalisePositiveInteger(

                payload?.pack_size

            );


        const buyQty =
            this.normalisePositiveInteger(

                payload?.buy_qty

            );


        if(packSize){


            const packSizeInput =
                rowElement.querySelector(

                    `[data-pack-info-input="true"][data-field="pack_size"]`

                );


            if(packSizeInput){


                packSizeInput.value =
                    packSize;


                packSizeInput.dataset.originalValue =
                    packSize;


            }


        }


        if(buyQty){


            const buyQtyInput =
                rowElement.querySelector(

                    `[data-pack-info-input="true"][data-field="buy_qty"]`

                );


            if(buyQtyInput){


                buyQtyInput.value =
                    buyQty;


                buyQtyInput.dataset.originalValue =
                    buyQty;


            }


        }


    }






    handleCommentCellKeydown(event){


        const cell =
            event.currentTarget;


        if(!cell){


            return;


        }


        if(

            event.key === "Enter"

            ||

            event.key === " "

        ){


            event.preventDefault();


            this.openCommentModal(cell);


            return;


        }


        if(

            event.key === "Backspace"

            ||

            event.key === "Delete"

        ){


            event.preventDefault();


            this.openCommentModal(

                cell,

                {

                    replaceValue:
                        ""

                }

            );


            return;


        }


        if(

            event.key.length === 1

            &&

            !event.ctrlKey

            &&

            !event.metaKey

            &&

            !event.altKey

        ){


            event.preventDefault();


            this.openCommentModal(

                cell,

                {

                    replaceValue:
                        event.key

                }

            );


        }


    }






    ensureCommentModal(){


        let backdrop =
            document.getElementById(

                "phoenix-comment-backdrop"

            );


        if(backdrop){


            this.commentModal =
                backdrop;


            return backdrop;


        }


        backdrop =
            document.createElement("div");


        backdrop.id =
            "phoenix-comment-backdrop";


        backdrop.className =
            "phoenix-comment-backdrop";


        backdrop.innerHTML = `

            <div

                class="phoenix-comment-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="phoenix-comment-title"

            >

                <div

                    class="phoenix-comment-modal-header"

                    id="phoenix-comment-title"

                >

                    Edit Comment

                </div>


                <div

                    class="phoenix-comment-modal-body"

                >

                    <textarea

                        id="phoenix-comment-text"

                        placeholder="Enter comment."

                    ></textarea>

                </div>


                <div

                    class="phoenix-comment-modal-actions"

                >

                    <button

                        type="button"

                        id="phoenix-comment-cancel"

                        class="toolbar-button tools"

                    >

                        Cancel

                    </button>


                    <button

                        type="button"

                        id="phoenix-comment-save"

                        class="toolbar-button blue"

                    >

                        Save

                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(backdrop);


        backdrop.addEventListener(

            "click",

            event => {


                if(event.target === backdrop){


                    this.closeCommentModal();


                }


            }

        );


        backdrop

            .querySelector(

                "#phoenix-comment-cancel"

            )

            ?.addEventListener(

                "click",

                event => {


                    event.preventDefault();


                    this.closeCommentModal();


                }

            );


        backdrop

            .querySelector(

                "#phoenix-comment-save"

            )

            ?.addEventListener(

                "click",

                async event => {


                    event.preventDefault();


                    await this.saveActiveComment();


                }

            );


        if(!this.commentKeydownHandler){


            this.commentKeydownHandler =
                event => {


                    if(

                        !backdrop.classList.contains(

                            "open"

                        )

                    ){


                        return;


                    }


                    if(event.key === "Escape"){


                        event.preventDefault();


                        this.closeCommentModal();


                        return;


                    }


                    if(

                        event.key === "Enter"

                        &&

                        (

                            event.ctrlKey

                            ||

                            event.metaKey

                        )

                    ){


                        event.preventDefault();


                        this.saveActiveComment();


                    }


                };


            document.addEventListener(

                "keydown",

                this.commentKeydownHandler

            );


        }


        this.commentModal =
            backdrop;


        return backdrop;


    }






    openCommentModal(

        commentCell,

        {

            replaceValue = null

        } = {}

    ){


        const row =
            this.getRowByControl(

                commentCell

            );


        if(!row){


            return;


        }


        const currentComment =
            this.getTrackerValue(

                "comment",

                row

            );


        this.activeCommentContext = {


            row:
                row,


            rowIndex:
                Number(

                    commentCell.dataset.rowIndex

                ),


            commentCell:
                commentCell,


            originalValue:
                currentComment


        };


        const backdrop =
            this.ensureCommentModal();


        const textarea =
            backdrop.querySelector(

                "#phoenix-comment-text"

            );


        if(textarea){


            textarea.removeAttribute(

                "aria-invalid"

            );


            textarea.title =
                "";


            textarea.value =

                replaceValue !== null

                    ? replaceValue

                    : currentComment;


        }


        backdrop.classList.add("open");


        window.setTimeout(

            () => {


                if(!textarea){


                    return;


                }


                textarea.focus();


                const position =
                    textarea.value.length;


                textarea.setSelectionRange(

                    position,

                    position

                );


            },

            0

        );


    }






    closeCommentModal(){


        if(this.commentModal){


            this.commentModal.classList.remove(

                "open"

            );


        }


        this.activeCommentContext =
            null;


    }






    updateCommentCell(

        commentCell,

        comment

    ){


        if(!commentCell){


            return;


        }


        const value =
            this.normaliseText(comment);


        commentCell.textContent =

            value

            ||

            "Add comment...";


        commentCell.title =

            value

            ||

            "Click or type to add comment";


        commentCell.dataset.originalValue =
            value;


        commentCell.classList.toggle(

            "has-comment",

            Boolean(value)

        );


        commentCell.classList.toggle(

            "is-empty",

            !value

        );


    }






    async saveActiveComment(){


        const context =
            this.activeCommentContext;


        if(!context){


            return;


        }


        const textarea =
            this.commentModal?.querySelector(

                "#phoenix-comment-text"

            );


        const saveButton =
            this.commentModal?.querySelector(

                "#phoenix-comment-save"

            );


        const comment =
            this.normaliseText(

                textarea?.value

            );


        const previousValue =
            this.normaliseText(

                context.originalValue

            );


        if(comment === previousValue){


            this.closeCommentModal();


            return;


        }


        if(

            !this.statusTrackerService

            ||

            typeof this.statusTrackerService.saveComment
            !== "function"

        ){


            console.error(

                "[PHX COMMENT SAVE ERROR]",

                new Error(

                    "Status Tracker service is not available"

                )

            );


            return;


        }


        if(saveButton){


            saveButton.disabled =
                true;


            saveButton.textContent =
                "Saving...";


        }


        try{


            await this.statusTrackerService.saveComment(

                context.row,

                comment

            );


            this.updateCommentCell(

                context.commentCell,

                comment

            );


            this.closeCommentModal();


        }

        catch(error){


            console.error(

                "[PHX COMMENT SAVE ERROR]",

                error

            );


            if(textarea){


                textarea.setAttribute(

                    "aria-invalid",

                    "true"

                );


                textarea.title =

                    error?.message

                    ??

                    "Unable to save comment";


                textarea.focus();


            }


        }

        finally{


            if(saveButton){


                saveButton.disabled =
                    false;


                saveButton.textContent =
                    "Save";


            }


        }


    }


}