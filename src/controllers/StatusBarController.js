export class StatusBarController {


    constructor(

        appState

    ) {


        this.appState =

            appState;


        this.element =

            null;


        this.unsubscribe =

            null;


    }







    mount(element){


        this.element =

            element;


        this.render();



        this.unsubscribe =

            this.appState.subscribe(

                () => {


                    this.render();


                }

            );


    }








    render(){


        if(!this.element){

            return;

        }





        /*
            Status bar intentionally empty.

            Future versions will use this area
            for dashboard progress states:

            Dashboard Loading
            Total Opportunities - N
            Total Leads - N

        */


        this.element.innerHTML = "";


    }



}