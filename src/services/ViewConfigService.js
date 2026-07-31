import { ViewColumnAdapter }
    from "./ViewColumnAdapter.js";



export class ViewConfigService {


    constructor(

        viewConfigRepository

    ) {


        this.viewConfigRepository =

            viewConfigRepository;



        this.columnAdapter =

            new ViewColumnAdapter();



        this.views = {};



        this.currentView =

            "default";


    }





    async loadViews(

        process = "Can We Sell",

        userKey = "DEFAULT"

    ) {


        let loaded = false;



        try {


            const rawViews =

                await this.viewConfigRepository
                    .getViews(

                        userKey

                    );



            console.log(

                "[PHX VIEW CONFIG RAW]",

                rawViews

            );



            const processViews =

                rawViews.filter(

                    view =>

                        view.process_view

                        ===

                        process

                );



            console.log(

                "[PHX VIEW CONFIG PROCESS FILTER]",

                {

                    process,

                    count:

                        processViews.length

                }

            );



            if (

                processViews.length > 0

            ) {


                this.views = {};



                processViews.forEach(

                    view => {


                        const config =

                            view.view_config;



                        const adaptedColumns =

                            this.columnAdapter
                                .adaptColumns(

                                    config.columns || []

                                );



                        console.log(

                            "[PHX ADAPTED COLUMNS]",

                            adaptedColumns

                        );



                        this.views[

                            view.active_view

                        ] = {


                            id:

                                view.active_view,


                            name:

                                view.active_view,


                            columns:

                                adaptedColumns,


                            raw:

                                config


                        };


                    }

                );



                this.currentView =

                    processViews[0]

                        .active_view;



                loaded = true;


            }


        }


        catch(error) {


            console.error(

                "[PHX VIEW CONFIG LOAD FAILED]",

                error

            );


        }





        if (!loaded) {


            this.loadDefaultView();


        }


    }





    loadDefaultView() {


        this.views = {


            default:

            {


                id:

                    "default",


                name:

                    "Default View",


                columns:

                [


                    {

                        field:

                            "asin",

                        label:

                            "ASIN",

                        width:

                            140,

                        visible:

                            true

                    },


                    {

                        field:

                            "brand",

                        label:

                            "Brand",

                        width:

                            180,

                        visible:

                            true

                    },


                    {

                        field:

                            "title",

                        label:

                            "Product",

                        width:

                            320,

                        visible:

                            true

                    },


                    {

                        field:

                            "validated_sales_price",

                        label:

                            "Sales Price",

                        width:

                            120,

                        visible:

                            true

                    },


                    {

                        field:

                            "opportunity_score",

                        label:

                            "Score",

                        width:

                            100,

                        visible:

                            true

                    },


                    {

                        field:

                            "buy_signal",

                        label:

                            "Buy Signal",

                        width:

                            150,

                        visible:

                            true

                    },


                    {

                        field:

                            "status",

                        label:

                            "Status",

                        width:

                            120,

                        visible:

                            true

                    }


                ]


            }


        };



        this.currentView =

            "default";


    }





    getCurrentViewName() {


        return this.currentView;


    }





    getCurrentView() {


        return this.views[

            this.currentView

        ];


    }





    setCurrentView(name) {


        if (

            this.views[name]

        ) {


            this.currentView = name;


        }


    }





    getColumns(name = null) {


        const viewName =

            name

            ||

            this.currentView;



        const view =

            this.views[

                viewName

            ];



        if (!view) {


            return [];


        }



        return view.columns;


    }


}