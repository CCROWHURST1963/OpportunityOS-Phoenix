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


        try{


            /*
                LOAD USER
            */


            await this.loadUserContext();






            /*
                LOAD PROCESSES + CUSTOM GRID VIEW
            */


            await this.loadDashboardConfiguration();






            /*
                LOAD TRACKER LOOKUPS + CONSTANTS

                This happens after user resolution so that
                dashboard_constants can apply:

                DEFAULT
                    ↓
                active user overrides
            */


            await this.loadApplicationConfiguration();






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


            this.appState.update({

                status:

                    "System Ready"

            });


        }

        catch(error){


            console.error(

                "[PHX APP START ERROR]",

                error

            );


            this.appState.update({

                status:

                    "Application Error",


                dashboardStatus:

                    "Error"

            });


            /*
                Still build the shell so the error state can
                be shown rather than leaving a blank page.
            */


            this.mountShell();


            if(

                this.controllers.status

            ){


                this.controllers.status.mount(

                    document.getElementById(

                        "phoenix-status"

                    )

                );


            }


        }


    }






    async loadUserContext(){


        let user =

            null;


        if(

            this.services.wixUser

            &&

            typeof this.services.wixUser.loadUserContext ===

                "function"

        ){


            user =

                await this.services.wixUser.loadUserContext();


            this.appState.update({

                user:

                    user,


                wixUserId:

                    user?.wix_user_id

                    ??

                    user?.wixUserId

                    ??

                    null,


                userName:

                    user?.user_name

                    ??

                    user?.userName

                    ??

                    "User",


                role:

                    user?.role

                    ??

                    "User",


                userKey:

                    user?.user_key

                    ??

                    user?.userKey

                    ??

                    "DEFAULT",


                multiUsers:

                    user?.multi_users ===

                        true

                    ||

                    user?.multi_users ===

                        "Yes"

                    ||

                    user?.multiUsers ===

                        true

            });


            return user;


        }


        console.warn(

            "[PHX NO WIX USER SERVICE] Using DEFAULT"

        );


        this.appState.update({

            user:

                null,


            wixUserId:

                null,


            userName:

                "User",


            role:

                "User",


            userKey:

                "DEFAULT",


            multiUsers:

                false

        });


        return null;


    }






    async loadDashboardConfiguration(){


        if(

            !this.services.viewConfig

        ){


            return;


        }


        const userKey =

            this.appState.getState().userKey

            ||

            "DEFAULT";


        if(

            typeof this.services.viewConfig.setUserKey ===

                "function"

        ){


            this.services.viewConfig.setUserKey(

                userKey

            );


        }


        let processes =

            [];


        if(

            this.services.processRepository

            &&

            typeof this.services.processRepository.getProcesses ===

                "function"

        ){


            processes =

                await this.services.processRepository.getProcesses();


        }

        else {


            console.error(

                "[PHX ERROR] processRepository missing"

            );


        }


        const state =

            this.appState.getState();


        const process =

            state.process

            ||

            processes[0]?.process_name

            ||

            processes[0]?.name

            ||

            "Can We Sell";


        let currentView =

            null;


        if(

            typeof this.services.viewConfig.loadCurrentView ===

                "function"

        ){


            currentView =

                await this.services.viewConfig.loadCurrentView(

                    process

                );


        }


        this.appState.update({

            processes:

                Array.isArray(

                    processes

                )

                    ? processes

                    : [],


            process:

                process,


            currentView:

                currentView?.active_view

                ??

                currentView?.activeView

                ??

                "",


            currentViewConfig:

                currentView?.view_config

                ??

                currentView?.viewConfig

                ??

                {}

        });


    }






    async loadApplicationConfiguration(){


        const state =

            this.appState.getState();


        const userKey =

            state.userKey

            ||

            "DEFAULT";


        this.appState.update({

            configurationLoading:

                true,


            configurationLoaded:

                false,


            configurationError:

                "",


            status:

                "Loading Configuration"

        });


        const trackerLookupService =

            this.services.trackerLookupService;


        const dashboardConstantsService =

            this.services.dashboardConstantsService;


        const trackerLookupPromise =

            trackerLookupService

            &&

            typeof trackerLookupService.load ===

                "function"

                ? trackerLookupService.load()

                : Promise.resolve({

                    eligible_to_sell:

                        [],


                    product_type:

                        [],


                    hazmat_status:

                        [],


                    override:

                        []

                });


        const dashboardConstantsPromise =

            dashboardConstantsService

            &&

            typeof dashboardConstantsService.load ===

                "function"

                ? dashboardConstantsService.load(

                    userKey

                )

                : Promise.resolve({});


        const results =

            await Promise.allSettled([

                trackerLookupPromise,

                dashboardConstantsPromise

            ]);


        const trackerResult =

            results[0];


        const constantsResult =

            results[1];


        const errors =

            [];


        let trackerLookups = {

            eligible_to_sell:

                [],


            product_type:

                [],


            hazmat_status:

                [],


            override:

                []

        };


        let dashboardConstants =

            {};


        if(

            trackerResult.status ===

                "fulfilled"

        ){


            trackerLookups =

                trackerResult.value

                ||

                trackerLookups;


        }

        else {


            errors.push(

                trackerResult.reason?.message

                ||

                "Tracker lookups failed to load"

            );


            console.error(

                "[PHX TRACKER LOOKUP LOAD ERROR]",

                trackerResult.reason

            );


        }


        if(

            constantsResult.status ===

                "fulfilled"

        ){


            dashboardConstants =

                constantsResult.value

                ||

                {};


        }

        else {


            errors.push(

                constantsResult.reason?.message

                ||

                "Dashboard constants failed to load"

            );


            console.error(

                "[PHX DASHBOARD CONSTANTS LOAD ERROR]",

                constantsResult.reason

            );


        }


        this.appState.update({

            trackerLookups:{

                eligible_to_sell:

                    Array.isArray(

                        trackerLookups.eligible_to_sell

                    )

                        ? [

                            ...trackerLookups.eligible_to_sell

                        ]

                        : [],


                product_type:

                    Array.isArray(

                        trackerLookups.product_type

                    )

                        ? [

                            ...trackerLookups.product_type

                        ]

                        : [],


                hazmat_status:

                    Array.isArray(

                        trackerLookups.hazmat_status

                    )

                        ? [

                            ...trackerLookups.hazmat_status

                        ]

                        : [],


                override:

                    Array.isArray(

                        trackerLookups.override

                    )

                        ? [

                            ...trackerLookups.override

                        ]

                        : []

            },


            dashboardConstants:{

                ...dashboardConstants

            },


            configurationLoading:

                false,


            configurationLoaded:

                errors.length ===

                    0,


            configurationError:

                errors.join(

                    " | "

                ),


            status:

                errors.length > 0

                    ? "Configuration Warning"

                    : "Configuration Ready"

        });


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