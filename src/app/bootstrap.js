import { App } from "./app.js";
import { AppState } from "../state/AppState.js";

window.addEventListener("DOMContentLoaded", () => {
    const state = new AppState();
    const app = new App(state);

    app.start();
});