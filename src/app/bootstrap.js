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





        await container.build();






        const userRepository =

            new UserRepository(

                container.get(

                    "supabaseClient"

                )

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

                        container.get(

                            "headerController"

                        ),


                    toolbar:

                        container.get(

                            "toolbarController"

                        ),


                    filter:

                        container.get(

                            "filterController"

                        ),


                    dashboard:

                        container.get(

                            "dashboardController"

                        ),


                    status:

                        container.get(

                            "statusController"

                        )

                },

                {

                    wixUser:


                        wixUser,


                    viewConfig:

                        container.get(

                            "viewConfig"

                        ),


                    processRepository:

                        container.get(

                            "processRepository"

                        )

                }

            );





        await app.start();


    }

);