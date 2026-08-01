import { Logger }
    from "../services/Logger.js";



export class App {



    constructor(

        appState,

        controllers,

        services

    ){


        this.appState = appState;


        this.controllers = controllers;


        this.services = services;


        this.logger = new Logger();


    }









    async start(){



        this.logger.info(

            "Phoenix started"

        );



        console.log(

            "[PHX APP SERVICES]",

            this.services

        );








        /*
            LOAD USER
        */


        let user = null;



        if(

            this.services.wixUser

        ){



            user =

                await this.services.wixUser.loadUserContext();



            console.log(

                "[PHX USER READY]",

                user

            );



            this.appState.update({



                user,



                userName:

                    user?.user_name

                    ||

                    "User",



                role:

                    user?.role

                    ||

                    "User",



                userKey:

                    user?.user_key

                    ||

                    "DEFAULT"



            });



        }

        else {


            console.warn(

                "[PHX NO WIX USER SERVICE] Using DEFAULT"

            );


            this.appState.update({


                userName:

                    "User",


                role:

                    "User",


                userKey:

                    "DEFAULT"



            });



        }









        /*
            LOAD PROCESSES + VIEWS
        */


        if(

            this.services.viewConfig

        ){



            const userKey =


                this.appState.getState().userKey

                ||

                "DEFAULT";





            this.services.viewConfig.setUserKey(

                userKey

            );








            let processes = [];





            if(

                this.services.processRepository

            ){



                processes =

                    await this.services.processRepository.getProcesses();



            }

            else {



                console.error(

                    "[PHX ERROR] processRepository missing",

                    this.services

                );



            }







            console.log(

                "[PHX PROCESSES]",

                processes

            );









            const process =



                this.appState.getState().process



                ||



                processes[0]?.process_name



                ||



                processes[0]?.name



                ||



                "Can We Sell";









            const currentView =



                await this.services.viewConfig.loadCurrentView(

                    process

                );








            console.log(

                "[PHX SELECTED PROCESS]",

                process

            );







            console.log(

                "[PHX SELECTED VIEW]",

                currentView

            );








            this.appState.update({



                processes,



                process,



                currentView:



                    currentView?.active_view

                    ||

                    "",




                currentViewConfig:



                    currentView?.view_config

                    ||

                    {}



            });



        }









        /*
            BUILD SHELL
        */


        this.mountShell();









        /*
            HEADER
        */


        this.controllers.header.mount(

            document.getElementById(

                "phoenix-header"

            )

        );








        /*
            TOOLBAR
        */


        this.controllers.toolbar.mount(

            document.getElementById(

                "phoenix-toolbar"

            )

        );








        /*
            STATUS
        */


        this.controllers.status.mount(

            document.getElementById(

                "phoenix-status"

            )

        );








        /*
            DASHBOARD
        */


        this.controllers.dashboard.mount(

            document.getElementById(

                "phoenix-dashboard"

            )

        );








        /*
            IMPORTANT:
            No automatic dashboard load.

            Load Dashboard button triggers:

            phoenix-load-dashboard

        */



    }











    mountShell(){



        const app =

            document.getElementById(

                "app"

            );



        if(!app)

            return;







        app.innerHTML = `



        <div class="phoenix-shell">



            <header

                id="phoenix-header">

            </header>





            <nav

                id="phoenix-toolbar">

            </nav>





            <main

                id="phoenix-dashboard">

            </main>





            <footer

                id="phoenix-status">

            </footer>



        </div>



        `;



    }



}