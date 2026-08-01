export class App {


    constructor(

        state,

        controllers,

        services

    ) {


        this.state =

            state;


        this.controllers =

            controllers;


        this.services =

            services;


    }







    async start() {


        const app =

            document.getElementById(

                "app"

            );





        app.innerHTML = `


            <div class="phoenix-shell">


                <header id="phoenix-header"></header>


                <nav id="phoenix-toolbar"></nav>


                <main id="phoenix-dashboard"></main>


                <footer id="phoenix-status"></footer>


            </div>


        `;








        /*
            Load current user context
        */


        if (

            this.services.wixUser

        ) {


            const userContext =

                await this.services.wixUser

                    .loadUserContext();





            console.log(

                "[PHX USER CONTEXT]",

                userContext

            );





            this.state.update(

                userContext

            );


        }









        /*
            Load saved views

            Then load dashboard processes

            BEFORE toolbar mounts

        */


        if (

            this.services.viewConfig

        ) {


            console.log(

                "[PHX LOAD VIEWS USER KEY]",

                "DEFAULT"

            );





            await this.services.viewConfig

                .loadViews(

                    "DEFAULT"

                );









            const processes =

                await this.services.viewConfig

                    .getProcesses();





            console.log(

                "[PHX PROCESSES LOADED]",

                processes

            );





            this.state.update({

                processes

            });


        }









        /*
            Mount controllers

        */


        if (

            this.controllers.header

        ) {


            this.controllers.header.mount(

                document.getElementById(

                    "phoenix-header"

                )

            );


        }








        if (

            this.controllers.toolbar

        ) {


            this.controllers.toolbar.mount(

                document.getElementById(

                    "phoenix-toolbar"

                )

            );


        }








        if (

            this.controllers.dashboard

        ) {


            this.controllers.dashboard.mount(

                document.getElementById(

                    "phoenix-dashboard"

                )

            );


        }








        if (

            this.controllers.status

        ) {


            this.controllers.status.mount(

                document.getElementById(

                    "phoenix-status"

                )

            );


        }


    }


}