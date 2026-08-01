export class ToolbarController {


    constructor(

        appState

    ) {


        this.appState = appState;


        this.element = null;


    }







    mount(element) {


        this.element = element;


        this.render();


        this.bind();


    }







    render() {


        const state =

            this.appState.get();



        const currentMode =

            state.activeView

            ||

            "By View";



        const currentLimit =

            state.rowsLimit === null

            ?

            "all"

            :

            String(

                state.rowsLimit

            );





        this.element.innerHTML = `


        <div class="phoenix-toolbar">


            <div class="phoenix-toolbar-group">


                <label class="phoenix-toolbar-label">

                    Opportunities

                </label>



                <select

                    id="phoenix-opportunity-mode"

                    class="phoenix-toolbar-select"

                >


                    <option value="By View"
                    ${currentMode === "By View" ? "selected" : ""}>

                        By View

                    </option>



                    <option value="By Supplier"
                    ${currentMode === "By Supplier" ? "selected" : ""}>

                        By Supplier

                    </option>



                    <option value="By Status Tracker"
                    ${currentMode === "By Status Tracker" ? "selected" : ""}>

                        By Status Tracker

                    </option>


                </select>


            </div>





            <div class="phoenix-toolbar-group">


                <label class="phoenix-toolbar-label">

                    Rows

                </label>



                <select

                    id="phoenix-row-limit"

                    class="phoenix-toolbar-select"

                >


                    <option value="all"
                    ${currentLimit === "all" ? "selected" : ""}>

                        All

                    </option>


                    <option value="50"
                    ${currentLimit === "50" ? "selected" : ""}>

                        50

                    </option>


                    <option value="100"
                    ${currentLimit === "100" ? "selected" : ""}>

                        100

                    </option>



                    <option value="250"
                    ${currentLimit === "250" ? "selected" : ""}>

                        250

                    </option>



                    <option value="500"
                    ${currentLimit === "500" ? "selected" : ""}>

                        500

                    </option>



                    <option value="1000"
                    ${currentLimit === "1000" ? "selected" : ""}>

                        1000

                    </option>


                </select>


            </div>





            <div class="phoenix-toolbar-group">


                <button

                    id="phoenix-load-dashboard"

                    class="phoenix-toolbar-button"

                >

                    Load Dashboard

                </button>


            </div>


        </div>


        `;


    }







    bind() {


        const modeSelect =

            this.element.querySelector(

                "#phoenix-opportunity-mode"

            );



        const limitSelect =

            this.element.querySelector(

                "#phoenix-row-limit"

            );



        const loadButton =

            this.element.querySelector(

                "#phoenix-load-dashboard"

            );







        if(modeSelect){


            modeSelect.addEventListener(

                "change",

                event => {


                    const mode =

                        event.target.value;



                    console.log(

                        "[PHX MODE CHANGE]",

                        mode

                    );



                    this.appState.update({

                        activeView:

                            mode

                    });


                }

            );


        }







        if(limitSelect){


            limitSelect.addEventListener(

                "change",

                event => {


                    const value =

                        event.target.value;



                    const limit =

                        value === "all"

                        ?

                        null

                        :

                        Number(value);





                    console.log(

                        "[PHX ROW LIMIT CHANGE]",

                        limit

                    );





                    console.log(

                        "[PHX TOOLBAR BEFORE]",

                        this.appState.get()

                    );





                    this.appState.update({

                        rowsLimit:

                            limit

                    });





                    console.log(

                        "[PHX TOOLBAR AFTER]",

                        this.appState.get()

                    );


                }

            );


        }







        if(loadButton){


            loadButton.addEventListener(

                "click",

                ()=>{


                    console.log(

                        "[PHX LOAD DASHBOARD CLICK]",

                        this.appState.get()

                    );



                    window.dispatchEvent(

                        new CustomEvent(

                            "phoenix-dashboard-load"

                        )

                    );


                }

            );


        }


    }


}