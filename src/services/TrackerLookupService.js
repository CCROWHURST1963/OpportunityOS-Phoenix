export class TrackerLookupService {


    constructor(

        trackerLookupRepository

    ){


        this.trackerLookupRepository =

            trackerLookupRepository;


        this.cache =

            null;


        this.pendingLoad =

            null;


    }






    cloneLookups(lookups){


        const source =

            lookups

            ||

            {};


        return {

            eligible_to_sell:

                Array.isArray(

                    source.eligible_to_sell

                )

                    ? [

                        ...source.eligible_to_sell

                    ]

                    : [],


            product_type:

                Array.isArray(

                    source.product_type

                )

                    ? [

                        ...source.product_type

                    ]

                    : [],


            hazmat_status:

                Array.isArray(

                    source.hazmat_status

                )

                    ? [

                        ...source.hazmat_status

                    ]

                    : [],


            override:

                Array.isArray(

                    source.override

                )

                    ? [

                        ...source.override

                    ]

                    : []

        };


    }






    async load({

        force = false

    } = {}){


        if(

            !force

            &&

            this.cache

        ){


            return this.cloneLookups(

                this.cache

            );


        }


        if(

            !force

            &&

            this.pendingLoad

        ){


            return this.pendingLoad;


        }


        this.pendingLoad =

            Promise.resolve()

                .then(async () => {


                    const lookups =

                        await this.trackerLookupRepository.getAll();


                    this.cache =

                        this.cloneLookups(

                            lookups

                        );


                    return this.cloneLookups(

                        this.cache

                    );


                })

                .finally(() => {


                    this.pendingLoad =

                        null;


                });


        return this.pendingLoad;


    }






    clearCache(){


        this.cache =

            null;


        this.pendingLoad =

            null;


    }


}