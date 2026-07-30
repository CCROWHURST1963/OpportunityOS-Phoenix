export class HeaderController {

    constructor(state) {
        this.state = state;
    }


    render(container) {

        container.innerHTML = `

            <header class="phoenix-header">

                <h1>
                    OpportunityOS Phoenix
                </h1>

            </header>

        `;

    }

}