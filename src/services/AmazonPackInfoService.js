export class AmazonPackInfoService {


    constructor(

        amazonPackInfoRepository,

        appState

    ){


        this.amazonPackInfoRepository =

            amazonPackInfoRepository;


        this.appState =

            appState;


    }






    ensureAvailable(){


        if(

            !this.amazonPackInfoRepository

            ||

            typeof this.amazonPackInfoRepository.savePackSize !==

                "function"

            ||

            typeof this.amazonPackInfoRepository.saveBuyQty !==

                "function"

            ||

            typeof this.amazonPackInfoRepository.savePackInfo !==

                "function"

        ){


            throw new Error(

                "Amazon Pack Info repository is not available"

            );


        }


        if(

            !this.appState

            ||

            typeof this.appState.updateRow !==

                "function"

        ){


            throw new Error(

                "AppState row update support is not available"

            );


        }


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normalisePositiveInteger(value){


        const parsed =

            Number(

                String(

                    value

                    ??

                    ""

                ).replaceAll(

                    ",",

                    ""

                )

            );


        if(

            !Number.isFinite(

                parsed

            )

            ||

            parsed <= 0

        ){


            return null;


        }


        return Math.round(

            parsed

        );


    }






    buildRowChanges(payload){


        const rowChanges =

            {};


        if(

            Object.prototype.hasOwnProperty.call(

                payload,

                "pack_size"

            )

        ){


            rowChanges.pack_size =

                payload.pack_size;


            rowChanges.manual_pack_size =

                payload.pack_size;


            rowChanges.amazonpackinfo_pack_size =

                payload.pack_size;


        }


        if(

            Object.prototype.hasOwnProperty.call(

                payload,

                "buy_qty"

            )

        ){


            rowChanges.buy_qty =

                payload.buy_qty;


            rowChanges.amazonpackinfo_buy_qty =

                payload.buy_qty;


        }


        if(

            Object.prototype.hasOwnProperty.call(

                payload,

                "pack_source"

            )

        ){


            rowChanges.pack_source =

                payload.pack_source;


            rowChanges.amazonpackinfo_pack_source =

                payload.pack_source;


        }


        return rowChanges;


    }






    patchAppState(

        source,

        payload

    ){


        return this.appState.updateRow(

            source,

            this.buildRowChanges(

                payload

            )

        );


    }






    async saveFields(

        source,

        changes

    ){


        this.ensureAvailable();


        if(

            typeof this.amazonPackInfoRepository.saveFields !==

                "function"

        ){


            throw new Error(

                "Amazon Pack Info repository does not support saveFields"

            );


        }


        const result =

            await this.amazonPackInfoRepository.saveFields(

                source,

                changes

            );


        const payload =

            result?.payload

            ??

            changes;


        const updatedRow =

            this.patchAppState(

                source,

                payload

            );


        return {

            ...result,


            updatedRow:

                updatedRow

        };


    }






    async savePackSize(

        source,

        value

    ){


        this.ensureAvailable();


        const packSize =

            this.normalisePositiveInteger(

                value

            );


        if(packSize === null){


            throw new Error(

                "Pack Size must be a positive whole number"

            );


        }


        const result =

            await this.amazonPackInfoRepository.savePackSize(

                source,

                packSize

            );


        const payload =

            result?.payload

            ??

            {

                pack_size:

                    packSize,


                buy_qty:

                    this.normalisePositiveInteger(

                        source?.buy_qty

                        ??

                        source?.amazonpackinfo_buy_qty

                        ??

                        packSize

                    )

                    ??

                    packSize,


                pack_source:

                    "Manual"

            };


        const updatedRow =

            this.patchAppState(

                source,

                payload

            );


        return {

            ...result,


            payload:

                payload,


            updatedRow:

                updatedRow

        };


    }






    async saveBuyQty(

        source,

        value

    ){


        this.ensureAvailable();


        const buyQty =

            this.normalisePositiveInteger(

                value

            );


        if(buyQty === null){


            throw new Error(

                "Buy Qty must be a positive whole number"

            );


        }


        const result =

            await this.amazonPackInfoRepository.saveBuyQty(

                source,

                buyQty

            );


        const payload =

            result?.payload

            ??

            {

                pack_size:

                    this.normalisePositiveInteger(

                        source?.amazonpackinfo_pack_size

                        ??

                        source?.manual_pack_size

                        ??

                        source?.pack_size

                        ??

                        1

                    )

                    ??

                    1,


                buy_qty:

                    buyQty,


                pack_source:

                    "Manual"

            };


        const updatedRow =

            this.patchAppState(

                source,

                payload

            );


        return {

            ...result,


            payload:

                payload,


            updatedRow:

                updatedRow

        };


    }






    async savePackSource(

        source,

        value

    ){


        this.ensureAvailable();


        if(

            typeof this.amazonPackInfoRepository.savePackSource !==

                "function"

        ){


            throw new Error(

                "Amazon Pack Info repository does not support savePackSource"

            );


        }


        const packSource =

            this.normaliseText(

                value

            )

            ||

            "Manual";


        const result =

            await this.amazonPackInfoRepository.savePackSource(

                source,

                packSource

            );


        const payload =

            result?.payload

            ??

            {

                pack_source:

                    packSource

            };


        const updatedRow =

            this.patchAppState(

                source,

                payload

            );


        return {

            ...result,


            payload:

                payload,


            updatedRow:

                updatedRow

        };


    }






    async savePackInfo(

        source,

        {

            packSize,

            buyQty,

            packSource =

                "Manual"

        } = {}

    ){


        this.ensureAvailable();


        const resolvedPackSize =

            this.normalisePositiveInteger(

                packSize

            );


        const resolvedBuyQty =

            this.normalisePositiveInteger(

                buyQty

            );


        if(resolvedPackSize === null){


            throw new Error(

                "Pack Size must be a positive whole number"

            );


        }


        if(resolvedBuyQty === null){


            throw new Error(

                "Buy Qty must be a positive whole number"

            );


        }


        const resolvedPackSource =

            this.normaliseText(

                packSource

            )

            ||

            "Manual";


        const result =

            await this.amazonPackInfoRepository.savePackInfo(

                source,

                {

                    packSize:

                        resolvedPackSize,


                    buyQty:

                        resolvedBuyQty,


                    packSource:

                        resolvedPackSource

                }

            );


        const payload =

            result?.payload

            ??

            {

                pack_size:

                    resolvedPackSize,


                buy_qty:

                    resolvedBuyQty,


                pack_source:

                    resolvedPackSource

            };


        const updatedRow =

            this.patchAppState(

                source,

                payload

            );


        return {

            ...result,


            payload:

                payload,


            updatedRow:

                updatedRow

        };


    }


}