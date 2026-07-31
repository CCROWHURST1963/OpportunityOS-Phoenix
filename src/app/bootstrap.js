import { App }
    from "./app.js";


import { AppState }
    from "../state/AppState.js";


import { ViewState }
    from "../state/ViewState.js";


import { ServiceContainer }
    from "../services/ServiceContainer.js";


import { WixUserService }
    from "../services/WixUserService.js";


import { UserRepository }
    from "../repositories/UserRepository.js";



document.addEventListener(

    "DOMContentLoaded",

    async () => {



        const state =

            new AppState();



        const viewState =

            new ViewState();



        const container =

            new ServiceContainer(

                state,

                viewState

            );



        const userRepository =

            new UserRepository(

                container.supabaseClient

            );



        const wixUser =

            new WixUserService(

                userRepository

            );



        const app =

            new App(

                state,

                {


                    header:

                        container.headerController,



                    toolbar:

                        container.toolbarController,



                    dashboard:

                        container.dashboardController,



                    status:

                        container.statusController


                },

                {


                    wixUser,


                    viewConfig:

                        container.viewConfig


                }

            );



        await app.start();


    }

);