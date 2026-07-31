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

        this.container.innerHTML = `

            <div class="phoenix-toolbar">

                <button class="phoenix-pill">
                    Opportunities ▼
                </button>


                <button class="phoenix-pill">
                    By View ▼
                </button>


                <button class="phoenix-pill">
                    Rows 100 ▼
                </button>


                <button class="phoenix-pill">
                    Show All ▼
                </button>


                <div class="phoenix-spacer"></div>


                <div class="phoenix-count-pill">

                    Total Opportunities - 0

                </div>

            </div>

        `;

    }

}