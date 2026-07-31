export class HeaderController {

    constructor(state) {
        this.state = state;
    }


    mount(container) {

        container.innerHTML = `

            <header class="phoenix-header">

                <div>

                    <h1>
                        OpportunityOS Phoenix
                    </h1>

                    <span class="phoenix-version">
                        PHX-0.1
                    </span>

                </div>

            </header>

        `;

    }

}