import { CanonicalOpportunity }
    from "./CanonicalOpportunity.js";



export class DomainContext {


    constructor({

        row,

        dashboardConstants = {},

        services = {},

        user = null,

        lookups = {},

        cache = new Map()

    } = {}){


        this.row =

            row

            &&

            typeof row ===

                "object"

                ? row

                : {};


        this.opportunity =

            new CanonicalOpportunity(

                this.row

            );


        this.dashboardConstants =

            dashboardConstants

            &&

            typeof dashboardConstants ===

                "object"

                ? dashboardConstants

                : {};


        this.services =

            services

            &&

            typeof services ===

                "object"

                ? services

                : {};


        this.user =

            user;


        this.lookups =

            lookups

            &&

            typeof lookups ===

                "object"

                ? lookups

                : {};


        this.cache =

            cache instanceof Map

                ? cache

                : new Map();


        this.audit =

            [];


        this.errors =

            [];


    }






    addAudit(

        resolver,

        detail = {}

    ){


        this.audit.push({

            resolver:

                String(

                    resolver

                    ??

                    ""

                ),


            detail:

                detail

                &&

                typeof detail ===

                    "object"

                    ? detail

                    : {},


            at:

                new Date().toISOString()

        });


        return this;


    }






    addError(

        resolver,

        error

    ){


        this.errors.push({

            resolver:

                String(

                    resolver

                    ??

                    ""

                ),


            message:

                error?.message

                ??

                String(

                    error

                ),


            stack:

                error?.stack

                ??

                "",


            at:

                new Date().toISOString()

        });


        return this;


    }






    toJSON(){


        return {

            row:

                this.row,


            opportunity:

                this.opportunity.toJSON(),


            audit:

                this.audit.slice(),


            errors:

                this.errors.slice()

        };


    }


}