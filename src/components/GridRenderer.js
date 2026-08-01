import { ColumnRegistry }
    from "../services/ColumnRegistry.js";



export class GridRenderer {


    constructor() {


        this.container = null;


        this.columnRegistry =

            new ColumnRegistry();


    }






    render(

        container,

        columns,

        rows = []

    ) {


        this.container = container;



        console.log(

            "[PHX GRID COLUMNS RECEIVED]",

            columns

        );


        console.log(

            "[PHX GRID ROWS RECEIVED]",

            rows

        );







        container.innerHTML = `


            <div class="phoenix-grid">


                <div class="phoenix-grid-row phoenix-grid-head">


                    ${columns.map(column => `

                        <div

                            class="phoenix-grid-cell"

                            style="width:${column.width}px"

                        >

                            ${column.label}

                        </div>

                    `).join("")}


                </div>





                ${
                    rows.length === 0

                    ?

                    `

                    <div class="phoenix-grid-empty">

                        No opportunities loaded

                    </div>

                    `

                    :

                    rows.map(row => `


                        <div class="phoenix-grid-row">


                            ${columns.map(column => {


                                const value =

                                    this.columnRegistry.getValue(

                                        column.field,

                                        row

                                    );



                                return `


                                <div

                                    class="phoenix-grid-cell"

                                    style="width:${column.width}px"

                                >

                                    ${value ?? ""}

                                </div>


                                `;


                            }).join("")}


                        </div>


                    `).join("")

                }


            </div>


        `;


    }


}