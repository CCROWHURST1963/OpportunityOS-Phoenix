export class PackSizeDerivationService {


    clean(value) {

        return String(
            value == null ? "" : value
        )
        .trim();

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


        if (!row) {

            return {

                pack_size: 1,

                buy_qty: 1,

                pack_source: "default"

            };

        }



        /*
            1. Manual amazonpackinfo lock
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


            const pack =

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

                pack_size: pack,

                buy_qty:

                    Math.max(

                        1,

                        Math.round(

                            this.toNum(

                                row._buyQty ??
                                row.buy_qty ??
                                row.amazonpackinfo_buy_qty

                            )
                            || pack

                        )

                    ),


                pack_source:

                    "Manual"

            };


        }



        /*
            2. Number of Items
        */


        const numberOfItems =

            Math.round(

                this.toNum(

                    row._numberOfItems ??
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

                    "number_of_items"

            };


        }



        /*
            3. Title / size derivation
        */


        const title =

            this.clean(

                row._title ??
                row.title

            )
            .toLowerCase();



        const size =

            this.clean(

                row._size ??
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

            this.derivePackFromText(text);



        const derivedPack =

            Math.round(

                this.toNum(

                    derived.packSize

                )

            );



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

                    "derived"

            };


        }



        /*
            4. Default
        */


        return {

            pack_size: 1,

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

                "default"

        };


    }





    derivePackFromText(text) {


        const t =

            this.clean(text)
                .toLowerCase();



        if (!t) {

            return {

                packSize: 1

            };

        }



        let match;



        match =

            t.match(
                /(?:pack|pk|set|bundle|case)\s*x?\s*(\d+)/i
            );


        if (match) {

            return {

                packSize:

                    Number(match[1])

            };

        }



        match =

            t.match(
                /x\s*(\d+)/
            );


        if (match) {

            return {

                packSize:

                    Number(match[1])

            };

        }



        return {

            packSize: 1

        };


    }


}