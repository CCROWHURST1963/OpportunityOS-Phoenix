import { ColumnRegistry }
    from "../services/ColumnRegistry.js";



export class DashboardController {


    constructor(

        opportunityService,

        viewConfigService,

        viewState,

        appState

    ) {


        this.opportunityService =
            opportunityService;


        this.viewConfigService =
            viewConfigService;


        this.viewState =
            viewState;


        this.appState =
            appState;


        this.columnRegistry =
            new ColumnRegistry();


        this.element =
            null;


        this.loading =
            false;


    }





    mount(element) {


        this.element = element;


        console.log(
            "[PHX DASHBOARD MOUNT]",
            element
        );


        this.render();


    }





    async render() {


        if (!this.element) {


            return;


        }



        if (this.loading) {


            return;


        }



        this.loading = true;



        try {


            const state =

                this.viewState.get();



            const mode =

                state.activeView

                ||

                "By View";



            console.log(
                "[PHX DASHBOARD MODE]",
                mode
            );



            const rows =

                await this.opportunityService
                    .getRows(

                        mode

                    );





            window.__phoenixRows = rows;



            console.log(

                "[PHX SAMPLE ROW]",

                rows[0]

            );





            this.renderGrid(

                rows

            );


        }


        catch(error) {


            console.error(

                "[PHX DASHBOARD ERROR]",

                error

            );


            this.element.innerHTML =

                `

                <div>

                    Dashboard load failed

                </div>

                `;


        }


        finally {


            this.loading = false;


        }


    }







    getColumnWidth(column) {


        const width =

            Number(

                column.width

            );



        if (

            width > 0

        ) {


            return `${width}px`;


        }



        return "auto";


    }







    renderGrid(rows = []) {


        const currentView =

            this.viewConfigService
                .currentView;



        console.log(

            "[PHX DASHBOARD CURRENT VIEW]",

            currentView

        );





        let columns =

            this.viewConfigService
                .getColumns(

                    currentView

                );





        console.log(

            "[PHX BEFORE COLUMN CHANGE]",

            {

                count:
                    columns.length,

                first:
                    columns.slice(0,5)

            }

        );





        console.log(

            "[PHX COLUMN ARRAY TYPE]",

            {

                isArray:
                    Array.isArray(columns),

                constructor:
                    columns?.constructor?.name

            }

        );





        console.log(

            "[PHX CONTROLLER FILE CHECK]",

            "NEW DASHBOARD CONTROLLER RUNNING",

            {

                columnCount:
                    columns.length

            }

        );





        console.log(

            "[PHX AFTER COLUMN CHANGE]",

            {

                count:
                    columns.length,

                first:
                    columns.slice(0,5)

            }

        );





        console.log(

            "[PHX GRID COLUMN DETAILS]",

            columns.map(

                column => ({

                    key:
                        column.key,

                    label:
                        column.label,

                    width:
                        column.width,

                    visible:
                        column.visible

                })

            )

        );





        console.log(

            "[PHX GRID COLUMNS]",

            {

                view:
                    currentView,

                count:
                    columns.length

            }

        );





        let html =


            `

            <table class="phoenix-grid">


                <thead>

                    <tr>

            `;





        columns.forEach(

            column => {


                const width =

                    this.getColumnWidth(

                        column

                    );



                html +=


                    `

                    <th

                        style="

                            width:${width};

                            min-width:${width};

                        "

                    >

                        ${

                            column.label

                            ||

                            column.key

                        }

                    </th>

                    `;


            }

        );





        html +=


            `

                    </tr>

                </thead>


                <tbody>

            `;







        rows.forEach(

            row => {


                html +=


                    `

                    <tr>

                    `;





                columns.forEach(

                    column => {


                        const value =

                            this.columnRegistry
                                .getValue(

                                    column.key,

                                    row

                                );





                        const width =

                            this.getColumnWidth(

                                column

                            );





                        html +=


                            `

                            <td

                                style="

                                    width:${width};

                                    min-width:${width};

                                "

                            >

                                ${

                                    value ?? ""

                                }

                            </td>

                            `;


                    }

                );





                html +=


                    `

                    </tr>

                    `;


            }

        );







        html +=


            `

                </tbody>

            </table>

            `;





        this.element.innerHTML = html;


        console.log(

            "[PHX GRID RENDER COMPLETE]",

            {

                columns:
                    columns.length,

                rows:
                    rows.length

            }

        );


    }


}