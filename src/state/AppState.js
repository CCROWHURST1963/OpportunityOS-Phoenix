export class AppState {


    constructor() {


        this.state = {


            /*
                User context
            */

            wixUserId:

                null,


            userKey:

                "DEFAULT",


            userName:

                "",


            role:

                "",


            multiUsers:

                false,





            /*
                Dashboard context
            */

            process:

                "Can We Sell",


            currentView:

                "default",


            activeView:

                "By View",





            /*
                Retrieval state
            */

            rowsLimit:

                null,





            /*
                Grid state
            */

            rowsPerPage:

                100,


            filterMode:

                "show_all",


            rows:

                [],





            /*
                Status
            */

            status:

                "System Ready"


        };



        this.listeners = [];


    }







    /*
        Supports:

        get("key")

        AND

        get()
        -> returns full state

    */


    get(key = null) {


        if(key === null){


            return {

                ...this.state

            };


        }



        return this.state[key];


    }







    set(key,value){


        this.state[key] = value;


        console.log(

            "[PHX STATE SET]",

            {

                key,

                value

            }

        );


        this.notify();


    }







    update(values){


        Object.assign(

            this.state,

            values

        );



        console.log(

            "[PHX STATE UPDATE]",

            values

        );



        this.notify();


    }







    getState(){


        return {

            ...this.state

        };


    }







    subscribe(callback){


        this.listeners.push(

            callback

        );



        return () => {


            this.listeners =

                this.listeners.filter(

                    listener =>

                    listener !== callback

                );


        };


    }







    notify(){


        const snapshot =

            this.getState();



        for(

            const listener of this.listeners

        ){


            listener(

                snapshot

            );


        }


    }


}