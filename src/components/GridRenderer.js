export class GridRenderer {


    constructor() {

        this.container = null;

    }



    render(container, columns, rows = []) {


        this.container = container;



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


                            ${columns.map(column => `


                                <div
                                    class="phoenix-grid-cell"
                                    style="width:${column.width}px"
                                >

                                    ${row[column.field] ?? ""}

                                </div>


                            `).join("")}


                        </div>


                    `).join("")

                }


            </div>


        `;


    }


}