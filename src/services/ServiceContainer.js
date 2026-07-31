import { Logger }
    from "./Logger.js";


import { ViewConfigService }
    from "./ViewConfigService.js";


import { OpportunityService }
    from "./OpportunityService.js";


import { ViewEngine }
    from "./ViewEngine.js";


import { DemoOpportunityRepository }
    from "../repositories/DemoOpportunityRepository.js";


import { SupabaseOpportunityRepository }
    from "../repositories/SupabaseOpportunityRepository.js";


import { ViewConfigRepository }
    from "../repositories/ViewConfigRepository.js";


import { SupabaseClient }
    from "./SupabaseClient.js";


import { PhoenixConfig }
    from "../config/PhoenixConfig.js";


import { CalculationPipeline }
    from "./calculations/CalculationPipeline.js";


import { PriceValidationCalculator }
    from "./calculations/PriceValidationCalculator.js";


import { EnrichmentPipeline }
    from "./enrichment/EnrichmentPipeline.js";


import { StatusTrackerEnricher }
    from "./enrichment/StatusTrackerEnricher.js";


import { AmazonPackInfoEnricher }
    from "./enrichment/AmazonPackInfoEnricher.js";


import { PackSizeDerivationService }
    from "./enrichment/PackSizeDerivationService.js";


import { StatusRepository }
    from "../repositories/StatusRepository.js";


import { AmazonPackInfoRepository }
    from "../repositories/AmazonPackInfoRepository.js";


import { HeaderController }
    from "../controllers/HeaderController.js";


import { ToolbarController }
    from "../controllers/ToolbarController.js";


import { StatusBarController }
    from "../controllers/StatusBarController.js";


import { DashboardController }
    from "../controllers/DashboardController.js";



export class ServiceContainer {


    constructor(

        appState,

        viewState

    ) {



        this.logger =

            new Logger();




        this.config =

            new PhoenixConfig();




        this.appState =

            appState;




        this.viewState =

            viewState;




        this.supabaseClient =

            new SupabaseClient({

                url:

                    this.config.getSupabaseUrl(),


                key:

                    this.config.getSupabaseKey()

            });




        const viewConfigRepository =

            new ViewConfigRepository(

                this.supabaseClient

            );




        this.viewConfig =

            new ViewConfigService(

                viewConfigRepository

            );




        this.viewEngine =

            new ViewEngine(

                this.viewState

            );





        /*
            Controllers
        */


        this.headerController =

            new HeaderController(

                this.appState

            );



        this.toolbarController =

            new ToolbarController(

                this.appState,

                this.viewState

            );



        this.statusController =

            new StatusBarController(

                this.appState

            );





        /*
            Repositories
        */


        const statusRepository =

            new StatusRepository(

                this.supabaseClient,

                this.config

            );



        const packRepository =

            new AmazonPackInfoRepository(

                this.supabaseClient,

                this.config

            );





        const packSizeDerivationService =

            new PackSizeDerivationService();





        /*
            Enrichment pipeline
        */


        this.enrichmentPipeline =

            new EnrichmentPipeline([


                new StatusTrackerEnricher(

                    statusRepository

                ),



                new AmazonPackInfoEnricher(

                    packRepository,

                    packSizeDerivationService

                )


            ]);





        /*
            Calculation pipeline
        */


        this.calculationPipeline =

            new CalculationPipeline([


                new PriceValidationCalculator()


            ]);





        /*
            Opportunity repository
        */


        let opportunityRepository;



        if (

            this.config.isSupabaseConfigured()

        ) {


            opportunityRepository =

                new SupabaseOpportunityRepository(

                    this.supabaseClient,

                    this.config

                );


        }

        else {


            opportunityRepository =

                new DemoOpportunityRepository();


        }





        /*
            Opportunity service
        */


        this.opportunity =

            new OpportunityService(

                opportunityRepository,

                this.calculationPipeline,

                this.enrichmentPipeline

            );





        /*
            Dashboard controller

            Uses:
            ViewState  = data mode
            AppState   = current view/layout

        */


        this.dashboardController =

            new DashboardController(

                this.opportunity,

                this.viewConfig,

                this.viewState,

                this.appState

            );


    }


}