import { HeaderController } from "../controllers/HeaderController.js";
import { ToolbarController } from "../controllers/ToolbarController.js";
import { DashboardController } from "../controllers/DashboardController.js";
import { StatusBarController } from "../controllers/StatusBarController.js";

export class App {

    constructor(state) {
        this.state = state;
    }

    start() {

        const root = document.getElementById("app");

        if (!root) {
            throw new Error("Phoenix root element missing");
        }

        root.innerHTML = `
            <div class="phoenix-shell">

                <div id="phoenix-header"></div>

                <div id="phoenix-toolbar"></div>

                <main id="phoenix-dashboard"></main>

                <div id="phoenix-status"></div>

            </div>
        `;


        new HeaderController(this.state)
            .render(document.getElementById("phoenix-header"));


        new ToolbarController(this.state)
            .mount(document.getElementById("phoenix-toolbar"));


        new DashboardController(this.state)
            .mount(document.getElementById("phoenix-dashboard"));


        new StatusBarController(this.state)
            .mount(document.getElementById("phoenix-status"));

    }

}