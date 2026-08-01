export class HeaderController {


    constructor(state) {


        this.state = state;

        this.element = null;

        this.unsubscribe = null;


    }







    mount(element) {


        this.element = element;


        this.render();



        this.unsubscribe =

            this.state.subscribe(

                () => {

                    this.render();

                }

            );


    }







    render(){


        if(!this.element){

            return;

        }




        const state =

            this.state.getState();





        const userName =

            state.userName ||

            "Loading User";





        const role =

            state.role ||

            "User";





        const currentView =

            state.currentView ||

            "default";









        this.element.innerHTML = `



<div class="phoenix-header">



    <div class="header-context-group">





        <div class="header-pill">


            <span class="header-label">

                User

            </span>


            <span class="header-value">

                ${userName} (${role})

            </span>


        </div>









        <div class="header-pill header-view-pill">


            <span class="header-label">

                Current View

            </span>


            <select id="phoenix-header-view">


                <option>

                    ${currentView}

                </option>


            </select>


        </div>





    </div>








    <div class="phoenix-logo">


        Opportunity<span>OS</span>


    </div>



</div>



`;



    }



}