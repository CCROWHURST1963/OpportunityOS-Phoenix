import { ColumnRegistry }
    from "../services/ColumnRegistry.js";


import { EDITABLE_COLUMNS }
    from "../config/EditableColumns.js";



export class GridRenderer {


    constructor() {


        this.container = null;


        this.columnRegistry =

            new ColumnRegistry();


    }







    isEditable(field){


        return EDITABLE_COLUMNS.includes(

            field

        );


    }







    getColumnStyle(column){


        if(

            !column ||

            !column.width

        ){

            return "";

        }



        return `

            width:${column.width}px;

            min-width:${column.width}px;

            max-width:${column.width}px;

            flex:0 0 ${column.width}px;

            box-sizing:border-box;

        `;


    }








    render(

        container,

        columns,

        rows = []

    ){


        this.container = container;





        console.log(

            "[PHX GRID COLUMNS RECEIVED]",

            columns

        );





        console.log(

            "[PHX GRID FIELD LIST]",

            columns.map(

                c => c.field

            )

        );





        console.log(

            "[PHX EDITABLE CONFIG]",

            EDITABLE_COLUMNS

        );





        console.log(

            "[PHX EDITABLE MATCHES]",

            columns.filter(

                c =>

                    this.isEditable(

                        c.field

                    )

            )

        );








        container.innerHTML = `



            <div class="phoenix-grid">





                <div class="phoenix-grid-row phoenix-grid-head">


                    ${

                        columns.map(column => `


                            <div

                                class="phoenix-grid-cell phoenix-grid-header-cell"

                                style="${

                                    this.getColumnStyle(

                                        column

                                    )

                                }"

                            >

                                ${

                                    column.label

                                    ||

                                    column.field

                                    ||

                                    ""

                                }


                            </div>


                        `).join("")

                    }



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





                            ${



                                columns.map(column => {



                                    const value =


                                        this.columnRegistry.getValue(

                                            column.field,

                                            row

                                        );







                                    let content =

                                        value ?? "";







                                    if(

                                        this.isEditable(

                                            column.field

                                        )

                                    ){



                                        content = `



                                            <input

                                                class="phoenix-grid-input"

                                                value="${

                                                    value ?? ""

                                                }"

                                                data-field="${

                                                    column.field

                                                }"

                                                data-asin="${

                                                    row.asin || ""

                                                }"

                                            >



                                        `;



                                    }









                                    return `



                                        <div

                                            class="phoenix-grid-cell"

                                            style="${

                                                this.getColumnStyle(

                                                    column

                                                )

                                            }"

                                        >

                                            ${content}

                                        </div>



                                    `;



                                }).join("")



                            }







                        </div>



                    `).join("")



                }





            </div>



        `;



    }



}