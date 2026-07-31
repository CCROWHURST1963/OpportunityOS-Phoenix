export class ToolbarController {


    constructor(
        state,
        viewState
    ) {


        this.state =
            state;


        this.viewState =
            viewState;


        this.container =
            null;


    }



    mount(container) {


        this.container =
            container;


        this.render();


    }



    render() {


        const view =
            this.viewState.get()
                .activeView;



        const filter =
            this.viewState.get()
                .filter;



        const rows =
            this.viewState.get()
                .rowLimit;



        this.container.innerHTML = `


            <div class="phoenix-toolbar">


                <button
                    class="phoenix-pill"
                    data-action="view"
                >

                    ${view}

                </button>



                <button
                    class="phoenix-pill"
                    data-action="supplier"
                >

                    By Supplier

                </button>



                <button
                    class="phoenix-pill"
                    data-action="rows"
                >

                    Rows ${rows}

                </button>



                <button
                    class="phoenix-pill"
                    data-action="filter"
                >

                    ${filter}

                </button>



            </div>


        `;


        this.bindEvents();


    }



    bindEvents() {


        const viewButton =

            this.container.querySelector(
                "[data-action='view']"
            );


        const supplierButton =

            this.container.querySelector(
                "[data-action='supplier']"
            );


        const rowsButton =

            this.container.querySelector(
                "[data-action='rows']"
            );


        const filterButton =

            this.container.querySelector(
                "[data-action='filter']"
            );



        viewButton.onclick = () => {


            this.viewState.set(

                "activeView",

                "By View"

            );


        };



        supplierButton.onclick = () => {


            this.viewState.set(

                "activeView",

                "By Supplier"

            );


        };



        rowsButton.onclick = () => {


            this.viewState.set(

                "rowLimit",

                250

            );


        };



        filterButton.onclick = () => {


            this.viewState.set(

                "filter",

                "Strong Only"

            );


        };


    }


}