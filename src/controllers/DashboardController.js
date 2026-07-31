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



            const rows =

                await this.opportunityService
                    .getRows(

                        mode

                    );





            /*
                DEBUG ONLY

                expose final rows
                after enrichment

            */


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





    renderGrid(rows = []) {


        const columns =

            this.viewConfigService
                .getColumns();



        let html =

            `

            <table class="phoenix-grid">

                <thead>

                    <tr>

            `;



        columns.forEach(

            column => {


                if (

                    column.visible === false

                ) {


                    return;


                }



                html +=

                    `

                    <th>

                        ${

                            column.label

                            ||

                            column.key

                            ||

                            column.field

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


                        if (

                            column.visible === false

                        ) {


                            return;


                        }



                        const key =

                            column.key

                            ||

                            column.field;





                        const value =

                            this.columnRegistry
                                .getValue(

                                    key,

                                    row

                                );





                        html +=

                            `

                            <td>

                                ${

                                    value

                                    ?? 

                                    ""

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


    }


}