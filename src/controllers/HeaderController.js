export class HeaderController {


    constructor(state){


        this.state =

            state;


        this.element =

            null;


        this.unsubscribe =

            null;


    }






    mount(element){


        this.element =

            element;


        this.render();





        if(this.unsubscribe){


            this.unsubscribe();


        }





        this.unsubscribe =

            this.state.subscribe(

                () =>

                    this.render()

            );


    }






    escapeHtml(value){


        return String(

            value

            ??

            ""

        )

            .replaceAll(

                "&",

                "&amp;"

            )

            .replaceAll(

                "<",

                "&lt;"

            )

            .replaceAll(

                ">",

                "&gt;"

            )

            .replaceAll(

                "\"",

                "&quot;"

            )

            .replaceAll(

                "'",

                "&#039;"

            );


    }






    renderTotalOpportunitiesPill(state){


        if(

            state.gridLoaded !== true

        ){


            return "";


        }





        const totalOpportunities =

            Number.isFinite(

                Number(

                    state.totalOpportunities

                )

            )

                ? Number(

                    state.totalOpportunities

                )

                : 0;





        return `

            <div

                class="header-pill"

                id="phoenix-total-opportunities-pill"

            >


                <span class="header-label">

                    Total Opportunities

                </span>


                <span class="header-value">

                    ${totalOpportunities}

                </span>


            </div>

        `;


    }






    render(){


        if(!this.element){


            return;


        }





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





        const totalOpportunitiesPill =

            this.renderTotalOpportunitiesPill(

                state

            );





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

                ${this.escapeHtml(userName)}
                (${this.escapeHtml(role)})

            </span>


        </div>








        <div class="header-pill">


            <span class="header-label">

                Process

            </span>


            <span class="header-value">

                ${this.escapeHtml(process)}

            </span>


        </div>








        <div class="header-pill">


            <span class="header-label">

                Current View

            </span>


            <span class="header-value">

                ${this.escapeHtml(currentView)}

            </span>


        </div>








        ${totalOpportunitiesPill}



    </div>



</div>


`;


    }


}