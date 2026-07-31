export class AmazonPackInfoEnricher {


    constructor(

        packRepository,

        packSizeDerivationService

    ) {


        this.packRepository =
            packRepository;


        this.packSizeDerivationService =
            packSizeDerivationService;
console.log(
    "[PHX-038 PACK DEPENDENCY CHECK]",
    {
        packRepository: !!packRepository,
        packSizeDerivationService: !!packSizeDerivationService
    }
);

    }



    async enrich(row) {


        if (!row || !row.asin) {


            return row;


        }



        let packInfo = null;



        if (row.locale) {


            packInfo =

                await this.packRepository
                    .getPackInfo(

                        row.asin,

                        row.locale

                    );


        }



        if (

            packInfo &&

            Number(packInfo.pack_size) > 0

        ) {


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


}