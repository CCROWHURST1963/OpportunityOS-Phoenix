export class ToolbarController {


    constructor(

        appState,

        viewState

    ) {


        this.appState = appState;

        this.viewState = viewState;

        this.element = null;

        this.openTools = false;


    }







    mount(element){


        this.element = element;


        this.render();


        this.bind();



        this.unsubscribe =

            this.appState.subscribe(

                () => {


                    this.render();

                    this.bind();


                }

            );


    }









    render(){


        if(!this.element){

            return;

        }




        const state =

            this.appState.getState();





        const processes =

            state.processes || [];





        const process =

            state.process ||

            "Can We Sell";





        const opportunityMode =

            state.opportunityMode ||

            "By View";





        const rowsLimit =

            state.rowsLimit ||

            "100";





        const role =

            String(

                state.role || ""

            ).toLowerCase();





        const isAdmin =

            role === "admin";









        this.element.innerHTML = `



<div class="phoenix-toolbar">



<div class="phoenix-toolbar-top">







<div class="toolbar-pill">


    <span class="toolbar-pill-label">

        Process

    </span>



    <select id="phoenix-process">


        ${
            processes.length

            ?

            processes.map(

                p => `

                <option

                    value="${p.process_name}"

                    ${
                        p.process_name === process

                        ?

                        "selected"

                        :

                        ""

                    }

                >

                    ${p.process_name}

                </option>

                `

            ).join("")


            :

            `

            <option>

                ${process}

            </option>

            `

        }


    </select>


</div>









<div class="toolbar-pill">


    <span class="toolbar-pill-label">

        Opportunities

    </span>



    <select id="phoenix-opportunity-mode">


        <option

        ${
            opportunityMode === "By View"

            ?

            "selected"

            :

            ""

        }

        >

            By View

        </option>




        <option

        ${
            opportunityMode === "By Supplier"

            ?

            "selected"

            :

            ""

        }

        >

            By Supplier

        </option>


    </select>


</div>









<button

    id="phoenix-load-dashboard"

    class="toolbar-button blue"

>

    Load Dashboard

</button>





</div>








<div class="phoenix-toolbar-bottom">







<div class="toolbar-pill">


    <span class="toolbar-pill-label">

        Load Rows

    </span>



    <select id="phoenix-row-limit">


        <option>

            ${rowsLimit}

        </option>


        <option>

            100

        </option>


        <option>

            250

        </option>


        <option>

            500

        </option>


        <option>

            1000

        </option>


    </select>


</div>
<button

    class="toolbar-button orange"

>

    ⚠ Open Hazmat Check

</button>






<button

    class="toolbar-button blue"

>

    ↗ View Opportunities

</button>






<button

    class="toolbar-button green"

>

    🔍 Search Master Price File

</button>






<div class="tools-wrapper">



    <button

        id="phoenix-tools"

        class="toolbar-button tools"

    >

        ⚙ Tools ▼

    </button>







    ${

        this.openTools

        ?

        `

        <div class="tools-menu">


            <div>

                Custom Views

            </div>



            <div>

                Constants

            </div>



            ${

            isAdmin

            ?

            `


            <hr>


            <div>

                Assign To User

            </div>


            <div>

                Apply Assignment

            </div>


            <div>

                Opportunity Scoring

            </div>


            <div>

                PurchaseOS

            </div>


            <div>

                OrderOS

            </div>


            `

            :

            ""

            }



        </div>

        `

        :

        ""

    }



</div>



</div>



</div>


`;



    }









    bind(){



        const tools =

            this.element.querySelector(

                "#phoenix-tools"

            );



        if(tools){


            tools.onclick = () => {


                this.openTools =

                    !this.openTools;


                this.render();

                this.bind();


            };


        }









        const process =

            this.element.querySelector(

                "#phoenix-process"

            );



        if(process){


            process.onchange = e => {


                this.appState.update({

                    process:

                        e.target.value

                });


            };


        }









        const mode =

            this.element.querySelector(

                "#phoenix-opportunity-mode"

            );



        if(mode){


            mode.onchange = e => {


                this.appState.update({

                    opportunityMode:

                        e.target.value

                });


            };


        }









        const rows =

            this.element.querySelector(

                "#phoenix-row-limit"

            );



        if(rows){


            rows.onchange = e => {


                this.appState.update({

                    rowsLimit:

                        e.target.value

                });


            };


        }



    }


}