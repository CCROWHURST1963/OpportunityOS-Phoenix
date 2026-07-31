export class ColumnRegistry {


    constructor() {


        console.log(
            "[PHX COLUMN REGISTRY CREATED]"
        );


    }





    getValue(key, row) {


        console.log(

            "[PHX COLUMN VALUE LOOKUP]",

            {
                key,
                hasKey:
                    row
                    &&
                    Object.prototype.hasOwnProperty.call(
                        row,
                        key
                    ),

                sample:
                    row

            }

        );



        if (!row || !key) {


            return "";


        }





        /*
            Direct match first
        */


        if (

            row[key] !== undefined

            &&

            row[key] !== null

        ) {


            return row[key];


        }





        /*
            Underscore fallback

            _category -> category
            _title    -> title
            _brand    -> brand

        */


        if (

            key.startsWith("_")

        ) {


            const cleanKey =

                key.substring(1);




            if (

                row[cleanKey] !== undefined

                &&

                row[cleanKey] !== null

            ) {


                console.log(

                    "[PHX COLUMN ALIAS MATCH]",

                    {
                        from:key,
                        to:cleanKey,
                        value:
                            row[cleanKey]
                    }

                );


                return row[cleanKey];


            }


        }





        console.warn(

            "[PHX COLUMN VALUE NOT FOUND]",

            {

                key,

                availableKeys:

                    Object.keys(row)

            }

        );



        return "";


    }


}