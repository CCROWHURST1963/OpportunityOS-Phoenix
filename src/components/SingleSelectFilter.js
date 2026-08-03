export class SingleSelectFilter {


    constructor(){


        this.container =

            null;


        this.label =

            "";


        this.options =

            [];


        this.selectedValue =

            "";


        this.placeholder =

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

        options = [],

        selectedValue = "",

        placeholder = "",

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

            selectedValue;


        this.placeholder =

            placeholder

            ||

            `Select ${label}`;


        this.onChange =

            onChange;


        this.container.innerHTML = `

<div class="toolbar-pill toolbar-green">

    <span class="toolbar-pill-label">

        ${this.escape(this.label)}

    </span>

    <select id="phoenix-single-select-filter">

        <option value="">

            ${this.escape(this.placeholder)}

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

                option => {


                    const value =

                        String(

                            option

                        );


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

                "#phoenix-single-select-filter"

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






    clear(){


        this.selectedValue =

            "";


        if(

            this.container

        ){


            this.render({

                label:

                    this.label,


                options:

                    this.options,


                selectedValue:

                    "",


                placeholder:

                    this.placeholder,


                onChange:

                    this.onChange

            });


        }


    }






    escape(value){


        return String(

            value

            ??

            ""

        )

            .replaceAll("&","&amp;")

            .replaceAll("<","&lt;")

            .replaceAll(">","&gt;")

            .replaceAll("\"","&quot;")

            .replaceAll("'","&#039;");


    }


}