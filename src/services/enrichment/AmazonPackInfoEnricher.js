export class AmazonPackInfoEnricher {


    constructor(

        packRepository,

        packSizeDerivationService

    ){


        this.packRepository =

            packRepository;


        this.packSizeDerivationService =

            packSizeDerivationService;


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normalisePositiveInteger(

        value,

        fallback =

            null

    ){


        const parsed =

            Number(

                value

            );


        if(

            !Number.isFinite(

                parsed

            )

            ||

            parsed <=

                0

        ){


            return fallback;


        }


        return Math.round(

            parsed

        );


    }






    getUserKey(row){


        return this.normaliseText(

            row?.user_id

            ??

            row?.userKey

            ??

            row?.user_key

            ??

            "DEFAULT"

        )

        ||

        "DEFAULT";


    }






    getLocale(row){


        return this.normaliseText(

            row?.locale

            ??

            row?.matched_locale

            ??

            "co.uk"

        ).toLowerCase()

        ||

        "co.uk";


    }






    async loadManualPackInfo(row){


        if(

            !this.packRepository

            ||

            typeof this.packRepository.getPackInfo !==

                "function"

        ){


            return null;


        }


        const rows =

            await this.packRepository.getPackInfo(

                this.getUserKey(

                    row

                ),

                [

                    row.asin

                ],

                this.getLocale(

                    row

                )

            );


        if(

            !Array.isArray(

                rows

            )

            ||

            rows.length ===

                0

        ){


            return null;


        }


        return rows[0]

        ||

        null;


    }






    buildManualResult(

        row,

        packInfo

    ){


        const packSize =

            this.normalisePositiveInteger(

                packInfo?.pack_size,

                null

            );


        if(packSize === null){


            return null;


        }


        const buyQty =

            this.normalisePositiveInteger(

                packInfo?.buy_qty,

                null

            );


        return {

            ...row,


            pack_size:

                packSize,


            manual_pack_size:

                packSize,


            amazonpackinfo_pack_size:

                packSize,


            buy_qty:

                buyQty,


            amazonpackinfo_buy_qty:

                buyQty,


            pack_source:

                "Manual",


            amazonpackinfo_pack_source:

                "Manual"

        };


    }






    buildDerivedResult(row){


        if(

            !this.packSizeDerivationService

            ||

            typeof this.packSizeDerivationService.derive !==

                "function"

        ){


            return row;


        }


        const derived =

            this.packSizeDerivationService.derive(

                row

            )

            ||

            {};


        const packSize =

            this.normalisePositiveInteger(

                derived.pack_size,

                1

            );


        const buyQty =

            this.normalisePositiveInteger(

                derived.buy_qty

                ??

                row?.buy_qty,

                packSize

            );


        return {

            ...row,


            pack_size:

                packSize,


            buy_qty:

                buyQty,


            pack_source:

                this.normaliseText(

                    derived.pack_source

                )

                ||

                "derived"

        };


    }






    async enrich(row){


        if(

            !row

            ||

            !row.asin

        ){


            return row;


        }


        const manualPackInfo =

            await this.loadManualPackInfo(

                row

            );


        const manualResult =

            this.buildManualResult(

                row,

                manualPackInfo

            );


        if(manualResult){


            return manualResult;


        }


        return this.buildDerivedResult(

            row

        );


    }


}