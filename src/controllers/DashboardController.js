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


        this.element =

            null;


    }







    mount(element){


        this.element =

            element;


        this.render();


        this.bind();


    }








    async render(){


        if(!this.element){

            return;

        }




        this.element.innerHTML = `


            <div class="phoenix-grid">


                <div class="phoenix-empty">


                    <h2>

                        Dashboard Ready

                    </h2>


                    <p>

                        Click Load Dashboard to retrieve opportunities

                    </p>


                </div>


            </div>


        `;


    }








    bind(){


        const loadButton =

            document.querySelector(

                "#phoenix-load-dashboard"

            );



        if(!loadButton){

            return;

        }





        loadButton.onclick = async () => {


            await this.loadDashboard();


        };


    }








    async loadDashboard(){



        this.appState.update({

            dashboardStatus:

                "Loading"


        });





        try {



            const rows =

                await this.opportunityService

                    .getRows({

                        process:

                            this.appState

                                .getState()

                                .process,


                        view:

                            this.appState

                                .getState()

                                .currentView,


                        limit:

                            this.appState

                                .getState()

                                .rowsLimit

                    });







            this.viewState.setRows(

                rows || []

            );







            this.appState.update({

                dashboardStatus:

                    "Ready",


                totalRecords:

                    rows?.length || 0


            });







            this.renderRows(

                rows || []

            );



        }



        catch(error){


            console.error(

                "[PHX DASHBOARD ERROR]",

                error

            );



            this.appState.update({

                dashboardStatus:

                    "Error"


            });


        }



    }









    renderRows(rows){


        if(!this.element){

            return;

        }




        if(!rows.length){


            this.element.innerHTML = `


                <div class="phoenix-grid">


                    <div class="phoenix-empty">


                        <h2>

                            No Opportunities

                        </h2>


                        <p>

                            No records found

                        </p>


                    </div>


                </div>


            `;


            return;


        }






        this.element.innerHTML = `


            <div class="phoenix-grid">


                <div class="phoenix-grid-header">


                    Loaded Records:

                    ${rows.length}


                </div>


            </div>


        `;



    }



}