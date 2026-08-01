export class OpportunityService {


    constructor(

        repository,

        calculationPipeline = null,

        enrichmentPipeline = null

    ){


        this.repository =
            repository;


        this.calculationPipeline =
            calculationPipeline;


        this.enrichmentPipeline =
            enrichmentPipeline;


    }





    async getRows(

        view = "default",

        limit = null

    ){


        console.log(

            "[PHX SERVICE REQUEST]",

            {

                view,

                limit

            }

        );





        const rows =

            await this.repository

                .getRows(

                    view,

                    limit

                );





        return await Promise.all(


            (rows || []).map(

                async row=>{


                    let enrichedRow = {


                        ...row


                    };





                    if(this.enrichmentPipeline){


                        enrichedRow =

                            await this.enrichmentPipeline.run(

                                enrichedRow

                            );


                    }





                    if(this.calculationPipeline){


                        enrichedRow =

                            this.calculationPipeline.run(

                                enrichedRow

                            );


                    }





                    return enrichedRow;


                }


            )


        );


    }


}