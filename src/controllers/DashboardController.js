import { GridRenderer } from "../components/GridRenderer.js";


export class DashboardController {


    constructor(state, services) {

        this.state = state;

        this.services = services;

        this.container = null;

        this.gridRenderer =
            new GridRenderer();

    }



    mount(container) {

        this.container = container;


        this.render();


        this.state.subscribe(() => {

            this.render();

        });

    }



    async render() {


        const currentView =
            this.state.get("view") || "default";



        const view =
            this.services.viewConfig
                .getView(currentView);



        const columns =
            this.services.viewConfig
                .getColumns(currentView);



        const rows =
            await this.services.opportunity
                .getRows(currentView);



        this.container.innerHTML = `


            <section class="phoenix-dashboard">


                <div class="phoenix-grid-header">

                    <h2>

                        ${view.name}

                    </h2>

                </div>



                <div id="phoenix-grid-container"></div>


            </section>


        `;



        this.gridRenderer.render(

            document.getElementById(
                "phoenix-grid-container"
            ),

            columns,

            rows

        );


    }


}