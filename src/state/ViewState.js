export class ViewState {


    constructor() {


        this.state = {


            activeView:
                "By View",


            supplier:
                null,


            filter:
                "Show All",


            rowLimit:
                100,


            sort:
                "opportunity_score_desc"


        };


        this.listeners = [];


    }



    get() {


        return this.state;


    }



    set(key, value) {


        this.state[key] =
            value;


        this.notify();


    }



    update(values) {


        Object.assign(

            this.state,

            values

        );


        this.notify();


    }



    subscribe(callback) {


        this.listeners.push(
            callback
        );


    }



    notify() {


        this.listeners.forEach(
            callback =>
                callback(this.state)
        );


    }


}