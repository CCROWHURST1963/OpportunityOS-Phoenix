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


import { PackSizeDerivationService }
    from "./enrichment/PackSizeDerivationService.js";


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







        /*
            View Config
        */


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
            Pack Size Derivation

            Only runs when RPC row
            has no pack_size

        */


        this.packSizeDerivationService =

            new PackSizeDerivationService();







        /*
            Calculation Pipeline
        */


        this.calculationPipeline =

            new CalculationPipeline([


                new PriceValidationCalculator()


            ]);







        /*
            Opportunity Repository
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
            Opportunity Service

            RPC now supplies:

            - status_tracker
            - master_price_file
            - amazonpackinfo

            Only remaining enrichment:

            - PackSizeDerivationService

        */


        this.opportunity =

            new OpportunityService(

                opportunityRepository,

                this.calculationPipeline,

                this.packSizeDerivationService

            );







        /*
            Dashboard Controller
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