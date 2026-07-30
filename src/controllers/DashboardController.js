export class DashboardController {

    constructor(state) {
        this.state = state;
    }


    render(container) {

        container.innerHTML = `

            <section class="phoenix-dashboard">

                <h2>Dashboard</h2>

                <p>
                    Phoenix dashboard area ready.
                </p>

            </section>

        `;

    }

}