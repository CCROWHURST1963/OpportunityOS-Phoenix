export class HeaderController {


    constructor(

        state

    ) {


        this.state =
            state;


        this.element =
            null;


        this.unsubscribe =
            null;


    }





    mount(element) {


        this.element =

            element;



        this.render();



        this.unsubscribe =

            this.state.subscribe(

                () => {

                    this.render();

                }

            );


    }





    render() {


        if (!this.element) {


            return;


        }



        const state =

            this.state.getState();




        const userName =

            state.userName
            ||
            "Loading User";



        const role =

            state.role
            ||
            "User";




        const process =

            state.process
            ||
            "Can We Sell";



        const currentView =

            state.currentView
            ||
            "Default";




        this.element.innerHTML = `



            <div class="phoenix-header">



                <div class="phoenix-header-user">


                    <span class="header-label">
                        User
                    </span>


                    <span class="header-value">
                        ${userName} (${role})
                    </span>


                </div>




                <div class="phoenix-header-context">


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