export class ViewConfigService {


    constructor(

        viewConfigRepository

    ) {


        this.viewConfigRepository =

            viewConfigRepository;


        this.views = {};

        this.currentView = null;



        console.log(

            "[PHX VIEW CONFIG SERVICE CONSTRUCTED]",

            {

                repository:

                    !!viewConfigRepository

            }

        );


    }







    async loadViews(

        userKey = "DEFAULT"

    ) {


        console.log(

            "[PHX VIEW LOAD START]",

            {

                userKey

            }

        );



        try {


            const rawViews =

                await this.viewConfigRepository

                    .getViews(

                        userKey

                    );





            console.log(

                "[PHX RAW VIEW CONFIG]",

                rawViews

            );





            this.parseViews(

                rawViews

            );





            console.log(

                "[PHX PARSED VIEWS]",

                this.views

            );





            if (

                !this.currentView

            ) {


                const preferredView =

                    "Can We Sell";





                this.currentView =

                    this.views[preferredView]

                    ?

                    preferredView

                    :

                    Object.keys(

                        this.views

                    )[0]

                    ||

                    null;


            }





            console.log(

                "[PHX ACTIVE VIEW]",

                this.currentView

            );





            return this.views;


        }


        catch(error){


            console.error(

                "[PHX VIEW LOAD ERROR]",

                error

            );


            throw error;


        }


    }









    async getProcesses(){


        console.log(

            "[PHX PROCESS LOAD START]"

        );



        try {


            const processes =

                await this.viewConfigRepository

                    .getProcesses();





            console.log(

                "[PHX PROCESS LOAD RESULT]",

                processes

            );





            return processes || [];



        }


        catch(error){


            console.error(

                "[PHX PROCESS LOAD ERROR]",

                error

            );


            return [];


        }


    }









    parseViews(raw){


        console.log(

            "[PHX PARSE INPUT]",

            raw

        );



        this.views = {};



        if(

            !raw

        ){


            return;


        }







        let configs = [];



        if(

            Array.isArray(raw)

        ){


            configs = raw;


        }

        else if(

            Array.isArray(raw.views)

        ){


            configs = raw.views;


        }

        else{


            configs = [

                raw

            ];


        }







        configs.forEach(

            (config,index)=>{


                let viewConfig =

                    config.view_config

                    ||

                    config.config

                    ||

                    config;





                if(

                    typeof viewConfig === "string"

                ){


                    viewConfig =

                        JSON.parse(

                            viewConfig

                        );


                }







                const name =


                    config.name

                    ||

                    config.view_name

                    ||

                    config.active_view

                    ||

                    config.process_view

                    ||

                    viewConfig.name

                    ||

                    `view_${index}`;








                const columns =

                    viewConfig.columns

                    ||

                    [];







                this.views[name] = {


                    id:

                        config.id

                        ||

                        name,



                    name,



                    columns:

                        columns.map(

                            column=>{


                                return {


                                    ...column,



                                    key:

                                        column.key

                                        ||

                                        column.field

                                        ||

                                        column.id,



                                    field:

                                        column.field

                                        ||

                                        column.key

                                        ||

                                        column.id,



                                    label:

                                        column.label

                                        ||

                                        column.title

                                        ||

                                        column.name

                                        ||

                                        column.key,



                                    width:

                                        Number(

                                            column.width

                                            ||

                                            column.column_width

                                            ||

                                            column.width_px

                                        )

                                        ||

                                        null,



                                    visible:

                                        column.visible !== false


                                };


                            }

                        )


                };


            }

        );


    }









    getColumns(

        name = null

    ){


        const viewName =

            name

            ||

            this.currentView;





        const view =

            this.views[viewName];





        console.log(

            "[PHX GET COLUMNS]",

            {

                viewName,

                count:

                    view?.columns?.length

            }

        );





        if(

            !view

        ){


            console.error(

                "[PHX VIEW NOT FOUND]",

                viewName

            );


            return [];


        }





        return view.columns.filter(

            column =>

                column.visible !== false

        );


    }









    getCurrentView(){


        return this.views[

            this.currentView

        ];


    }









    setCurrentView(

        name

    ){


        console.log(

            "[PHX SET VIEW]",

            name

        );





        if(

            this.views[name]

        ){


            this.currentView = name;


        }


    }


}