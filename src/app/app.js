import { Logger }
    from "../services/Logger.js";


export class App {


    constructor(

        appState,

        controllers,

        services

    ){


        this.appState =

            appState;


        this.controllers =

            controllers;


        this.services =

            services;


        this.logger =

            new Logger();


        this.toolbarRenderedHandler =

            null;


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


        let user =

            null;


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

                user:

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
            LOAD PROCESSES + CUSTOM GRID VIEW
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


            let processes =

                [];


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

                "[PHX SELECTED CUSTOM VIEW]",

                currentView

            );


            this.appState.update({

                processes:

                    processes,


                process:

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
            BUILD APPLICATION SHELL
        */


        this.mountShell();






        /*
            HEADER
        */


        if(

            this.controllers.header

        ){


            this.controllers.header.mount(

                document.getElementById(

                    "phoenix-header"

                )

            );


        }






        /*
            FILTER CONTROLLER REMOUNT SUPPORT

            ToolbarController rebuilds its HTML whenever
            the opportunity mode or selection changes.

            Each rebuild creates a new filter host, so the
            FilterController must mount to the new element.
        */


        this.bindToolbarRenderedEvent();






        /*
            TOOLBAR
        */


        if(

            this.controllers.toolbar

        ){


            this.controllers.toolbar.mount(

                document.getElementById(

                    "phoenix-toolbar"

                )

            );


        }






        /*
            FILTER CONTROLLER
        */


        this.mountFilterController();






        /*
            STATUS
        */


        if(

            this.controllers.status

        ){


            this.controllers.status.mount(

                document.getElementById(

                    "phoenix-status"

                )

            );


        }






        /*
            DASHBOARD
        */


        if(

            this.controllers.dashboard

        ){


            this.controllers.dashboard.mount(

                document.getElementById(

                    "phoenix-dashboard"

                )

            );


        }


    }






    bindToolbarRenderedEvent(){


        if(this.toolbarRenderedHandler){


            document.removeEventListener(

                "phoenix-toolbar-rendered",

                this.toolbarRenderedHandler

            );


        }


        this.toolbarRenderedHandler =

            () => {


                this.mountFilterController();


            };


        document.addEventListener(

            "phoenix-toolbar-rendered",

            this.toolbarRenderedHandler

        );


    }






    mountFilterController(){


        if(

            !this.controllers.filter

        ){


            return;


        }


        const filterHost =

            document.getElementById(

                "phoenix-filter-host"

            );


        if(!filterHost){


            return;


        }


        this.controllers.filter.mount(

            filterHost

        );


    }






    mountShell(){


        const app =

            document.getElementById(

                "app"

            );


        if(!app){


            console.error(

                "[PHX APP] Root #app element not found"

            );


            return;


        }


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