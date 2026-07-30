export class AppState {

    constructor() {

        this.state = {
            view: "default",
            status: "Ready"
        };

        this.listeners = [];

    }


    get(key) {

        return this.state[key];

    }


    set(key, value) {

        this.state[key] = value;

        this.notify();

    }


    subscribe(callback) {

        this.listeners.push(callback);

        return () => {

            this.listeners =
                this.listeners.filter(
                    listener => listener !== callback
                );

        };

    }


    notify() {

        this.listeners.forEach(
            listener => listener(this.state)
        );

    }


}