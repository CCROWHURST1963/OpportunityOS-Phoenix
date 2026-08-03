export class ColumnRegistry {


    constructor(){


        console.log(

            "[PHX COLUMN REGISTRY CREATED]"

        );


        this.aliases = {

            "_brand":

                "brand",


            "_category":

                "categories_root",


            "_sub_category":

                "sub_category",


            "_title":

                "title",


            "_buy_qty":

                "buy_qty",


            "_pack_size":

                "pack_size",


            "_supplier":

                "supplier",


            "_price":

                "supplier_price"

        };


    }






    getValue(

        key,

        row

    ){


        if(

            !row

            ||

            !key

        ){


            return "";


        }


        /*
            Direct match
        */


        if(

            row[key] !== undefined

            &&

            row[key] !== null

        ){


            return row[key];


        }


        /*
            Explicit Phoenix alias
        */


        const alias =

            this.aliases[key];


        if(

            alias

            &&

            row[alias] !== undefined

            &&

            row[alias] !== null

        ){


            console.log(

                "[PHX COLUMN ALIAS MATCH]",

                {

                    from:

                        key,


                    to:

                        alias,


                    value:

                        row[alias]

                }

            );


            return row[alias];


        }


        /*
            Generic underscore fallback
        */


        if(

            key.startsWith(

                "_"

            )

        ){


            const cleanKey =

                key.substring(

                    1

                );


            if(

                row[cleanKey] !== undefined

                &&

                row[cleanKey] !== null

            ){


                console.log(

                    "[PHX COLUMN ALIAS MATCH]",

                    {

                        from:

                            key,


                        to:

                            cleanKey,


                        value:

                            row[cleanKey]

                    }

                );


                return row[cleanKey];


            }


        }


        return "";


    }


}