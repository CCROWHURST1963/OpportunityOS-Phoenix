export class OpportunityService {


    constructor(

        opportunityRepository,

        enrichmentPipeline,

        domainService

    ){


        this.opportunityRepository =

            opportunityRepository;


        this.enrichmentPipeline =

            enrichmentPipeline;


        this.domainService =

            domainService;


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseStringArray(values){


        if(!Array.isArray(values)){


            return [];


        }


        return values

            .map(value =>

                this.normaliseText(

                    value

                )

            )

            .filter(Boolean);


    }






    normaliseLimit(value){


        const parsed =

            Number(

                value

            );


        if(

            !Number.isFinite(parsed)

            ||

            parsed <= 0

        ){


            return 100;


        }


        return Math.floor(

            parsed

        );


    }






    normaliseObject(value){


        return value

        &&

        typeof value ===

            "object"

        &&

        !Array.isArray(value)

            ? value

            : {};


    }






    normaliseRequest(source){


        const request =

            source

            &&

            typeof source ===

                "object"

                ? source

                : {};


        return {

            process:

                this.normaliseText(

                    request.process

                )

                ||

                "Can We Sell",


            currentView:

                this.normaliseText(

                    request.currentView

                    ??

                    request.view

                ),


            opportunityMode:

                this.normaliseText(

                    request.opportunityMode

                )

                ||

                "By View",


            opportunityView:

                this.normaliseText(

                    request.opportunityView

                ),


            attributeField:

                this.normaliseText(

                    request.attributeField

                    ??

                    request.viewFilterType

                ),


            selectedAttributeValues:

                this.normaliseStringArray(

                    request.selectedAttributeValues

                    ??

                    request.viewFilterValues

                ),


            viewFilterType:

                this.normaliseText(

                    request.viewFilterType

                ),


            viewFilterValue:

                this.normaliseText(

                    request.viewFilterValue

                ),


            viewFilterValues:

                this.normaliseStringArray(

                    request.viewFilterValues

                ),


            viewDateValue:

                this.normaliseText(

                    request.viewDateValue

                ),


            rowsLimit:

                this.normaliseLimit(

                    request.rowsLimit

                    ??

                    request.limit

                ),


            filterMode:

                this.normaliseText(

                    request.filterMode

                )

                ||

                "show_all",


            userKey:

                this.normaliseText(

                    request.userKey

                )

                ||

                "DEFAULT",


            locale:

                this.normaliseText(

                    request.locale

                )

                ||

                "co.uk",


            restrictAssigned:

                request.restrictAssigned ===

                true,


            dashboardConstants:

                this.normaliseObject(

                    request.dashboardConstants

                ),


            domainServices:

                this.normaliseObject(

                    request.domainServices

                    ??

                    request.services

                ),


            domainLookups:

                this.normaliseObject(

                    request.domainLookups

                    ??

                    request.lookups

                ),


            user:

                request.user

                ??

                null,


            domainCache:

                request.domainCache instanceof Map

                    ? request.domainCache

                    : new Map()

        };


    }






    async enrichRows(rows){


        const sourceRows =

            Array.isArray(rows)

                ? rows

                : [];


        if(

            !this.enrichmentPipeline

            ||

            sourceRows.length ===

                0

        ){


            return sourceRows;


        }


        /*
            Support the current pipeline and preserve
            compatibility if its batch method is renamed.
        */


        if(

            typeof this.enrichmentPipeline.enrichRows ===

            "function"

        ){


            const result =

                await this.enrichmentPipeline.enrichRows(

                    sourceRows

                );


            return Array.isArray(result)

                ? result

                : sourceRows;


        }


        if(

            typeof this.enrichmentPipeline.processRows ===

            "function"

        ){


            const result =

                await this.enrichmentPipeline.processRows(

                    sourceRows

                );


            return Array.isArray(result)

                ? result

                : sourceRows;


        }


        if(

            typeof this.enrichmentPipeline.run ===

            "function"

        ){


            const result =

                await this.enrichmentPipeline.run(

                    sourceRows

                );


            return Array.isArray(result)

                ? result

                : sourceRows;


        }


        if(

            typeof this.enrichmentPipeline.enrich ===

            "function"

        ){


            const enrichedRows =

                [];


            for(

                const row of sourceRows

            ){


                const result =

                    await this.enrichmentPipeline.enrich(

                        row

                    );


                enrichedRows.push(

                    result

                    &&

                    typeof result ===

                        "object"

                        ? result

                        : row

                );


            }


            return enrichedRows;


        }


        return sourceRows;


    }






    async resolveDomainRows(

        rows,

        request = {}

    ){


        const sourceRows =

            Array.isArray(rows)

                ? rows

                : [];


        if(

            !this.domainService

            ||

            typeof this.domainService.resolveRows !==

                "function"

            ||

            sourceRows.length ===

                0

        ){


            return sourceRows;


        }


        const dashboardConstants =

            this.normaliseObject(

                request.dashboardConstants

            );


        const resolvedRows =

            await this.domainService.resolveRows(

                sourceRows,

                dashboardConstants,

                {

                    services:

                        this.normaliseObject(

                            request.domainServices

                            ??

                            request.services

                        ),


                    user:

                        request.user

                        ??

                        null,


                    lookups:

                        this.normaliseObject(

                            request.domainLookups

                            ??

                            request.lookups

                        ),


                    cache:

                        request.domainCache instanceof Map

                            ? request.domainCache

                            : new Map()

                }

            );


        return Array.isArray(resolvedRows)

            ? resolvedRows

            : sourceRows;


    }






    async getRows(request){


        if(

            !this.opportunityRepository

            ||

            typeof this.opportunityRepository.getRows !==

                "function"

        ){


            throw new Error(

                "Opportunity repository is not available"

            );


        }


        const resolvedRequest =

            this.normaliseRequest(

                request

            );


        console.log(

            "[PHX OPPORTUNITY SERVICE REQUEST]",

            resolvedRequest

        );


        const rawRows =

            await this.opportunityRepository.getRows(

                resolvedRequest

            );


        const normalisedRows =

            Array.isArray(rawRows)

                ? rawRows

                : [];


        console.log(

            "[PHX RAW ROW COUNT]",

            normalisedRows.length

        );


        const enrichedRows =

            await this.enrichRows(

                normalisedRows

            );


        console.log(

            "[PHX ENRICHED ROW COUNT]",

            enrichedRows.length

        );


        const domainResolvedRows =

            await this.resolveDomainRows(

                enrichedRows,

                resolvedRequest

            );


        console.log(

            "[PHX DOMAIN ROW COUNT]",

            domainResolvedRows.length

        );


        console.log(

            "[PHX PROCESSED ROW COUNT]",

            domainResolvedRows.length

        );


        return domainResolvedRows;


    }


}