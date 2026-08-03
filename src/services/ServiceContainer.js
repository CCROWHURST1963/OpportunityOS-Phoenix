import { SupabaseClient }
    from "./SupabaseClient.js";


import { SupabaseOpportunityRepository }
    from "../repositories/SupabaseOpportunityRepository.js";


import { SupplierOpportunityRepository }
    from "../repositories/SupplierOpportunityRepository.js";


import { SupplierRepository }
    from "../repositories/SupplierRepository.js";


import { ViewConfigRepository }
    from "../repositories/ViewConfigRepository.js";


import { DashboardProcessRepository }
    from "../repositories/DashboardProcessRepository.js";


import { ViewFilterRepository }
    from "../repositories/ViewFilterRepository.js";


import { AttributeRepository }
    from "../repositories/AttributeRepository.js";


import { ViewConfigService }
    from "./ViewConfigService.js";


import { ViewFilterService }
    from "./ViewFilterService.js";


import { AttributeService }
    from "./AttributeService.js";


import { EnrichmentPipeline }
    from "./enrichment/EnrichmentPipeline.js";


import { AmazonPackInfoEnricher }
    from "./enrichment/AmazonPackInfoEnricher.js";


import { PackSizeDerivationService }
    from "./enrichment/PackSizeDerivationService.js";


import { OpportunityService }
    from "./OpportunityService.js";


import { SupplierOpportunityService }
    from "./SupplierOpportunityService.js";


import { HeaderController }
    from "../controllers/HeaderController.js";


import { ToolbarController }
    from "../controllers/ToolbarController.js";


import { FilterController }
    from "../controllers/FilterController.js";


import { DashboardController }
    from "../controllers/DashboardController.js";


import { StatusBarController }
    from "../controllers/StatusBarController.js";


import { GridRenderer }
    from "../components/GridRenderer.js";





export class ServiceContainer {


    constructor(

        appState,

        viewState

    ){


        this.appState =

            appState;


        this.viewState =

            viewState;


        this.services =

            {};


    }






    async build(){


        /*
            SUPABASE CLIENT
        */


        const supabaseClient =

            new SupabaseClient({

                url:

                    window.PHOENIX_CONFIG?.supabaseUrl,


                key:

                    window.PHOENIX_CONFIG?.supabaseKey

            });


        this.services.supabaseClient =

            supabaseClient;






        /*
            REPOSITORIES
        */


        const opportunityRepository =

            new SupabaseOpportunityRepository(

                supabaseClient,

                this.appState

            );


        const supplierOpportunityRepository =

            new SupplierOpportunityRepository(

                supabaseClient,

                this.appState

            );


        const supplierRepository =

            new SupplierRepository(

                supabaseClient

            );


        const viewConfigRepository =

            new ViewConfigRepository(

                supabaseClient

            );


        const processRepository =

            new DashboardProcessRepository(

                supabaseClient

            );


        const viewFilterRepository =

            new ViewFilterRepository(

                supabaseClient

            );


        const attributeRepository =

            new AttributeRepository(

                supabaseClient,

                this.appState

            );


        this.services.opportunityRepository =

            opportunityRepository;


        this.services.supplierOpportunityRepository =

            supplierOpportunityRepository;


        this.services.supplierRepository =

            supplierRepository;


        this.services.viewConfigRepository =

            viewConfigRepository;


        this.services.processRepository =

            processRepository;


        this.services.viewFilterRepository =

            viewFilterRepository;


        this.services.attributeRepository =

            attributeRepository;






        /*
            ENRICHMENT
        */


        const packSizeDerivationService =

            new PackSizeDerivationService();


        this.services.packSizeDerivationService =

            packSizeDerivationService;


        const amazonPackInfoEnricher =

            new AmazonPackInfoEnricher(

                null,

                packSizeDerivationService

            );


        this.services.amazonPackInfoEnricher =

            amazonPackInfoEnricher;


        const enrichmentPipeline =

            new EnrichmentPipeline(

                [

                    amazonPackInfoEnricher

                ]

            );


        this.services.enrichmentPipeline =

            enrichmentPipeline;






        /*
            APPLICATION SERVICES
        */


        const opportunityService =

            new OpportunityService(

                opportunityRepository,

                enrichmentPipeline

            );


        const supplierOpportunityService =

            new SupplierOpportunityService(

                supplierOpportunityRepository,

                enrichmentPipeline

            );


        const viewConfigService =

            new ViewConfigService(

                viewConfigRepository

            );


        const viewFilterService =

            new ViewFilterService(

                viewFilterRepository

            );


        const attributeService =

            new AttributeService(

                attributeRepository

            );


        this.services.opportunityService =

            opportunityService;


        this.services.supplierOpportunityService =

            supplierOpportunityService;


        this.services.viewConfig =

            viewConfigService;


        this.services.viewFilterService =

            viewFilterService;


        this.services.attributeService =

            attributeService;






        /*
            GRID
        */


        const gridRenderer =

            new GridRenderer();


        this.services.gridRenderer =

            gridRenderer;






        /*
            CONTROLLERS
        */


        const headerController =

            new HeaderController(

                this.appState

            );


        const toolbarController =

            new ToolbarController(

                this.appState,

                supplierRepository

            );


        /*
            FilterController currently uses ViewFilterService
            for Assigned To and Status.

            AttributeService is supplied as the third argument
            for Brand, Category and Sub Category integration.
        */


        const filterController =

            new FilterController(

                this.appState,

                viewFilterService,

                attributeService

            );


        const dashboardController =

            new DashboardController(

                opportunityService,

                supplierOpportunityService,

                viewConfigService,

                this.viewState,

                this.appState,

                gridRenderer

            );


        const statusController =

            new StatusBarController(

                this.appState

            );


        this.services.headerController =

            headerController;


        this.services.toolbarController =

            toolbarController;


        this.services.filterController =

            filterController;


        this.services.dashboardController =

            dashboardController;


        this.services.statusController =

            statusController;






        console.log(

            "[PHX SERVICE CONTAINER READY]",

            this.services

        );


    }






    get(name){


        return this.services[name];


    }


}