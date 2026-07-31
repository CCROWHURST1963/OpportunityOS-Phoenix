import { AppState } from "../state/AppState.js";
import { ServiceContainer } from "../services/ServiceContainer.js";
import { App } from "./app.js";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const state = new AppState();

        const services =
            new ServiceContainer();


        const app =
            new App(
                state,
                services
            );


        app.start();

    }
);