export class DomainResolver {


    constructor(){


        if(

            new.target ===

                DomainResolver

        ){


            throw new Error(

                "DomainResolver is an abstract base class and cannot be instantiated directly"

            );


        }


    }






    getName(){


        return this.constructor?.name

        ??

        "AnonymousDomainResolver";


    }






    validateContext(

        context

    ){


        if(

            !context

            ||

            typeof context !==

                "object"

        ){


            throw new Error(

                `${this.getName()} requires a valid DomainContext`

            );


        }


        if(

            !context.row

            ||

            typeof context.row !==

                "object"

        ){


            throw new Error(

                `${this.getName()} requires DomainContext.row`

            );


        }


        if(

            !context.opportunity

            ||

            typeof context.opportunity !==

                "object"

        ){


            throw new Error(

                `${this.getName()} requires DomainContext.opportunity`

            );


        }


        return context;


    }






    resolve(

        context

    ){


        this.validateContext(

            context

        );


        throw new Error(

            `${this.getName()} must implement resolve(context)`

        );


    }


}