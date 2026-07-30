export class StatusBarController {

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

        const status = this.state.get("status");

        this.container.innerHTML = `

            <div class="phoenix-status-pill">

                <span class="status-dot"></span>

                ${status}

            </div>

        `;

    }

}