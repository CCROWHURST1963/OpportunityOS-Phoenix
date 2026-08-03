export class LookupFilter {


    constructor(){


        this.container =

            null;


        this.options =

            [];


        this.selectedValue =

            "";


        this.label =

            "";


        this.onChange =

            null;


    }






    mount(

        container

    ){


        this.container =

            container;


    }






    render({

        label,

        options,

        selectedValue,

        onChange

    }){


        if(

            !this.container

        ){


            return;


        }


        this.label =

            label;


        this.options =

            Array.isArray(

                options

            )

                ? options

                : [];


        this.selectedValue =

            selectedValue

            ||

            "";


        this.onChange =

            onChange;


        this.container.innerHTML = `

<div class="toolbar-pill toolbar-green">

    <span class="toolbar-pill-label">

        ${label}

    </span>

    <select id="phoenix-lookup-filter">

        <option value="">

            Select ${label}

        </option>

        ${this.buildOptions()}

    </select>

</div>

`;


        this.bind();


    }






    buildOptions(){


        return this.options

            .map(

                value => {


                    const selected =

                        value ===

                        this.selectedValue

                            ? "selected"

                            : "";


                    return `

<option

    value="${this.escape(value)}"

    ${selected}

>

${this.escape(value)}

</option>

`;


                }

            )

            .join(

                ""

            );


    }






    bind(){


        const select =

            this.container.querySelector(

                "#phoenix-lookup-filter"

            );


        if(

            !select

        ){


            return;


        }


        select.onchange =

            event => {


                this.selectedValue =

                    event.target.value;


                if(

                    typeof this.onChange ===

                    "function"

                ){


                    this.onChange(

                        this.selectedValue

                    );


                }


            };


    }






    escape(value){


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


}