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

                "",





            /*
                By View filter state
            */

            viewFilterType:

                "",


            viewFilterValue:

                "",


            viewFilterLabel:

                "",


            viewFilterOptions:

                [],


            viewFilterLoading:

                false,


            viewFilterLoaded:

                false,


            viewFilterError:

                "",


            viewDateValue:

                "",





            /*
                Supplier selection
            */

            suppliers:

                [],


            selectedSupplier:

                "",


            suppliersLoading:

                false,


            suppliersLoaded:

                false,


            supplierLoadError:

                "",





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


            gridLoaded:

                false,


            totalOpportunities:

                0,





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


            ...this.state,


            suppliers:

                [

                    ...this.state.suppliers

                ],


            processes:

                [

                    ...this.state.processes

                ],


            views:

                [

                    ...this.state.views

                ],


            viewFilterOptions:

                [

                    ...this.state.viewFilterOptions

                ],


            rows:

                [

                    ...this.state.rows

                ]


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