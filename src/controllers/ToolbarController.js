export class ToolbarController {


    constructor(

        appState,

        viewState

    ){


        this.appState = appState;

        this.viewState = viewState;

        this.element = null;

        this.openTools = false;


    }








    mount(element){


        this.element = element;


        this.render();


        this.bind();


    }









    render(){


        if(!this.element){

            return;

        }





        const state =

            this.appState.getState();





        const process =

            state.process

            ||

            "Can We Sell";





        const opportunityMode =

            state.opportunityMode

            ||

            "By View";





        const rowsLimit =

            state.rowsLimit

            ||

            100;







        this.element.innerHTML = `



<div class="phoenix-toolbar">





    <div class="phoenix-toolbar-top">





        <div class="toolbar-pill toolbar-green">


            <span class="toolbar-pill-label">

                Process

            </span>



            <select id="phoenix-process">


                <option>

                    ${process}

                </option>


            </select>



        </div>








        <div class="toolbar-pill toolbar-green">


            <span class="toolbar-pill-label">

                Opportunities

            </span>



            <select id="phoenix-opportunity-mode">


                <option>

                    ${opportunityMode}

                </option>


                <option>

                    By View

                </option>


                <option>

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





        <div class="toolbar-pill toolbar-green">


            <span class="toolbar-pill-label">

                Load Rows

            </span>



            <select id="phoenix-row-limit">


                <option value="100"

                ${rowsLimit === 100 ? "selected" : ""}

                >

                    100

                </option>



                <option value="250"

                ${rowsLimit === 250 ? "selected" : ""}

                >

                    250

                </option>



                <option value="500"

                ${rowsLimit === 500 ? "selected" : ""}

                >

                    500

                </option>



                <option value="1000"

                ${rowsLimit === 1000 ? "selected" : ""}

                >

                    1000

                </option>


            </select>



        </div>









        <button class="toolbar-button orange">

            ⚠ Open Hazmat Check

        </button>








        <button class="toolbar-button blue">

            ↗ View Opportunities

        </button>








        <button class="toolbar-button green">

            🔍 Search Master Price File

        </button>








        <button

            id="phoenix-tools"

            class="toolbar-button tools"

        >

            ⚙ Tools ▼

        </button>





    </div>





</div>



`;



    }









    bind(){



        const loadButton =

            this.element.querySelector(

                "#phoenix-load-dashboard"

            );



        if(loadButton){


            loadButton.onclick = () => {


                document.dispatchEvent(

                    new CustomEvent(

                        "phoenix-load-dashboard"

                    )

                );


            };


        }







        const rowsSelect =

            this.element.querySelector(

                "#phoenix-row-limit"

            );



        if(rowsSelect){


            rowsSelect.onchange = e => {


                this.appState.update({

                    rowsLimit:

                        Number(

                            e.target.value

                        )

                });


            };


        }








        const processSelect =

            this.element.querySelector(

                "#phoenix-process"

            );



        if(processSelect){


            processSelect.onchange = e => {


                this.appState.update({

                    process:

                        e.target.value

                });


            };


        }








        const opportunitySelect =

            this.element.querySelector(

                "#phoenix-opportunity-mode"

            );



        if(opportunitySelect){


            opportunitySelect.onchange = e => {


                this.appState.update({

                    opportunityMode:

                        e.target.value

                });


            };


        }



    }



}