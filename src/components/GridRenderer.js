import { ColumnRegistry }
    from "../services/ColumnRegistry.js";


import { EDITABLE_COLUMNS }
    from "../config/EditableColumns.js";



export class GridRenderer {


    constructor(){


        this.container = null;


        this.columnRegistry =

            new ColumnRegistry();


    }







    createSelectionColumn(){


        return {


            field:"_selected",

            label:"",

            width:50,

            system:true


        };


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





        /*
            SYSTEM COLUMNS

            Always injected.

            Not controlled by Custom View Builder.

        */


        const renderColumns = [

            this.createSelectionColumn(),

            ...columns

        ];







        console.log(

            "[PHX GRID FIELD LIST]",

            renderColumns.map(

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

                    renderColumns.map(column => `



                        <div

                            class="phoenix-grid-cell phoenix-grid-header-cell"

                            style="${

                                this.getColumnStyle(

                                    column

                                )

                            }"

                        >



                            ${

                                column.field === "_selected"



                                ?



                                `

                                <input

                                    type="checkbox"

                                    class="phoenix-select-all"

                                >

                                `



                                :



                                (

                                    column.label

                                    ||

                                    column.header

                                    ||

                                    column.field

                                    ||

                                    ""

                                )



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

                            renderColumns.map(column => {



                                let content = "";







                                /*
                                    ROW SELECT CHECKBOX
                                */


                                if(

                                    column.field === "_selected"

                                ){



                                    content = `



                                        <input

                                            type="checkbox"

                                            class="phoenix-row-selector"

                                            data-asin="${

                                                row.asin || ""

                                            }"

                                        >



                                    `;



                                }



                                else {



                                    const value =


                                        this.columnRegistry.getValue(

                                            column.field,

                                            row

                                        );







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



                                    else {



                                        content =

                                            value ?? "";



                                    }



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