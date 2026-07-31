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



        console.log(

            "[PHX RAW ROW SAMPLE]",

            rows?.[0]

        );







        const finalRows =


            await Promise.all(


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






                        const finalRow = {


                            ...enrichedRow,



                            asin:

                                enrichedRow.asin

                                ||

                                "",



                            locale:

                                enrichedRow.locale

                                ||

                                "",



                            brand:

                                enrichedRow.brand

                                ||

                                "",



                            title:

                                enrichedRow.title

                                ||

                                "",



                            category:

                                enrichedRow.category

                                ||

                                enrichedRow.category_name

                                ||

                                "",



                            sub_category:

                                enrichedRow.sub_category

                                ||

                                enrichedRow.sub_category_name

                                ||

                                "",



                            validated_sales_price:

                                enrichedRow.validated_sales_price

                                ||

                                0,



                            supplier:

                                enrichedRow.supplier

                                ||

                                "",



                            supplier_price:

                                enrichedRow.supplier_price

                                ||

                                0



                        };





                        console.log(

                            "[PHX FINAL ROW CHECK]",

                            {

                                asin:
                                    finalRow.asin,

                                brand:
                                    finalRow.brand,

                                title:
                                    finalRow.title,

                                category:
                                    finalRow.category,

                                sub_category:
                                    finalRow.sub_category,

                                keys:
                                    Object.keys(finalRow)

                            }

                        );





                        return finalRow;


                    }


                )


            );







        console.log(

            "[PHX FINAL ROWS COMPLETE]",

            {

                count:
                    finalRows.length,

                first:
                    finalRows[0]

            }

        );





        return finalRows;


    }


}