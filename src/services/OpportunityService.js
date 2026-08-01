export class OpportunityService {


    constructor(

        repository,

        calculationPipeline = null,

        packSizeDerivationService = null

    ) {


        this.repository = repository;


        this.calculationPipeline =

            calculationPipeline;


        this.packSizeDerivationService =

            packSizeDerivationService;


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

            await this.repository.getRows(

                view,

                limit

            );





        console.log(

            "[PHX SERVICE ROW COUNT]",

            rows?.length || 0

        );





        return (

            rows || []

        ).map(

            row => {


                let hydratedRow = {


                    ...row

                };







                /*
                    Pack Size Derivation

                    RPC already provides:

                    pack_size
                    buy_qty

                    Only derive if missing

                */


                if(

                    this.packSizeDerivationService

                    &&

                    !hydratedRow.pack_size

                ){


                    const derived =

                        this.packSizeDerivationService.derive(

                            hydratedRow

                        );



                    hydratedRow = {


                        ...hydratedRow,


                        ...derived


                    };


                }







                /*
                    Calculation pipeline

                */


                if(

                    this.calculationPipeline

                ){


                    hydratedRow =

                        this.calculationPipeline.run(

                            hydratedRow

                        );


                }







                return {


                    ...hydratedRow,


                    asin:

                        hydratedRow.asin || "",


                    locale:

                        hydratedRow.locale || "",


                    brand:

                        hydratedRow.brand || "",


                    title:

                        hydratedRow.title || "",


                    category:

                        hydratedRow.category || "",


                    supplier:

                        hydratedRow.supplier || "",


                    supplier_price:

                        hydratedRow.supplier_price ?? 0,


                    pack_size:

                        hydratedRow.pack_size ?? 1,


                    buy_qty:

                        hydratedRow.buy_qty ?? 1


                };


            }

        );


    }


}