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






    isToolsField(field){


        return [

            "actions",

            "tools",

            "_actions",

            "_tools"

        ].includes(

            this.normaliseText(

                field

            ).toLowerCase()

        );


    }






    getKeepaDomainId(locale){


        const value =

            this.normaliseText(

                locale

            ).toLowerCase();


        if(

            value.includes(

                "co.uk"

            )

            ||

            value === "uk"

            ||

            value === "gb"

        ){


            return "2";


        }


        if(

            value.includes(

                ".de"

            )

            ||

            value === "de"

        ){


            return "3";


        }


        if(

            value.includes(

                ".fr"

            )

            ||

            value === "fr"

        ){


            return "4";


        }


        if(

            value.includes(

                ".co.jp"

            )

            ||

            value === "jp"

        ){


            return "5";


        }


        if(

            value.includes(

                ".ca"

            )

            ||

            value === "ca"

        ){


            return "6";


        }


        if(

            value.includes(

                ".it"

            )

            ||

            value === "it"

        ){


            return "8";


        }


        if(

            value.includes(

                ".es"

            )

            ||

            value === "es"

        ){


            return "9";


        }


        return "2";


    }






    getKeepaUrl(row){


        const directUrl =

            this.normaliseText(

                row?.url_keepa

                ??

                row?.keepa_url

                ??

                row?.keepaUrl

                ??

                row?.urlKeepa

            );


        if(/^https?:\/\//i.test(directUrl)){


            return directUrl;


        }


        if(/^www\./i.test(directUrl)){


            return `https://${directUrl}`;


        }


        const asin =

            this.getRowAsin(

                row

            );


        if(!asin){


            return "";


        }


        return `https://keepa.com/#!product/${

            this.getKeepaDomainId(

                this.getRowLocale(

                    row

                )

            )

        }-${

            encodeURIComponent(

                asin

            )

        }`;


    }






    getSellerCentralUrl(row){


        const asin =

            this.getRowAsin(

                row

            );


        if(!asin){


            return "";


        }


        const locale =

            this.getRowLocale(

                row

            );


        let host =

            "sellercentral.amazon.co.uk";


        if(

            locale.includes(

                ".de"

            )

        ){


            host =

                "sellercentral.amazon.de";


        }
        else if(

            locale.includes(

                ".fr"

            )

        ){


            host =

                "sellercentral.amazon.fr";


        }
        else if(

            locale.includes(

                ".it"

            )

        ){


            host =

                "sellercentral.amazon.it";


        }
        else if(

            locale.includes(

                ".es"

            )

        ){


            host =

                "sellercentral.amazon.es";


        }
        else if(

            locale.includes(

                ".ca"

            )

        ){


            host =

                "sellercentral.amazon.ca";


        }
        else if(

            locale.includes(

                ".co.jp"

            )

        ){


            host =

                "sellercentral.amazon.co.jp";


        }


        return `https://${host}/product-search/search?q=${

            encodeURIComponent(

                asin

            )

        }`;


    }






    buildToolButton({

        action,

        title,

        icon,

        rowIndex,

        disabled = false

    }){


        return `

            <button

                type="button"

                class="phoenix-grid-tool-button"

                data-grid-tool-action="${

                    this.escapeAttribute(

                        action

                    )

                }"

                data-row-index="${rowIndex}"

                title="${

                    this.escapeAttribute(

                        title

                    )

                }"

                aria-label="${

                    this.escapeAttribute(

                        title

                    )

                }"

                ${disabled ? "disabled" : ""}

            >

                ${icon}

            </button>

        `;


    }






    getProfitCalculatorIcon(){


        return `

            <svg

                viewBox="0 0 24 24"

                aria-hidden="true"

                focusable="false"

            >

                <rect

                    x="5"

                    y="3"

                    width="14"

                    height="18"

                    rx="2.5"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                ></rect>

                <rect

                    x="8"

                    y="6"

                    width="8"

                    height="3"

                    rx="1"

                    fill="currentColor"

                    opacity="0.22"

                ></rect>

                <circle cx="8.5" cy="12.5" r="1.15"></circle>

                <circle cx="12" cy="12.5" r="1.15"></circle>

                <circle cx="15.5" cy="12.5" r="1.15"></circle>

                <circle cx="8.5" cy="16.5" r="1.15"></circle>

                <circle cx="12" cy="16.5" r="1.15"></circle>

                <circle cx="15.5" cy="16.5" r="1.15"></circle>

            </svg>

        `;


    }






    getCopyIcon(){


        return `

            <svg

                viewBox="0 0 24 24"

                aria-hidden="true"

                focusable="false"

            >

                <rect

                    x="9"

                    y="9"

                    width="12"

                    height="12"

                    rx="2"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                ></rect>

                <path

                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linecap="round"

                ></path>

            </svg>

        `;


    }






    getKeepaIcon(){


        return `

            <svg

                viewBox="0 0 24 24"

                aria-hidden="true"

                focusable="false"

            >

                <path

                    d="M4 19V5"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linecap="round"

                ></path>

                <path

                    d="M4 19h16"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linecap="round"

                ></path>

                <path

                    d="M7 15l3-3 2 2 5-7"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linecap="round"

                    stroke-linejoin="round"

                ></path>

                <circle cx="17" cy="7" r="1.4"></circle>

            </svg>

        `;


    }






    getSellerCentralIcon(){


        return `

            <svg

                viewBox="0 0 24 24"

                aria-hidden="true"

                focusable="false"

            >

                <path

                    d="M4 10.5 12 4l8 6.5"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linecap="round"

                    stroke-linejoin="round"

                ></path>

                <path

                    d="M6.5 10v9h11v-9"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linejoin="round"

                ></path>

                <path

                    d="M9 19v-5h6v5"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linejoin="round"

                ></path>

            </svg>

        `;


    }






    getSupplierIntelligenceIcon(){


        return `

            <svg

                viewBox="0 0 24 24"

                aria-hidden="true"

                focusable="false"

            >

                <path

                    d="M4 19V8l8-4 8 4v11"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linejoin="round"

                ></path>

                <path

                    d="M8 19v-6h8v6"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                ></path>

                <path

                    d="M9 9h.01M12 9h.01M15 9h.01"

                    stroke="currentColor"

                    stroke-width="2.5"

                    stroke-linecap="round"

                ></path>

            </svg>

        `;


    }






    getWorkspaceIcon(){


        return `

            <svg

                viewBox="0 0 24 24"

                aria-hidden="true"

                focusable="false"

            >

                <rect

                    x="3"

                    y="4"

                    width="18"

                    height="16"

                    rx="2.5"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                ></rect>

                <path

                    d="M3 9h18"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                ></path>

                <path

                    d="M8 9v11"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                ></path>

                <circle

                    cx="5.5"

                    cy="6.5"

                    r="0.8"

                    fill="currentColor"

                ></circle>

            </svg>

        `;


    }






    getCompetitiveIntelligenceIcon(){


        return `

            <svg

                viewBox="0 0 24 24"

                aria-hidden="true"

                focusable="false"

            >

                <circle

                    cx="11"

                    cy="11"

                    r="6"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                ></circle>

                <path

                    d="m15.5 15.5 4 4"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="2"

                    stroke-linecap="round"

                ></path>

                <path

                    d="M8 12.5 10.2 10l2 1.8 2.8-3.3"

                    fill="none"

                    stroke="currentColor"

                    stroke-width="1.8"

                    stroke-linecap="round"

                    stroke-linejoin="round"

                ></path>

            </svg>

        `;


    }






    buildToolsCell(

        row,

        rowIndex

    ){


        const asin =

            this.getRowAsin(

                row

            );


        const keepaUrl =

            this.getKeepaUrl(

                row

            );


        const sellerCentralUrl =

            this.getSellerCentralUrl(

                row

            );


        return `

            <div

                class="phoenix-grid-tools"

                title="Tools"

            >

                ${

                    this.buildToolButton({

                        action:

                            "profit-calculator",


                        title:

                            "Profit Calculator",


                        icon:

                            this.getProfitCalculatorIcon(),


                        rowIndex:

                            rowIndex

                    })

                }


                ${

                    this.buildToolButton({

                        action:

                            "copy-asin",


                        title:

                            "Copy ASIN",


                        icon:

                            this.getCopyIcon(),


                        rowIndex:

                            rowIndex,


                        disabled:

                            !asin

                    })

                }


                ${

                    this.buildToolButton({

                        action:

                            "keepa",


                        title:

                            "Open Keepa",


                        icon:

                            this.getKeepaIcon(),


                        rowIndex:

                            rowIndex,


                        disabled:

                            !keepaUrl

                    })

                }


                ${

                    this.buildToolButton({

                        action:

                            "seller-central",


                        title:

                            "Open Seller Central",


                        icon:

                            this.getSellerCentralIcon(),


                        rowIndex:

                            rowIndex,


                        disabled:

                            !sellerCentralUrl

                    })

                }


                ${

                    this.buildToolButton({

                        action:

                            "supplier-intelligence",


                        title:

                            "Supplier Intelligence",


                        icon:

                            this.getSupplierIntelligenceIcon(),


                        rowIndex:

                            rowIndex

                    })

                }


                ${

                    this.buildToolButton({

                        action:

                            "workspace",


                        title:

                            "Workspace",


                        icon:

                            this.getWorkspaceIcon(),


                        rowIndex:

                            rowIndex

                    })

                }


                ${

                    this.buildToolButton({

                        action:

                            "competitive-intelligence",


                        title:

                            "Competitive Intelligence",


                        icon:

                            this.getCompetitiveIntelligenceIcon(),


                        rowIndex:

                            rowIndex

                    })

                }

            </div>

        `;


    }






    ensureToolStyles(){


        if(

            document.getElementById(

                "phoenix-grid-tools-style"

            )

        ){


            return;


        }


        const style =

            document.createElement(

                "style"

            );


        style.id =

            "phoenix-grid-tools-style";


        style.textContent = `

            .phoenix-grid-tools{

                display:flex;

                align-items:center;

                justify-content:center;

                gap:4px;

                width:100%;

                min-width:0;

            }


            .phoenix-grid-tool-button{

                width:27px;

                height:27px;

                min-width:27px;

                padding:0;

                border:1px solid #cbd5e1;

                border-radius:7px;

                background:#ffffff;

                color:#334155;

                display:inline-flex;

                align-items:center;

                justify-content:center;

                cursor:pointer;

                transition:

                    background-color 120ms ease,

                    border-color 120ms ease,

                    color 120ms ease,

                    transform 120ms ease;

            }


            .phoenix-grid-tool-button:hover:not(:disabled){

                background:#eff6ff;

                border-color:#60a5fa;

                color:#1d4ed8;

                transform:translateY(-1px);

            }


            .phoenix-grid-tool-button:focus-visible{

                outline:2px solid #2563eb;

                outline-offset:2px;

            }


            .phoenix-grid-tool-button:disabled{

                opacity:0.35;

                cursor:not-allowed;

            }


            .phoenix-grid-tool-button.is-copied{

                background:#ecfdf5;

                border-color:#34d399;

                color:#047857;

            }


            .phoenix-grid-tool-button svg{

                width:17px;

                height:17px;

                display:block;

                fill:currentColor;

            }

        `;


        document.head.appendChild(

            style

        );


    }






    bindToolEvents(){


        if(!this.container){


            return;


        }


        const buttons =

            this.container.querySelectorAll(

                "[data-grid-tool-action]"

            );


        for(const button of buttons){


            button.onclick =

                async event => {


                    event.preventDefault();


                    event.stopPropagation();


                    await this.handleToolAction(

                        event.currentTarget

                    );


                };


        }


    }






    dispatchToolEvent(

        name,

        row,

        button

    ){


        document.dispatchEvent(

            new CustomEvent(

                name,

                {

                    detail: {

                        row:

                            row,


                        asin:

                            this.getRowAsin(

                                row

                            ),


                        locale:

                            this.getRowLocale(

                                row

                            ),


                        sourceElement:

                            button

                    }

                }

            )

        );


    }






    async handleToolAction(button){


        const action =

            this.normaliseText(

                button?.dataset?.gridToolAction

            );


        const row =

            this.getRowByControl(

                button

            );


        if(

            !action

            ||

            !row

        ){


            return;


        }


        if(

            action ===

            "copy-asin"

        ){


            const asin =

                this.getRowAsin(

                    row

                );


            if(!asin){


                return;


            }


            try{


                await navigator.clipboard.writeText(

                    asin

                );


            }
            catch(error){


                const textarea =

                    document.createElement(

                        "textarea"

                    );


                textarea.value =

                    asin;


                textarea.style.position =

                    "fixed";


                textarea.style.left =

                    "-9999px";


                document.body.appendChild(

                    textarea

                );


                textarea.select();


                document.execCommand(

                    "copy"

                );


                textarea.remove();


            }


            button.classList.add(

                "is-copied"

            );


            button.title =

                "ASIN copied";


            window.setTimeout(

                () => {


                    button.classList.remove(

                        "is-copied"

                    );


                    button.title =

                        "Copy ASIN";


                },

                900

            );


            return;


        }


        if(

            action ===

            "keepa"

        ){


            const url =

                this.getKeepaUrl(

                    row

                );


            if(url){


                window.open(

                    url,

                    "_blank",

                    "noopener,noreferrer"

                );


            }


            return;


        }


        if(

            action ===

            "seller-central"

        ){


            const url =

                this.getSellerCentralUrl(

                    row

                );


            if(url){


                window.open(

                    url,

                    "_blank",

                    "noopener,noreferrer"

                );


            }


            return;


        }


        if(

            action ===

            "profit-calculator"

        ){


            if(

                typeof window.openProfitCalculator ===

                "function"

            ){


                window.openProfitCalculator(

                    row

                );


                return;


            }


            this.dispatchToolEvent(

                "phoenix-open-profit-calculator",

                row,

                button

            );


            return;


        }


        if(

            action ===

            "supplier-intelligence"

        ){


            if(

                typeof window.openSupplierIntelligence ===

                "function"

            ){


                window.openSupplierIntelligence(

                    row

                );


                return;


            }


            this.dispatchToolEvent(

                "phoenix-open-supplier-intelligence",

                row,

                button

            );


            return;


        }


        if(

            action ===

            "workspace"

        ){


            if(

                typeof window.openWorkspace ===

                "function"

            ){


                window.openWorkspace(

                    row

                );


                return;


            }


            if(

                typeof window.openOpportunityWorkspace ===

                "function"

            ){


                window.openOpportunityWorkspace(

                    row

                );


                return;


            }


            this.dispatchToolEvent(

                "phoenix-open-workspace",

                row,

                button

            );


            return;


        }


        if(

            action ===

            "competitive-intelligence"

        ){


            if(

                typeof window.openCompetitiveIntelligence ===

                "function"

            ){


                window.openCompetitiveIntelligence(

                    row

                );


                return;


            }


            if(

                typeof window.openCompetitiveInfo ===

                "function"

            ){


                window.openCompetitiveInfo(

                    row

                );


                return;


            }


            this.dispatchToolEvent(

                "phoenix-open-competitive-intelligence",

                row,

                button

            );


        }


    }






    getColumnIdentity(column){


        const candidates = [

            column?.field,

            column?.id,

            column?.key,

            column?.name,

            column?.column_name,

            column?.label,

            column?.title,

            column?.header,

            column?.headerName

        ];


        for(const candidate of candidates){


            const value =

                this.normaliseText(

                    candidate

                );


            if(value){


                return value;


            }


        }


        return "";


    }






    normaliseFieldName(field){


        return this.normaliseText(

            field

        )

            .toLowerCase()

            .replaceAll(

                "-",

                "_"

            )

            .replaceAll(

                " ",

                "_"

            );


    }






    isStatusField(field){


        return [

            "status",

            "_status",

            "current_step",

            "grid_status",

            "status_tracker_status",

            "tracker_status"

        ].includes(

            this.normaliseFieldName(

                field

            )

        );


    }






    isBuySignalField(field){


        return [

            "buy_signal",

            "_buy_signal",

            "buysignal",

            "signal"

        ].includes(

            this.normaliseFieldName(

                field

            )

        );


    }






    isScoreField(field){


        return [

            "score",

            "_score",

            "opportunity_score",

            "opportunityscore"

        ].includes(

            this.normaliseFieldName(

                field

            )

        );


    }






    isPackSourceField(field){


        return [

            "pack_source",

            "_pack_source",

            "pack_size_source",

            "_packsource"

        ].includes(

            this.normaliseFieldName(

                field

            )

        );


    }






    isSupplierField(field){


        return [

            "supplier",

            "_supplier",

            "supplier_name",

            "selected_supplier"

        ].includes(

            this.normaliseFieldName(

                field

            )

        );


    }






    hasRealSupplierValue(value){


        const normalised =

            this.normaliseText(

                value

            ).toLowerCase();


        return Boolean(

            normalised

            &&

            ![

                "null",

                "undefined",

                "nan",

                "n/a",

                "na",

                "-"

            ].includes(

                normalised

            )

        );


    }






    getSupplierDisplay(

        value,

        row

    ){


        return this.normaliseText(

            value

            ??

            row?._supplier

            ??

            row?.supplier

            ??

            row?.supplier_name

            ??

            row?.selected_supplier

        );


    }






    getLowestSupplierDisplay(row){


        return this.normaliseText(

            row?.lowest_supplier

            ??

            row?._lowestSupplier

            ??

            row?.lowest_supplier_name

            ??

            row?.lowestCostSupplier

        );


    }






    getSupplierPresentation(

        value,

        row

    ){


        const supplier =

            this.getSupplierDisplay(

                value,

                row

            );


        const lowestSupplier =

            this.getLowestSupplierDisplay(

                row

            );


        const supplierKey =

            supplier.toLowerCase();


        const lowestKey =

            lowestSupplier.toLowerCase();


        const hasLowestSupplier =

            this.hasRealSupplierValue(

                lowestSupplier

            );


        const alternativeExists =

            hasLowestSupplier

            &&

            lowestKey !== supplierKey;


        const cheaperMismatch =

            alternativeExists

            &&

            (

                row?.__phase1108LowestCostMismatch ===

                    true

                ||

                row?.is_selected_supplier_lowest ===

                    false

                ||

                Number(

                    row?.supplier_cost_difference

                ) > 0

            );


        let title =

            "No lowest cost supplier available";


        if(

            hasLowestSupplier

            &&

            !alternativeExists

        ){


            title =

                "This supplier is the lowest-cost supplier";


        }
        else if(cheaperMismatch){


            title =

                `Cheaper supplier found: ${lowestSupplier}`;


        }
        else if(alternativeExists){


            title =

                `Alternative lowest-cost supplier found: ${lowestSupplier}`;


        }


        return {

            supplier,

            className:

                alternativeExists

                    ? "lowest-cost-found"

                    : "lowest-cost-blank",

            title

        };


    }






    buildSupplierPill(

        value,

        row

    ){


        const presentation =

            this.getSupplierPresentation(

                value,

                row

            );


        if(!presentation.supplier){


            return "";


        }


        return `

            <span

                class="

                    phoenix-grid-pill

                    phoenix-supplier-pill

                    ${

                        this.escapeAttribute(

                            presentation.className

                        )

                    }

                "

                title="${

                    this.escapeAttribute(

                        presentation.title

                    )

                }"

            >

                ${

                    this.escapeHtml(

                        presentation.supplier

                    )

                }

            </span>

        `;


    }






    getStatusValue(

        value,

        row

    ){


        return this.normaliseText(

            value

            ??

            row?.status

            ??

            row?._status

            ??

            row?.current_step

            ??

            row?.grid_status

            ??

            row?.status_tracker_status

            ??

            "Review"

        )

        ||

        "Review";


    }






    getStatusClass(value){


        const status =

            this.normaliseText(

                value

            ).toLowerCase();


        if(

            status === "qualified"

            ||

            status === "strong opportunity"

        ){


            return "qualified";


        }


        if(

            status === "qualified out"

            ||

            status === "exclude"

            ||

            status === "excluded"

            ||

            status === "exceeds threshold"

        ){


            return "qualified-out";


        }


        if(

            status === "lead"

        ){


            return "lead";


        }


        if(

            status === "order"

            ||

            status === "ordered"

        ){


            return "order";


        }


        if(

            status === "source"

        ){


            return "source";


        }


        return "review";


    }






    buildStatusPill(

        value,

        row

    ){


        const shown =

            this.getStatusValue(

                value,

                row

            );


        return `

            <span

                class="

                    phoenix-grid-pill

                    phoenix-status-pill

                    ${

                        this.escapeAttribute(

                            this.getStatusClass(

                                shown

                            )

                        )

                    }

                "

                data-status="${

                    this.escapeAttribute(

                        shown

                    )

                }"

                title="${

                    this.escapeAttribute(

                        shown

                    )

                }"

            >

                ${

                    this.escapeHtml(

                        shown

                    )

                }

            </span>

        `;


    }






    getBuySignalClass(value){


        const signal =

            this.normaliseText(

                value

            ).toLowerCase();


        if(

            signal === "strong opportunity"

            ||

            signal === "strong buy"

            ||

            signal === "buy"

            ||

            signal === "opportunity"

        ){


            return "strong";


        }


        if(

            signal === "avoid"

            ||

            signal.startsWith(

                "avoid "

            )

        ){


            return "avoid";


        }


        if(

            signal === "watch"

            ||

            signal === "investigate"

            ||

            signal === "weak"

            ||

            signal.includes(

                "weak opportunity"

            )

        ){


            return "watch";


        }


        return "review";


    }






    buildBuySignalPill(value){


        const shown =

            this.normaliseText(

                value

            )

            ||

            "Review";


        return `

            <span

                class="

                    phoenix-grid-pill

                    phoenix-signal-pill

                    ${

                        this.escapeAttribute(

                            this.getBuySignalClass(

                                shown

                            )

                        )

                    }

                "

                title="${

                    this.escapeAttribute(

                        shown

                    )

                }"

            >

                ${

                    this.escapeHtml(

                        shown

                    )

                }

            </span>

        `;


    }






    getScoreValue(

        value,

        row

    ){


        const candidates = [

            value,

            row?.opportunity_score,

            row?.opportunityScore,

            row?._score,

            row?.score

        ];


        for(const candidate of candidates){


            const parsed =

                Number(

                    String(

                        candidate

                        ??

                        ""

                    ).replace(

                        "%",

                        ""

                    )

                );


            if(Number.isFinite(parsed)){


                return Math.max(

                    0,

                    Math.min(

                        100,

                        Math.round(

                            parsed

                        )

                    )

                );


            }


        }


        return 0;


    }






    getScoreClass(score){


        if(score >= 80){


            return "strong";


        }


        if(score >= 65){


            return "good";


        }


        if(score >= 50){


            return "review";


        }


        if(score >= 40){


            return "watch";


        }


        return "weak";


    }






    buildScorePill(

        value,

        row

    ){


        const score =

            this.getScoreValue(

                value,

                row

            );


        const shown =

            `${score}%`;


        return `

            <span

                class="

                    phoenix-grid-pill

                    phoenix-score-pill

                    ${

                        this.escapeAttribute(

                            this.getScoreClass(

                                score

                            )

                        )

                    }

                "

                title="${

                    this.escapeAttribute(

                        `Opportunity Score: ${shown}`

                    )

                }"

            >

                ${shown}

            </span>

        `;


    }






    getPackSourceDisplay(

        value,

        row

    ){


        const raw =

            this.normaliseText(

                value

                ??

                row?._packSource

                ??

                row?.pack_size_source

                ??

                row?.pack_source

            );


        const source =

            raw.toLowerCase();


        if(/^\d+(\.\d+)?$/.test(raw)){


            if(

                row?.amazonpackinfo_pack_size

                ||

                row?.__packInfoDbLoaded

                ||

                row?._packInfoManualLock

            ){


                return "Manual";


            }


            return "Default";


        }


        if(

            source === "amazonpackinfo"

            ||

            source === "amazon_pack_info"

            ||

            source === "manual"

        ){


            return "Manual";


        }


        if(source === "derived"){


            return "Derived";


        }


        if(

            source === "number_of_items"

            ||

            source === "number of items"

        ){


            return "number_of_items";


        }


        if(

            source === "supplier"

        ){


            return "Supplier";


        }


        if(

            source === "amazon"

        ){


            return "Amazon";


        }


        if(

            !source

            ||

            source === "default"

        ){


            return "Default";


        }


        return raw;


    }






    getPackSourceClass(value){


        const source =

            this.normaliseText(

                value

            ).toLowerCase();


        if(source === "manual"){


            return "manual";


        }


        if(source === "derived"){


            return "derived";


        }


        if(

            source === "number_of_items"

            ||

            source === "number of items"

        ){


            return "number-of-items";


        }


        if(source === "supplier"){


            return "supplier";


        }


        if(source === "amazon"){


            return "amazon";


        }


        return "default";


    }






    buildPackSourcePill(

        value,

        row

    ){


        const shown =

            this.getPackSourceDisplay(

                value,

                row

            );


        return `

            <span

                class="

                    phoenix-grid-pill

                    phoenix-source-pill

                    ${

                        this.escapeAttribute(

                            this.getPackSourceClass(

                                shown

                            )

                        )

                    }

                "

                title="${

                    this.escapeAttribute(

                        shown

                    )

                }"

            >

                ${

                    this.escapeHtml(

                        shown

                    )

                }

            </span>

        `;


    }






    buildFormattedCell(

        column,

        row,

        value

    ){


        const columnIdentity =

            this.getColumnIdentity(

                column

            );


        if(

            this.isStatusField(

                columnIdentity

            )

        ){


            return this.buildStatusPill(

                value,

                row

            );


        }


        if(

            this.isBuySignalField(

                columnIdentity

            )

        ){


            return this.buildBuySignalPill(

                value

            );


        }


        if(

            this.isScoreField(

                columnIdentity

            )

        ){


            return this.buildScorePill(

                value,

                row

            );


        }


        if(

            this.isPackSourceField(

                columnIdentity

            )

        ){


            return this.buildPackSourcePill(

                value,

                row

            );


        }


        if(

            this.isSupplierField(

                columnIdentity

            )

        ){


            return this.buildSupplierPill(

                value,

                row

            );


        }


        return this.escapeHtml(

            value

            ??

            ""

        );


    }






    ensureFormattingStyles(){


        if(

            document.getElementById(

                "phoenix-grid-formatting-style"

            )

        ){


            return;


        }


        const style =

            document.createElement(

                "style"

            );


        style.id =

            "phoenix-grid-formatting-style";


        style.textContent = `

            .phoenix-grid-pill{

                display:inline-flex;

                align-items:center;

                justify-content:center;

                max-width:100%;

                min-width:72px;

                height:26px;

                line-height:26px;

                padding:0 9px;

                border:1px solid transparent;

                border-radius:999px;

                box-sizing:border-box;

                overflow:hidden;

                text-overflow:ellipsis;

                white-space:nowrap;

                font-size:12px;

                font-weight:900;

                text-align:center;

            }


            .phoenix-status-pill.qualified{

                background:#dcfce7;

                border-color:#86efac;

                color:#166534;

            }


            .phoenix-status-pill.review{

                background:#fef3c7;

                border-color:#fcd34d;

                color:#92400e;

            }


            .phoenix-status-pill.qualified-out{

                background:#fee2e2;

                border-color:#fecaca;

                color:#991b1b;

            }


            .phoenix-status-pill.lead{

                background:#dbeafe;

                border-color:#93c5fd;

                color:#1d4ed8;

            }


            .phoenix-status-pill.order{

                background:#ede9fe;

                border-color:#c4b5fd;

                color:#6d28d9;

            }


            .phoenix-status-pill.source{

                background:#cffafe;

                border-color:#67e8f9;

                color:#0e7490;

            }


            .phoenix-signal-pill.strong{

                background:#dcfce7;

                border-color:#86efac;

                color:#166534;

            }


            .phoenix-signal-pill.review{

                background:#dbeafe;

                border-color:#bfdbfe;

                color:#1d4ed8;

            }


            .phoenix-signal-pill.watch{

                background:#fed7aa;

                border-color:#fdba74;

                color:#9a3412;

            }


            .phoenix-signal-pill.avoid{

                background:#fee2e2;

                border-color:#fecaca;

                color:#991b1b;

            }


            .phoenix-score-pill{

                min-width:64px;

            }


            .phoenix-score-pill.strong{

                background:#dcfce7;

                border-color:#86efac;

                color:#166534;

            }


            .phoenix-score-pill.good{

                background:#ecfdf5;

                border-color:#a7f3d0;

                color:#047857;

            }


            .phoenix-score-pill.review{

                background:#fef3c7;

                border-color:#fcd34d;

                color:#92400e;

            }


            .phoenix-score-pill.watch{

                background:#fed7aa;

                border-color:#fdba74;

                color:#9a3412;

            }


            .phoenix-score-pill.weak{

                background:#fee2e2;

                border-color:#fecaca;

                color:#991b1b;

            }


            .phoenix-source-pill{

                min-width:64px;

                height:24px;

                line-height:24px;

                font-size:11px;

                text-transform:capitalize;

                background:#e2e8f0;

                border-color:#cbd5e1;

                color:#334155;

            }


            .phoenix-source-pill.manual{

                background:#dbeafe;

                border-color:#bfdbfe;

                color:#1d4ed8;

            }


            .phoenix-source-pill.derived{

                background:#fef3c7;

                border-color:#fcd34d;

                color:#92400e;

            }


            .phoenix-source-pill.number-of-items{

                background:#dcfce7;

                border-color:#86efac;

                color:#166534;

                text-transform:none;

            }


            .phoenix-source-pill.supplier{

                background:#ede9fe;

                border-color:#c4b5fd;

                color:#6d28d9;

            }


            .phoenix-source-pill.amazon{

                background:#ffedd5;

                border-color:#fdba74;

                color:#9a3412;

            }


            .phoenix-source-pill.default{

                background:#e2e8f0;

                border-color:#cbd5e1;

                color:#475569;

            }


            .phoenix-grid-pill{

                margin-left:auto;

                margin-right:auto;

            }


            .phoenix-supplier-pill{

                min-width:74px;

                max-width:100%;

                height:24px;

                line-height:24px;

                font-size:11px;

            }


            .phoenix-supplier-pill.lowest-cost-found{

                background:#fee2e2;

                border-color:#fecaca;

                color:#991b1b;

            }


            .phoenix-supplier-pill.lowest-cost-blank{

                background:#dcfce7;

                border-color:#86efac;

                color:#166534;

            }

        `;


        document.head.appendChild(

            style

        );


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

            this.isToolsField(

                column.field

            )

        ){


            return this.buildToolsCell(

                row,

                rowIndex

            );


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


        return this.buildFormattedCell(

            column,

            row,

            value

        );


    }






    render(

        container,

        columns,

        rows = []

    ){


        this.container =
            container;


        console.log(

            "[PHX0067A GRID FORMATTER ACTIVE]"

        );


        this.ensureToolStyles();


        this.ensureFormattingStyles();


        this.renderedRows =

            Array.isArray(rows)

                ? [...rows].sort(

                    (a, b) =>

                        Number(

                            b.opportunity_score

                            ??

                            b.opportunityScore

                            ??

                            b.score

                            ??

                            0

                        )

                        -

                        Number(

                            a.opportunity_score

                            ??

                            a.opportunityScore

                            ??

                            a.score

                            ??

                            0

                        )

                )

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


        this.bindToolEvents();


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