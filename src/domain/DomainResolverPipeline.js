import { DomainContext }
    from "./DomainContext.js";



export class DomainResolverPipeline {


    constructor(

        resolvers = []

    ){


        this.resolvers =

            Array.isArray(

                resolvers

            )

                ? resolvers.filter(

                    resolver =>

                        resolver

                        &&

                        typeof resolver.resolve ===

                            "function"

                )

                : [];


    }






    register(

        resolver

    ){


        if(

            !resolver

            ||

            typeof resolver.resolve !==

                "function"

        ){


            throw new Error(

                "Domain resolver must provide resolve(context)"

            );


        }


        this.resolvers.push(

            resolver

        );


        return this;


    }






    getResolverName(

        resolver

    ){


        return resolver?.constructor?.name

        ??

        "AnonymousDomainResolver";


    }






    createContext({

        row,

        dashboardConstants = {},

        services = {},

        user = null,

        lookups = {},

        cache = new Map()

    } = {}){


        return new DomainContext({

            row,

            dashboardConstants,

            services,

            user,

            lookups,

            cache

        });


    }






    async runResolver(

        resolver,

        context

    ){


        const resolverName =

            this.getResolverName(

                resolver

            );


        try{


            const returnedContext =

                await resolver.resolve(

                    context

                );


            const resolvedContext =

                returnedContext instanceof

                    DomainContext

                    ? returnedContext

                    : context;


            resolvedContext.addAudit(

                resolverName,

                {

                    status:

                        "complete"

                }

            );


            return resolvedContext;


        }

        catch(error){


            context.addError(

                resolverName,

                error

            );


            console.error(

                "[PHX DOMAIN RESOLVER ERROR]",

                {

                    asin:

                        context?.row?.asin

                        ??

                        context?.row?._asin

                        ??

                        "",


                    resolver:

                        resolverName,


                    error:

                        error

                }

            );


            return context;


        }


    }






    async resolve({

        row,

        dashboardConstants = {},

        services = {},

        user = null,

        lookups = {},

        cache = new Map()

    } = {}){


        let context =

            this.createContext({

                row,

                dashboardConstants,

                services,

                user,

                lookups,

                cache

            });


        for(

            const resolver of this.resolvers

        ){


            context =

                await this.runResolver(

                    resolver,

                    context

                );


        }


        return context;


    }






    async resolveRow(

        row,

        dashboardConstants = {},

        options = {}

    ){


        const context =

            await this.resolve({

                row,

                dashboardConstants,

                services:

                    options.services

                    ??

                    {},


                user:

                    options.user

                    ??

                    null,


                lookups:

                    options.lookups

                    ??

                    {},


                cache:

                    options.cache

                    ??

                    new Map()

            });


        return context.row;


    }






    async resolveRows(

        rows = [],

        dashboardConstants = {},

        options = {}

    ){


        if(

            !Array.isArray(

                rows

            )

        ){


            return [];


        }


        const resolvedRows =

            [];


        const sharedCache =

            options.cache instanceof Map

                ? options.cache

                : new Map();


        for(

            const row of rows

        ){


            resolvedRows.push(

                await this.resolveRow(

                    row,

                    dashboardConstants,

                    {

                        ...options,


                        cache:

                            sharedCache

                    }

                )

            );


        }


        return resolvedRows;


    }


}