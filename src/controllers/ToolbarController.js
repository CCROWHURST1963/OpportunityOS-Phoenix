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

            <nav class="phoenix-toolbar">

                <button class="phoenix-button active">
                    Dashboard
                </button>

                <button class="phoenix-button">
                    Workspace
                </button>

                <button class="phoenix-button">
                    Reports
                </button>

                <button class="phoenix-button">
                    Admin
                </button>

            </nav>

        `;

    }

}