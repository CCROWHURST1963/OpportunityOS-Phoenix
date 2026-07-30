export class StatusBarController {

    constructor(state) {
        this.state = state;
    }

    render(container) {

        container.innerHTML = `

            <footer class="phoenix-status">

                <span>
                    Ready
                </span>

            </footer>

        `;

    }

}