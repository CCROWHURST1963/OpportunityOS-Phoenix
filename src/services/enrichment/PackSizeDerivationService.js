export class PackSizeDerivationService {


    clean(value) {

        return String(
            value == null ? "" : value
        ).trim();

    }



    toNum(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }


        const n = Number(value);


        return Number.isFinite(n)
            ? n
            : 0;

    }





    derive(row) {


        /*
            Direct port of HTML derivePackInfo()
        */


        if (!row) {

            return {

                pack_size: 1,

                buy_qty: 1,

                pack_source: "default"

            };

        }





        /*
            Manual amazonpackinfo override
        */


        const lockedManual =

            !!(

                row._packInfoManualLock ||

                row.__packInfoDbLoaded ||

                String(

                    row._packSource ||

                    row.pack_size_source ||

                    ""

                )
                .toLowerCase() === "manual"

            );



        const manual =

            Math.round(

                this.toNum(

                    row._manualPackSize ??

                    row.manual_pack_size ??

                    row.amazonpackinfo_pack_size

                )

            );



        if (

            lockedManual ||

            manual > 0

        ) {


            const lockedPack =

                manual > 0

                    ? manual

                    :

                    Math.max(

                        1,

                        Math.round(

                            this.toNum(

                                row._packSize ??

                                row.pack_size

                            )

                        )

                    );



            return {


                pack_size:

                    lockedPack,


                buy_qty:

                    Math.max(

                        1,

                        Math.round(

                            this.toNum(

                                row._buyQty ??

                                row.buy_qty ??

                                row.amazonpackinfo_buy_qty

                            )

                            || lockedPack

                        )

                    ),


                pack_source:

                    "Manual",


                confidence:

                    "high",


                reason:

                    "Manual amazonpackinfo override"


            };


        }





        const numberOfItems =

            Math.round(

                this.toNum(

                    row._numberOfItems ||

                    row.number_of_items

                )

            );



        if (

            numberOfItems > 1 &&

            numberOfItems <= 500

        ) {


            return {


                pack_size:

                    numberOfItems,


                buy_qty:

                    Math.max(

                        1,

                        Math.round(

                            this.toNum(

                                row._buyQty ??

                                row.buy_qty

                            )

                            || numberOfItems

                        )

                    ),


                pack_source:

                    "number_of_items",


                confidence:

                    "high",


                reason:

                    "number_of_items field"


            };


        }





        const title =

            this.clean(

                row._title ||

                row.title

            )
            .toLowerCase();



        const size =

            this.clean(

                row._size ||

                row.size

            )
            .toLowerCase();



        const text =

            (

                title +

                " " +

                size

            )
            .replace(

                /\s+/g,

                " "

            )
            .trim();





        const derived =

            this.derivePackFromText(

                text

            );



        const derivedPack =

            Math.round(

                this.toNum(

                    derived.packSize || 1

                )

            );





        /*
            HTML rule:
            derived count matching number_of_items
            is treated as retail unit content
        */


        if (

            derivedPack > 1 &&

            numberOfItems > 1 &&

            derivedPack === numberOfItems

        ) {


            return {


                pack_size:

                    1,


                buy_qty:

                    1,


                pack_source:

                    "default",


                confidence:

                    "high",


                reason:

                    "Derived count matches number_of_items"


            };


        }





        if (

            derivedPack > 1

        ) {


            return {


                pack_size:

                    derivedPack,


                buy_qty:

                    Math.max(

                        1,

                        Math.round(

                            this.toNum(

                                row._buyQty ??

                                row.buy_qty

                            )

                            || derivedPack

                        )

                    ),


                pack_source:

                    "derived",


                confidence:

                    derived.confidence,


                reason:

                    derived.reason


            };


        }





        return {


            pack_size:

                1,


            buy_qty:

                Math.max(

                    1,

                    Math.round(

                        this.toNum(

                            row._buyQty ??

                            row.buy_qty

                        )

                        || 1

                    )

                ),


            pack_source:

                "default",


            confidence:

                "low",


            reason:

                "No pack signal found"


        };


    }






    derivePackFromText(text) {


        const t =

            this.clean(text)

                .toLowerCase();



        if (!t) {


            return {

                packSize: 1,

                confidence: "low",

                reason: "empty text"

            };


        }



        let match;



        match = t.match(

            /(?:pack|pk|set|bundle|case)\s*(?:of\s*)?x?\s*(\d+)/i

        );



        if (match) {


            return {

                packSize:

                    Number(match[1]),

                confidence:

                    "medium",

                reason:

                    "pack keyword"

            };


        }



        match = t.match(

            /(\d+)\s*x\s*(\d+)/i

        );



        if (match) {


            return {

                packSize:

                    Number(match[1]),

                confidence:

                    "medium",

                reason:

                    "multiplication pattern"

            };


        }



        match = t.match(

            /x\s*(\d+)/i

        );



        if (match) {


            return {

                packSize:

                    Number(match[1]),

                confidence:

                    "medium",

                reason:

                    "x quantity"

            };


        }



        return {

            packSize: 1,

            confidence: "low",

            reason: "no match"

        };


    }


}