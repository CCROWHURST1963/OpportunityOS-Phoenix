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






    getImportTypeOptions(){


        return [

            {

                value:

                    "By ASIN",


                label:

                    "By ASIN"

            },

            {

                value:

                    "By Brand",


                label:

                    "By Brand"

            },

            {

                value:

                    "By Barcode",


                label:

                    "By Barcode"

            }

        ];


    }






    renderImportTypeOptions(state){


        const importTypes =

            this.getImportTypeOptions();


        const currentImportType =

            String(

                state.importType

                ??

                ""

            ).trim();


        const options =

            importTypes

                .map(importType => {


                    const escapedValue =

                        this.escapeHtml(

                            importType.value

                        );


                    const escapedLabel =

                        this.escapeHtml(

                            importType.label

                        );


                    const selected =

                        currentImportType ===

                        importType.value

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


        const currentImportTypeExists =

            importTypes.some(importType =>

                importType.value ===

                currentImportType

            );


        return `

            <option

                value=""

                ${currentImportTypeExists ? "" : "selected"}

            >

                Select Import Type

            </option>

            ${options}

        `;


    }






    renderImportSelector(state){


        if(

            state.opportunityMode !==

            "By Import"

        ){


            return "";


        }


        return `

            <div

                class="toolbar-pill toolbar-green"

                id="phoenix-import-type-pill"

            >


                <span class="toolbar-pill-label">

                    Import Type

                </span>


                <select

                    id="phoenix-import-type"

                >

                    ${this.renderImportTypeOptions(state)}

                </select>


            </div>

        `;


    }






    renderImportFileSelector(state){


        if(

            state.opportunityMode !==

            "By Import"

        ){


            return "";


        }


        const fileName =

            String(

                state.importFileName

                ??

                ""

            ).trim();


        const safeFileName =

            this.escapeHtml(

                fileName

                ||

                "No file selected"

            );


        return `

            <div

                class="toolbar-pill toolbar-green"

                id="phoenix-import-file-pill"

            >


                <span class="toolbar-pill-label">

                    Import File

                </span>


                <label

                    for="phoenix-import-file"

                    class="toolbar-file-button"

                >

                    Choose File

                </label>


                <input

                    id="phoenix-import-file"

                    type="file"

                    accept=".csv,.xlsx,.xls"

                    style="display:none;"

                >


                <span

                    id="phoenix-import-file-name"

                    class="toolbar-file-name"

                    title="${safeFileName}"

                >

                    ${safeFileName}

                </span>


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


        const importSelector =

            this.renderImportSelector(

                state

            );


        const importFileSelector =

            this.renderImportFileSelector(

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


                <option

                    value="By Import"

                    ${opportunityMode === "By Import" ? "selected" : ""}

                >

                    By Import

                </option>


            </select>


        </div>


        ${viewSelector}


        ${supplierSelector}


        ${importSelector}


        ${importFileSelector}


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






    normaliseImportValues(values, importType){


        const seen =

            new Set();


        const result =

            [];


        const headerNames =

            new Set([

                "asin",

                "brand",

                "barcode",

                "ean",

                "upc",

                String(importType ?? "")

                    .replace(/^By\s+/i, "")

                    .trim()

                    .toLocaleLowerCase()

            ]);


        for(const source of values){


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


            if(headerNames.has(key)){


                continue;


            }


            if(seen.has(key)){


                continue;


            }


            seen.add(key);


            result.push(value);


        }


        return result;


    }






    parseCsvText(text){


        const rows =

            [];


        let field =

            "";


        let row =

            [];


        let quoted =

            false;


        const pushField = () => {


            row.push(field);


            field = "";


        };


        const pushRow = () => {


            pushField();


            rows.push(row);


            row = [];


        };


        const source =

            String(text ?? "");


        for(let index = 0; index < source.length; index += 1){


            const character =

                source[index];


            if(quoted){


                if(character === '"' && source[index + 1] === '"'){


                    field += '"';


                    index += 1;


                }


                else if(character === '"'){


                    quoted = false;


                }


                else {


                    field += character;


                }


                continue;


            }


            if(character === '"'){


                quoted = true;


            }


            else if(character === ','){


                pushField();


            }


            else if(character === '\n'){


                pushRow();


            }


            else if(character !== '\r'){


                field += character;


            }


        }


        if(field || row.length){


            pushRow();


        }


        return rows.flat();


    }






    async ensureXlsxLibrary(){


        if(window.XLSX){


            return window.XLSX;


        }


        await new Promise((resolve, reject) => {


            const existing =

                document.querySelector(

                    'script[data-phx-xlsx-parser="true"]'

                );


            if(existing){


                existing.addEventListener(

                    "load",

                    resolve,

                    {once:true}

                );


                existing.addEventListener(

                    "error",

                    reject,

                    {once:true}

                );


                return;


            }


            const script =

                document.createElement(

                    "script"

                );


            script.src =

                "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";


            script.async =

                true;


            script.dataset.phxXlsxParser =

                "true";


            script.onload =

                resolve;


            script.onerror = () =>

                reject(

                    new Error(

                        "Could not load the Excel parser. Save the file as CSV and try again."

                    )

                );


            document.head.appendChild(script);


        });


        return window.XLSX;


    }






    async parseImportFile(file, importType){


        if(!file){


            return [];


        }


        const extension =

            String(file.name ?? "")

                .split(".")

                .pop()

                .toLocaleLowerCase();


        let values =

            [];


        if(extension === "csv"){


            values =

                this.parseCsvText(

                    await file.text()

                );


        }


        else if(

            extension === "xlsx"

            ||

            extension === "xls"

        ){


            const XLSX =

                await this.ensureXlsxLibrary();


            const workbook =

                XLSX.read(

                    await file.arrayBuffer(),

                    {type:"array"}

                );


            const firstSheetName =

                workbook.SheetNames?.[0];


            if(firstSheetName){


                const matrix =

                    XLSX.utils.sheet_to_json(

                        workbook.Sheets[firstSheetName],

                        {header:1, raw:false, defval:""}

                    );


                values =

                    matrix.flat();


            }


        }


        else {


            throw new Error(

                "Choose a CSV, XLSX or XLS import file"

            );


        }


        return this.normaliseImportValues(

            values,

            importType

        );


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


                const sharedReset = {

                    opportunityView:

                        "",


                    selectedSupplier:

                        "",


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

                };


                if(

                    opportunityMode ===

                    "By Supplier"

                ){


                    this.appState.update({

                        ...sharedReset,


                        opportunityMode:

                            "By Supplier"

                    });


                    this.renderAndBind();


                    this.ensureSuppliersLoaded();


                    return;


                }


                if(

                    opportunityMode ===

                    "By Import"

                ){


                    this.appState.update({

                        ...sharedReset,


                        opportunityMode:

                            "By Import"

                    });


                    this.renderAndBind();


                    return;


                }


                this.appState.update({

                    ...sharedReset,


                    opportunityMode:

                        "By View"

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


        const importTypeSelect =

            this.element.querySelector(

                "#phoenix-import-type"

            );


        if(importTypeSelect){


            importTypeSelect.onchange = event => {


                this.appState.update({

                    importType:

                        event.target.value,


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


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


                this.renderAndBind();


            };


        }


        const importFileInput =

            this.element.querySelector(

                "#phoenix-import-file"

            );


        if(importFileInput){


            importFileInput.onchange = async event => {


                const file =

                    event.target.files?.[0]

                    ||

                    null;


                const state =

                    this.appState.getState();


                const importType =

                    String(

                        state.importType

                        ??

                        ""

                    ).trim();


                if(!file){


                    this.appState.update({

                        importFileName:

                            "",


                        importValues:

                            [],


                        importLoading:

                            false,


                        importLoaded:

                            false,


                        importError:

                            ""

                    });


                    this.renderAndBind();


                    return;


                }


                if(!importType){


                    this.appState.update({

                        importFileName:

                            file.name,


                        importValues:

                            [],


                        importLoading:

                            false,


                        importLoaded:

                            false,


                        importError:

                            "Select an Import Type before choosing a file"

                    });


                    this.renderAndBind();


                    return;


                }


                this.appState.update({

                    importFileName:

                        file.name,


                    importValues:

                        [],


                    importLoading:

                        true,


                    importLoaded:

                        false,


                    importError:

                        "",


                    gridLoaded:

                        false,


                    totalOpportunities:

                        0

                });


                this.renderAndBind();


                try{


                    const importValues =

                        await this.parseImportFile(

                            file,

                            importType

                        );


                    if(importValues.length === 0){


                        throw new Error(

                            "The selected import file did not contain any values"

                        );


                    }


                    this.appState.update({

                        importFileName:

                            file.name,


                        importValues:

                            importValues,


                        importLoading:

                            false,


                        importLoaded:

                            true,


                        importError:

                            ""

                    });


                    console.log(

                        "[PHX IMPORT FILE PARSED]",

                        {

                            importType,

                            fileName:file.name,

                            values:importValues.length

                        }

                    );


                }


                catch(error){


                    console.error(

                        "[PHX IMPORT FILE ERROR]",

                        error

                    );


                    this.appState.update({

                        importValues:

                            [],


                        importLoading:

                            false,


                        importLoaded:

                            false,


                        importError:

                            error?.message

                            ||

                            "Unable to read the import file"

                    });


                }


                this.renderAndBind();


            };


        }



    }


}