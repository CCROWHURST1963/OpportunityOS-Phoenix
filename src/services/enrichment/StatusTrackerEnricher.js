export class StatusTrackerEnricher {


    constructor(statusRepository) {


        this.statusRepository =

            statusRepository;


    }





    async enrich(row) {


        if (!row.asin) {


            return {


                ...row,


                status:

                    "Review"


            };


        }





        const status =

            await this.statusRepository
                .getStatus(

                    row.asin,

                    row.locale

                );





        const overrideEnabled =

            status?.override

            ===

            "Y";





        return {


            ...row,



            status_tracker:

                status

                ||

                null,





            status:

                overrideEnabled

                    ?

                    (

                        status?.status

                        ||

                        "Review"

                    )

                    :

                    "Review",





            eligible_to_sell:

                status?.eligible_to_sell

                ||

                "",





            ungate_qty:

                status?.ungate_qty

                ??

                "",





            product_type:

                status?.product_type

                ||

                "",





            hazmat_status:

                status?.hazmat_status

                ||

                "",





            override:

                status?.override

                ||

                "",





            comment:

                status?.comment

                ||

                ""



        };


    }


}