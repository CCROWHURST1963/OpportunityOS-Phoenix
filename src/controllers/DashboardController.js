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

            "[PHX DASHBOARD MOUNT]"

        );



        this.renderEmpty();





        window.addEventListener(

            "phoenix-dashboard-load",

            () => {


                console.log(

                    "[PHX DASHBOARD LOAD EVENT]"

                );


                this.render();


            }

        );


    }







    renderEmpty(){


        this.element.innerHTML = `


            <div class="phoenix-dashboard-empty">


                Select options then click


                <strong>

                    Load Dashboard

                </strong>


            </div>


        `;


    }







    async render(){


        if(!this.element){

            return;

        }



        if(this.loading){

            return;

        }



        this.loading = true;



        try{


            const state =

                this.appState?.get?.()

                ||

                {};





            const mode =

                state.activeView

                ||

                "By View";





            const limit =

                state.rowsLimit

                ??

                null;





            console.log(

                "[PHX DASHBOARD REQUEST]",

                {

                    mode,

                    limit

                }

            );





            const rows =

                await this.opportunityService

                    .getRows(

                        mode,

                        limit

                    );





            window.__phoenixRows = rows;



            console.log(

                "[PHX ROW COUNT]",

                rows.length

            );



            console.log(

                "[PHX SAMPLE ROW]",

                rows[0]

            );





            this.renderGrid(rows);


        }


        catch(error){


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


        finally{


            this.loading = false;


        }


    }







    getColumnWidth(column){


        const width =

            Number(

                column.width

            );



        if(width > 0){

            return `${width}px`;

        }



        return "auto";


    }







    renderGrid(rows=[]){


        const currentView =

            this.viewConfigService.currentView;



        const columns =

            this.viewConfigService

                .getColumns(

                    currentView

                );





        let html = `


        <table class="phoenix-grid">


            <thead>

                <tr>

        `;





        columns.forEach(

            column=>{


                const width =

                    this.getColumnWidth(

                        column

                    );



                html += `


                <th

                style="

                width:${width};

                min-width:${width};

                "

                >

                ${column.label || column.key}

                </th>


                `;


            }

        );





        html += `


                </tr>

            </thead>


            <tbody>


        `;





        rows.forEach(

            row=>{


                html += "<tr>";



                columns.forEach(

                    column=>{


                        const value =

                            this.columnRegistry

                            .getValue(

                                column.key,

                                row

                            );



                        html += `


                        <td>

                            ${value ?? ""}

                        </td>


                        `;


                    }

                );



                html += "</tr>";


            }

        );





        html += `


            </tbody>


        </table>


        `;



        this.element.innerHTML = html;


    }


}