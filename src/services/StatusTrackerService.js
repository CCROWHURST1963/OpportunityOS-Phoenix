export class StatusTrackerService {


    constructor(

        statusTrackerRepository,

        appState

    ){


        this.statusTrackerRepository =

            statusTrackerRepository;


        this.appState =

            appState;


        this.fieldAliases = {

            status:

                "tracker_status",


            eligible_to_sell:

                "tracker_eligible_to_sell",


            product_type:

                "tracker_product_type",


            hazmat_status:

                "tracker_hazmat_status",


            ungate_qty:

                "tracker_ungate_qty",


            comment:

                "tracker_comment",


            override:

                "tracker_override"

        };


    }






    ensureAvailable(){


        if(

            !this.statusTrackerRepository

            ||

            typeof this.statusTrackerRepository.saveFields !==

                "function"

        ){


            throw new Error(

                "Status Tracker repository is not available"

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






    normaliseChanges(changes){


        if(

            !changes

            ||

            typeof changes !==

                "object"

            ||

            Array.isArray(

                changes

            )

        ){


            throw new Error(

                "Status Tracker changes must be an object"

            );


        }


        return {

            ...changes

        };


    }






    buildRowChanges(changes){


        const rowChanges =

            {};


        for(

            const [

                field,

                value

            ]

            of Object.entries(

                changes

            )

        ){


            /*
                Keep the canonical tracker table field.
            */


            rowChanges[field] =

                value;


            /*
                Also update the opportunity_grid_view field
                currently returned to Phoenix.
            */


            const alias =

                this.fieldAliases[field];


            if(alias){


                rowChanges[alias] =

                    value;


            }


        }


        return rowChanges;


    }






    patchAppState(

        source,

        changes

    ){


        return this.appState.updateRow(

            source,

            this.buildRowChanges(

                changes

            )

        );


    }






    async saveFields(

        source,

        changes

    ){


        this.ensureAvailable();


        const resolvedChanges =

            this.normaliseChanges(

                changes

            );


        const result =

            await this.statusTrackerRepository.saveFields(

                source,

                resolvedChanges

            );


        const updatedRow =

            this.patchAppState(

                source,

                resolvedChanges

            );


        return {

            ...result,

            updatedRow:

                updatedRow

        };


    }






    async saveField(

        source,

        field,

        value

    ){


        return this.saveFields(

            source,

            {

                [field]:

                    value

            }

        );


    }






    async saveStatus(

        source,

        value

    ){


        return this.saveField(

            source,

            "status",

            this.normaliseText(

                value

            )

        );


    }






    async saveEligibleToSell(

        source,

        value,

        derivedStatus = undefined

    ){


        const changes = {

            eligible_to_sell:

                this.normaliseText(

                    value

                )

        };


        if(

            derivedStatus !==

            undefined

        ){


            changes.status =

                this.normaliseText(

                    derivedStatus

                );


        }


        return this.saveFields(

            source,

            changes

        );


    }






    async saveProductType(

        source,

        value

    ){


        return this.saveField(

            source,

            "product_type",

            this.normaliseText(

                value

            )

        );


    }






    async saveHazmatStatus(

        source,

        value

    ){


        return this.saveField(

            source,

            "hazmat_status",

            this.normaliseText(

                value

            )

        );


    }






    async saveUngateQty(

        source,

        value

    ){


        return this.saveField(

            source,

            "ungate_qty",

            value

        );


    }






    async saveComment(

        source,

        value

    ){


        return this.saveField(

            source,

            "comment",

            this.normaliseText(

                value

            )

        );


    }






    async saveOverride(

        source,

        value

    ){


        /*
            Override is saved independently and must not
            update status.
        */


        return this.saveField(

            source,

            "override",

            this.normaliseText(

                value

            )

        );


    }


}