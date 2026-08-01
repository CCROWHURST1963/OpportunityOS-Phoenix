export class HeaderController {


    constructor(state){


        this.state = state;

        this.element = null;

        this.unsubscribe = null;


    }






    mount(element){


        this.element = element;


        this.render();




        this.unsubscribe =

            this.state.subscribe(

                () => this.render()

            );


    }








    render(){



        if(!this.element)

            return;





        const state =

            this.state.getState();








        const userName =

            state.userName

            ||

            state.user?.user_name

            ||

            "User";







        const role =

            state.role

            ||

            state.user?.role

            ||

            "User";







        const process =

            state.process

            ||

            "";







        const currentView =

            state.currentView

            ||

            "";







        this.element.innerHTML = `


<div class="phoenix-header">



    <div class="phoenix-header-left">



        <div class="phoenix-logo">


            <strong>

                OpportunityOS

            </strong>


        </div>







        <div class="header-pill">


            <span class="header-label">

                User

            </span>


            <span class="header-value">

                ${userName} (${role})

            </span>


        </div>








        <div class="header-pill">


            <span class="header-label">

                Process

            </span>


            <span class="header-value">

                ${process}

            </span>


        </div>








        <div class="header-pill">


            <span class="header-label">

                Current View

            </span>


            <span class="header-value">

                ${currentView}

            </span>


        </div>





    </div>



</div>


`;



    }



}