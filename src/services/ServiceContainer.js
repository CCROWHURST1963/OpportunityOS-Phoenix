import { SupabaseClient }
    from "./SupabaseClient.js";


import { SupabaseOpportunityRepository }
    from "../repositories/SupabaseOpportunityRepository.js";


import { ViewConfigRepository }
    from "../repositories/ViewConfigRepository.js";


import { DashboardProcessRepository }
    from "../repositories/DashboardProcessRepository.js";


import { ViewConfigService }
    from "./ViewConfigService.js";


import { EnrichmentPipeline }
    from "./enrichment/EnrichmentPipeline.js";


import { AmazonPackInfoEnricher }
    from "./enrichment/AmazonPackInfoEnricher.js";


import { PackSizeDerivationService }
    from "./enrichment/PackSizeDerivationService.js";


import { OpportunityService }
    from "./OpportunityService.js";


import { HeaderController }
    from "../controllers/HeaderController.js";


import { ToolbarController }
    from "../controllers/ToolbarController.js";


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


        this.appState = appState;


        this.viewState = viewState;


        this.services = {};


    }









    async build(){



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





        const viewConfigRepository =

            new ViewConfigRepository(

                supabaseClient

            );





        const processRepository =

            new DashboardProcessRepository(

                supabaseClient

            );





        this.services.opportunityRepository =

            opportunityRepository;



        this.services.viewConfigRepository =

            viewConfigRepository;



        this.services.processRepository =

            processRepository;









        /*
            PACK SIZE ENRICHMENT

            No PackRepository yet.
            Uses derivation only.
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
            SERVICES
        */


        const opportunityService =

            new OpportunityService(

                opportunityRepository,

                enrichmentPipeline

            );





        this.services.opportunityService =

            opportunityService;









        const viewConfigService =

            new ViewConfigService(

                viewConfigRepository

            );





        this.services.viewConfig =

            viewConfigService;









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


        this.services.headerController =

            new HeaderController(

                this.appState

            );





        this.services.toolbarController =

            new ToolbarController(

                this.appState

            );





        this.services.dashboardController =

            new DashboardController(

                opportunityService,

                viewConfigService,

                this.viewState,

                this.appState,

                gridRenderer

            );





        this.services.statusController =

            new StatusBarController(

                this.appState

            );









        console.log(

            "[PHX SERVICE CONTAINER READY]",

            this.services

        );



    }









    get(name){


        return this.services[name];


    }



}