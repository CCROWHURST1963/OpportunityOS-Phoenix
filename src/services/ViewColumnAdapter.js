export class ViewColumnAdapter {


    adaptColumns(

        columns = []

    ) {


        return columns.map(

            column => {


                const key =

                    column.key

                    ||

                    column.field

                    ||

                    "";



                return {


                    key,


                    field:

                        key,


                    label:

                        column.label

                        ||

                        key,


                    width:

                        column.width

                        ||

                        120,


                    visible:

                        column.visible !== false


                };


            }

        );


    }


}

