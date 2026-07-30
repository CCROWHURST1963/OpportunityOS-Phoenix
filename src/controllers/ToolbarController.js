export class ToolbarController {

    constructor(state) {
        this.state = state;
    }


    render(container) {

        container.innerHTML = `

            <nav class="phoenix-toolbar">

                <button>Dashboard</button>
                <button>Workspace</button>
                <button>Reports</button>
                <button>Admin</button>

            </nav>

        `;

    }

}