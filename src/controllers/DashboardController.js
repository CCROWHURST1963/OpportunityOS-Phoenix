export class DashboardController {



    constructor(

        opportunityService,

        viewConfig,

        viewState,

        appState,

        gridRenderer

    ){


        this.opportunityService =

            opportunityService;


        this.viewConfig =

            viewConfig;


        this.viewState =

            viewState;


        this.appState =

            appState;


        this.gridRenderer =

            gridRenderer;



        this.container = null;


        this.gridContainer = null;


    }









    mount(container){



        this.container = container;



        this.render();



        this.bind();



    }









    bind(){



        document.addEventListener(

            "phoenix-load-dashboard",

            async () => {


                await this.loadDashboard();


            }

        );



    }









    async loadDashboard(){



        try {



            const state =

                this.appState.getState();






            console.log(

                "[PHX DASHBOARD LOAD STATE]",

                state

            );









            const rows =

                await this.opportunityService.getRows({

                    process:

                        state.process,


                    view:

                        state.currentView,


                    limit:

                        state.rowsLimit || 100


                });








            console.log(

                "[PHX DASHBOARD ROWS]",

                rows

            );







            console.log(

                "[PHX DASHBOARD ROW COUNT]",

                rows.length

            );







            console.log(

                "[PHX DASHBOARD FIRST ROW KEYS]",

                Object.keys(

                    rows[0] || {}

                )

            );








            this.appState.update({



                rows,



                totalRecords:

                    rows.length,



                status:

                    "Dashboard Ready"



            });







            this.renderRows(rows);



        }

        catch(error){



            console.error(

                "[PHX DASHBOARD ERROR]",

                error

            );



            this.appState.update({



                status:

                    "Dashboard Error"



            });



        }



    }









    render(){



        if(!this.container)

            return;






        this.container.innerHTML = `



            <div

                id="phoenix-grid-container"

                class="phoenix-dashboard-grid"

            >

                Loading dashboard...

            </div>



        `;






        this.gridContainer =

            document.getElementById(

                "phoenix-grid-container"

            );



    }









    renderRows(rows){



        console.log(

            "[PHX RENDER ROWS]",

            rows

        );







        /*
            CURRENT VIEW CONFIG
            Comes from AppState.
            ViewConfigService only loads it.
        */



        const state =

            this.appState.getState();







        const config =

            state.currentViewConfig || {};







        console.log(

            "[PHX RENDER CONFIG]",

            config

        );








        const visibleKeys =

            config.visibleColumns || [];








        const columns =


            (config.columns || [])

                .filter(


                    column =>


                        visibleKeys.includes(

                            column.key

                        )


                );








        console.log(

            "[PHX RENDER COLUMNS]",

            columns

        );









        if(!this.gridRenderer){


            console.error(

                "[PHX GRID RENDERER MISSING]"

            );


            return;


        }








        this.gridRenderer.render(

            this.gridContainer,

            columns,

            rows

        );



    }



}