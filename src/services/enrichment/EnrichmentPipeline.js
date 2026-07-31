export class EnrichmentPipeline {


    constructor(enrichers = []) {


        this.enrichers =
            enrichers;


    }



    async run(row) {


        let enrichedRow = {


            ...row


        };



        for (

            const enricher of this.enrichers

        ) {


            if (

                !enricher ||

                typeof enricher.enrich !== "function"

            ) {


                continue;


            }



            enrichedRow =

                await enricher.enrich(

                    enrichedRow

                );


        }



        return enrichedRow;


    }


}