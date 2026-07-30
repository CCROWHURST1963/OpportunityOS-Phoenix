export class DashboardController {

    constructor(state) {
        this.state = state;
        this.container = null;
    }


    mount(container) {

        this.container = container;

        this.render();

        this.state.subscribe(() => {
            this.render();
        });

    }


    render() {

        this.container.innerHTML = `

            <section class="phoenix-dashboard">

                <h2>Dashboard</h2>

                <p>
                    Current view: ${this.state.get("view")}
                </p>

            </section>

        `;

    }

}