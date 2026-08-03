export class SupplierOpportunityService {


    constructor(

        repository,

        enrichmentPipeline

    ){


        this.repository =

            repository;


        this.enrichmentPipeline =

            enrichmentPipeline;


    }






    normaliseSupplierName(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseLimit(value){


        const parsed =

            Number(

                value

            );


        if(

            !Number.isFinite(parsed)

            ||

            parsed <= 0

        ){


            return 100;


        }


        return Math.floor(

            parsed

        );


    }






    async enrichRow(row){


        if(

            this.enrichmentPipeline

            &&

            typeof this.enrichmentPipeline.run ===

                "function"

        ){


            return await this.enrichmentPipeline.run(

                row

            );


        }


        return row;


    }






    async getRows({

        supplier,

        limit = 100

    } = {}){


        const selectedSupplier =

            this.normaliseSupplierName(

                supplier

            );


        if(!selectedSupplier){


            throw new Error(

                "Select a supplier before loading the dashboard"

            );


        }


        const resolvedLimit =

            this.normaliseLimit(

                limit

            );


        console.log(

            "[PHX SUPPLIER SERVICE REQUEST]",

            {

                supplier:

                    selectedSupplier,


                limit:

                    resolvedLimit

            }

        );


        const rows =

            await this.repository.getRows({

                supplier:

                    selectedSupplier,


                limit:

                    resolvedLimit

            });


        console.log(

            "[PHX RAW SUPPLIER ROW COUNT]",

            rows.length

        );


        const processedRows =

            await Promise.all(

                rows.map(

                    row =>

                        this.enrichRow(

                            row

                        )

                )

            );


        console.log(

            "[PHX PROCESSED SUPPLIER ROW COUNT]",

            processedRows.length

        );


        return processedRows;


    }


}