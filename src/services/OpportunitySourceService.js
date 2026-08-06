export class OpportunitySourceService {


    constructor(

        opportunityService,

        supplierOpportunityService,

        importOpportunityService =

            null

    ){


        this.opportunityService =

            opportunityService;


        this.supplierOpportunityService =

            supplierOpportunityService;


        this.importOpportunityService =

            importOpportunityService;


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseMode(value){


        const mode =

            this.normaliseText(

                value

            );


        if(mode ===

            "By Supplier"){


            return "By Supplier";


        }


        if(mode ===

            "By Import"){


            return "By Import";


        }


        return "By View";


    }






    normaliseRows(rows){


        return Array.isArray(

            rows

        )

            ? rows

            : [];


    }






    isAttributeView(value){


        return [

            "By Brand",

            "By Category",

            "By Sub Category"

        ].includes(

            this.normaliseText(

                value

            )

        );


    }






    validateByViewRequest(request){


        if(

            !this.normaliseText(

                request.opportunityView

            )

        ){


            throw new Error(

                "Select a View before loading the dashboard"

            );


        }


        if(

            this.isAttributeView(

                request.opportunityView

            )

            &&

            this.normaliseRows(

                request.selectedAttributeValues

            ).length ===

                0

        ){


            throw new Error(

                "Choose at least one filter value before loading the dashboard"

            );


        }


    }






    async loadByView(request){


        if(

            !this.opportunityService

            ||

            typeof this.opportunityService.getRows !==

                "function"

        ){


            throw new Error(

                "Opportunity service is not available"

            );


        }


        this.validateByViewRequest(

            request

        );


        const rows =

            await this.opportunityService.getRows(

                request

            );


        return this.normaliseRows(

            rows

        );


    }






    async loadBySupplier(request){


        if(!request.selectedSupplier){


            throw new Error(

                "Select a supplier before loading the dashboard"

            );


        }


        if(

            !this.supplierOpportunityService

            ||

            typeof this.supplierOpportunityService.getRows !==

                "function"

        ){


            throw new Error(

                "Supplier opportunity service is not available"

            );


        }


        const rows =

            await this.supplierOpportunityService.getRows({

                supplier:

                    request.selectedSupplier,


                process:

                    request.process,


                currentView:

                    request.currentView,


                limit:

                    request.rowsLimit,


                userKey:

                    request.userKey,


                locale:

                    request.locale

            });


        return this.normaliseRows(

            rows

        );


    }






    async loadByImport(request){


        if(

            !this.importOpportunityService

            ||

            typeof this.importOpportunityService.getRows !==

                "function"

        ){


            throw new Error(

                "Import opportunity service is not available"

            );


        }


        const rows =

            await this.importOpportunityService.getRows(

                request

            );


        return this.normaliseRows(

            rows

        );


    }






    async getRows(request = {}){


        switch(

            this.normaliseMode(

                request.opportunityMode

            )

        ){


            case "By Supplier":


                return this.loadBySupplier(

                    request

                );


            case "By Import":


                return this.loadByImport(

                    request

                );


            default:


                return this.loadByView(

                    request

                );


        }


    }


}
