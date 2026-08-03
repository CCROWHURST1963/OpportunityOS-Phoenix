export class EnrichmentPipeline {


    constructor(enrichers = []){


        this.enrichers =

            Array.isArray(enrichers)

                ? enrichers.filter(Boolean)

                : [];


    }






    async enrichRow(sourceRow){


        if(

            !sourceRow

            ||

            typeof sourceRow !==

                "object"

        ){


            return sourceRow;


        }


        let currentRow =

            sourceRow;


        for(

            const enricher of this.enrichers

        ){


            if(

                !enricher

                ||

                typeof enricher.enrich !==

                    "function"

            ){


                continue;


            }


            try{


                const enrichedRow =

                    await enricher.enrich(

                        currentRow

                    );


                /*
                    Enrichers return a replacement row.

                    We must retain that returned object;
                    otherwise pack_size, buy_qty and
                    pack_source are discarded.
                */


                if(

                    enrichedRow

                    &&

                    typeof enrichedRow ===

                        "object"

                ){


                    currentRow =

                        enrichedRow;


                }


            }

            catch(error){


                console.error(

                    "[PHX ENRICHMENT ERROR]",

                    {

                        enricher:

                            enricher.constructor?.name

                            ||

                            "UnknownEnricher",


                        asin:

                            currentRow?.asin

                            ||

                            "",


                        error:

                            error

                    }

                );


                /*
                    Do not prevent the remaining dashboard
                    rows from loading when one enrichment
                    operation fails.
                */


            }


        }


        return currentRow;


    }






    async enrichRows(rows = []){


        if(!Array.isArray(rows)){


            return [];


        }


        const enrichedRows =

            [];


        for(

            const row of rows

        ){


            enrichedRows.push(

                await this.enrichRow(

                    row

                )

            );


        }


        return enrichedRows;


    }






    /*
        Compatibility entry point.

        Supports both:

        enrichmentPipeline.enrich(row)

        and:

        enrichmentPipeline.enrich(rows)
    */


    async enrich(source){


        if(Array.isArray(source)){


            return this.enrichRows(

                source

            );


        }


        return this.enrichRow(

            source

        );


    }


}