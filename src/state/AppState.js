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
                Dashboard configuration
            */

            processes:

                [],


            process:

                "Can We Sell",


            opportunityMode:

                "By View",


            currentView:

                "default",


            /*
                Custom View configuration
            */

            views:

                [],


            currentViewConfig:

                null,





            /*
                Grid state
            */

            rowsLimit:

                100,


            filterMode:

                "show_all",


            totalRecords:

                0,


            rows:

                [],





            /*
                Status

            */

            status:

                "System Ready",


            dashboardStatus:

                "Ready"


        };



        this.listeners = [];


    }






    get(key){


        return this.state[key];


    }






    set(

        key,

        value

    ){


        this.state[key] = value;


        this.notify();


    }






    update(values){


        Object.assign(

            this.state,

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


        for(

            const listener of this.listeners

        ){


            listener(

                this.getState()

            );


        }


    }


}