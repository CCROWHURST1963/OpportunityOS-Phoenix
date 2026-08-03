export class ColumnRegistry {


    constructor(){


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


        if(

            row[key] !== undefined

            &&

            row[key] !== null

        ){


            return row[key];


        }


        const alias =

            this.aliases[key];


        if(

            alias

            &&

            row[alias] !== undefined

            &&

            row[alias] !== null

        ){


            return row[alias];


        }


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


                return row[cleanKey];


            }


        }


        return "";


    }


}