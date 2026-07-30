export class AppState {

    constructor() {

        this.app = {
            name: "OpportunityOS Phoenix",
            version: "PHX-002"
        };

        this.user = {
            id: null,
            name: null,
            role: null
        };

        this.dashboard = {
            view: "default",
            rows: [],
            loading: false
        };

        this.ui = {
            activePanel: "dashboard"
        };
    }

}