export class AmazonPackInfoEnricher {


    constructor(

        packRepository,

        packSizeDerivationService

    ){


        this.packRepository =
            packRepository;


        this.packSizeDerivationService =
            packSizeDerivationService;



        console.log(

            "[PHX-038 PACK DEPENDENCY CHECK]",

            {

                packRepository:
                    !!packRepository,


                packSizeDerivationService:
                    !!packSizeDerivationService

            }

        );


    }







    async enrich(row){



        if(!row || !row.asin){


            return row;


        }





        /*
            Manual pack info lookup only
            if repository exists.
        */


        let packInfo = null;



        if(

            this.packRepository &&

            row.locale

        ){


            packInfo =

                await this.packRepository
                    .getPackInfo(

                        row.asin,

                        row.locale

                    );


        }








        if(

            packInfo &&

            Number(packInfo.pack_size) > 0

        ){


            return {


                ...row,


                pack_size:

                    Number(packInfo.pack_size),



                buy_qty:

                    packInfo.buy_qty || null,



                pack_source:

                    "Manual"



            };


        }









        /*
            Derive pack size
        */


        if(

            this.packSizeDerivationService &&

            typeof this.packSizeDerivationService.derive === "function"

        ){


            const derived =

                this.packSizeDerivationService
                    .derive(row);





            return {


                ...row,


                pack_size:

                    derived.pack_size,



                buy_qty:

                    row.buy_qty || null,



                pack_source:

                    derived.pack_source



            };


        }








        return row;



    }



}