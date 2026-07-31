export class OpportunityService {


    constructor(

        repository,

        calculationPipeline = null,

        enrichmentPipeline = null

    ) {


        this.repository =
            repository;


        this.calculationPipeline =
            calculationPipeline;


        this.enrichmentPipeline =
            enrichmentPipeline;


    }



    async getRows(view = "default") {


        console.log(
            "[PHX-038 getRows START]",
            view
        );



        const rows =

            await this.repository.getRows(
                view
            );






        return await Promise.all(


            (rows || []).map(

                async row => {


                    let enrichedRow = {


                        ...row


                    };



                    /*
                        Phase 1:
                        Data enrichment
                    */


                    if (

                        this.enrichmentPipeline

                    ) {


                        enrichedRow =

                            await this.enrichmentPipeline.run(

                                enrichedRow

                            );


                    }



                    /*
                        Phase 2:
                        Business calculations
                    */


                    if (

                        this.calculationPipeline

                    ) {


                        enrichedRow =

                            this.calculationPipeline.run(

                                enrichedRow

                            );


                    }

                    return {


                        ...enrichedRow,


                        asin:
                            enrichedRow.asin || "",


                        locale:
                            enrichedRow.locale || "",


                        brand:
                            enrichedRow.brand || "",


                        title:
                            enrichedRow.title || "",


                        validated_sales_price:
                            enrichedRow.validated_sales_price || 0,


                        supplier:
                            enrichedRow.supplier || "",


                        supplier_price:
                            enrichedRow.supplier_price || 0


                    };


                }


            )


        );


    }


}