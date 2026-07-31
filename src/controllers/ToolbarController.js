export class ToolbarController {


    constructor(state) {

        this.state = state;

        this.container = null;

    }



    mount(container) {

        this.container = container;

        this.render();

    }



    render() {


        const currentView =
            this.state.get("view") || "default";



        this.container.innerHTML = `


            <div class="phoenix-toolbar">


                <button class="phoenix-pill">

                    Opportunities ▼

                </button>



                <button
                    class="phoenix-pill"
                    data-action="default-view"
                >

                    By View

                </button>



                <button
                    class="phoenix-pill"
                    data-action="supplier-view"
                >

                    By Supplier

                </button>



                <button class="phoenix-pill">

                    Rows 100 ▼

                </button>



                <button class="phoenix-pill">

                    Show All ▼

                </button>



                <div class="phoenix-spacer"></div>



                <div class="phoenix-count-pill">

                    Total Opportunities -
                    ${this.state.get("count") || 0}

                </div>


            </div>


        `;



        this.bindEvents();


    }



    bindEvents() {


        const defaultButton =
            this.container.querySelector(
                "[data-action='default-view']"
            );


        const supplierButton =
            this.container.querySelector(
                "[data-action='supplier-view']"
            );



        defaultButton.addEventListener(
            "click",
            () => {

                this.state.set(
                    "view",
                    "default"
                );

            }
        );



        supplierButton.addEventListener(
            "click",
            () => {

                this.state.set(
                    "view",
                    "supplier"
                );

            }
        );


    }


}