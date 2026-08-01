export class OpportunityService {



    constructor(

        repository,

        enrichmentPipeline

    ){


        this.repository = repository;


        this.enrichmentPipeline = enrichmentPipeline;


    }









    async getRows(params){



        console.log(

            "[PHX SERVICE REQUEST]",

            params

        );








        /*
            DashboardController sends:

            {
                process,
                view,
                limit
            }

            Repository expects:

            getRows(
                view,
                limit
            )

            IMPORTANT:
            Only pass the view string.
        */







        const view =

            typeof params.view === "string"

            ?

            params.view

            :

            params.view?.active_view

            ||

            params.view?.process_view

            ||

            "";







        const limit =

            params.limit

            ||

            100;







        console.log(

            "[PHX SERVICE NORMALISED]",

            {

                view,

                limit

            }

        );









        const rows =

            await this.repository.getRows(

                view,

                limit

            );







        console.log(

            "[PHX RAW ROW COUNT]",

            rows.length

        );








        console.log(

            "[PHX FIRST RAW ROW]",

            rows[0]

        );








        /*
            Run enrichment.

            Must use Promise.all.
            Do NOT return Promise[].
        */





        const processedRows =

            await Promise.all(



                rows.map(

                    async row => {



                        if(


                            this.enrichmentPipeline &&


                            typeof this.enrichmentPipeline.run === "function"


                        ){



                            return await this.enrichmentPipeline.run(

                                row

                            );



                        }





                        return row;



                    }

                )



            );








        console.log(

            "[PHX PROCESSED ROW COUNT]",

            processedRows.length

        );








        console.log(

            "[PHX FIRST PROCESSED ROW]",

            processedRows[0]

        );








        return processedRows;



    }



}