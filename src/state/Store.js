export class Store {

    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = [];
    }


    get() {
        return this.state;
    }


    set(patch) {

        this.state = {
            ...this.state,
            ...patch
        };

        this.notify();
    }


    subscribe(listener) {

        this.listeners.push(listener);

        return () => {
            this.listeners =
                this.listeners.filter(item => item !== listener);
        };
    }


    notify() {

        this.listeners.forEach(listener => {
            listener(this.state);
        });

    }

}

