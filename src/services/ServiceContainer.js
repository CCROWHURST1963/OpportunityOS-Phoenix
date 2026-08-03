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


import { StatusTrackerRepository }
    from "../repositories/StatusTrackerRepository.js";


import { AmazonPackInfoRepository }
    from "../repositories/AmazonPackInfoRepository.js?v=PHX_PACK_WRITE_003";


import { TrackerLookupRepository }
    from "../repositories/TrackerLookupRepository.js";


import { DashboardConstantsRepository }
    from "../repositories/DashboardConstantsRepository.js";


import { ViewConfigService }
    from "./ViewConfigService.js";


import { ViewFilterService }
    from "./ViewFilterService.js";


import { AttributeService }
    from "./AttributeService.js";


import { StatusTrackerService }
    from "./StatusTrackerService.js";


import { AmazonPackInfoService }
    from "./AmazonPackInfoService.js?v=PHX_PACK_WRITE_001";


import { TrackerLookupService }
    from "./TrackerLookupService.js";


import { DashboardConstantsService }
    from "./DashboardConstantsService.js";


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


        const statusTrackerRepository =

            new StatusTrackerRepository(

                supabaseClient,

                this.appState

            );


        const amazonPackInfoRepository =

            new AmazonPackInfoRepository(

                supabaseClient,

                this.appState

            );


        const trackerLookupRepository =

            new TrackerLookupRepository(

                supabaseClient

            );


        const dashboardConstantsRepository =

            new DashboardConstantsRepository(

                supabaseClient

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


        this.services.statusTrackerRepository =

            statusTrackerRepository;


        this.services.amazonPackInfoRepository =

            amazonPackInfoRepository;


        this.services.trackerLookupRepository =

            trackerLookupRepository;


        this.services.dashboardConstantsRepository =

            dashboardConstantsRepository;






        /*
            ENRICHMENT
        */


        const packSizeDerivationService =

            new PackSizeDerivationService();


        this.services.packSizeDerivationService =

            packSizeDerivationService;


        const amazonPackInfoEnricher =

            new AmazonPackInfoEnricher(

                amazonPackInfoRepository,

                packSizeDerivationService

            );


        this.services.amazonPackInfoEnricher =

            amazonPackInfoEnricher;


        const enrichmentPipeline =

            new EnrichmentPipeline([

                amazonPackInfoEnricher

            ]);


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


        const statusTrackerService =

            new StatusTrackerService(

                statusTrackerRepository,

                this.appState

            );


        const amazonPackInfoService =

            new AmazonPackInfoService(

                amazonPackInfoRepository,

                this.appState

            );


        const trackerLookupService =

            new TrackerLookupService(

                trackerLookupRepository

            );


        const dashboardConstantsService =

            new DashboardConstantsService(

                dashboardConstantsRepository

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


        this.services.statusTrackerService =

            statusTrackerService;


        this.services.amazonPackInfoService =

            amazonPackInfoService;


        this.services.trackerLookupService =

            trackerLookupService;


        this.services.dashboardConstantsService =

            dashboardConstantsService;






        /*
            GRID
        */


        const gridRenderer =

            new GridRenderer(

                this.appState,

                statusTrackerService,

                amazonPackInfoService

            );


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


    }






    get(name){


        return this.services[name];


    }


}