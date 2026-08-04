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


import { ScoringRuleRepository }
    from "../repositories/ScoringRuleRepository.js";


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


import { ScoringRuleService }
    from "./ScoringRuleService.js";


import { EnrichmentPipeline }
    from "./enrichment/EnrichmentPipeline.js?v=PHX_PACK_PIPELINE_001";


import { AmazonPackInfoEnricher }
    from "./enrichment/AmazonPackInfoEnricher.js?v=PHX_PACK_ENRICH_002";


import { PackSizeDerivationService }
    from "./enrichment/PackSizeDerivationService.js";


import { OpportunityService }
    from "./OpportunityService.js";


import { SupplierOpportunityService }
    from "./SupplierOpportunityService.js";


import { DomainService }
    from "../domain/DomainService.js";


import { DomainResolverPipeline }
    from "../domain/DomainResolverPipeline.js";


import { ValidatedPriceResolver }
    from "../domain/resolvers/ValidatedPriceResolver.js";


import { CalculationEngine }
    from "../calculations/CalculationEngine.js";


import { FinancialEngine }
    from "../engines/financial/FinancialEngine.js";


import { FeeCalculator }
    from "../engines/financial/FeeCalculator.js";


import { VatCalculator }
    from "../engines/financial/VatCalculator.js";


import { ProfitCalculator }
    from "../engines/financial/ProfitCalculator.js";


import { CostResolutionEngine }
    from "../engines/cost/CostResolutionEngine.js";


import { ProfitAtPrice }
    from "../calculations/pricing/ProfitAtPrice.js";


import { FindPriceForTarget }
    from "../calculations/pricing/FindPriceForTarget.js";


import { MaxCostAtPrice }
    from "../calculations/pricing/MaxCostAtPrice.js";


import { PricingTargetEngine }
    from "../calculations/pricing/PricingTargetEngine.js";


import { ScoringRuleResolver }
    from "../engines/scoring/ScoringRuleResolver.js";


import { ScoreEngine }
    from "../engines/scoring/ScoreEngine.js";


import { BuyBoxAtOrAboveTargetRule }
    from "../engines/scoring/rules/BuyBoxAtOrAboveTargetRule.js";


import { WatchPriceRule }
    from "../engines/scoring/rules/WatchPriceRule.js";


import { ValidatedPriceTypeRule }
    from "../engines/scoring/rules/ValidatedPriceTypeRule.js";


import { BreakevenWiggleRule }
    from "../engines/scoring/rules/BreakevenWiggleRule.js";


import { CurrentMinimumEconomicsRule }
    from "../engines/scoring/rules/CurrentMinimumEconomicsRule.js";


import { PriceDeviationRule }
    from "../engines/scoring/rules/PriceDeviationRule.js";


import { AmazonOOSRule }
    from "../engines/scoring/rules/AmazonOOSRule.js";


import { BuyBoxWinnersRule }
    from "../engines/scoring/rules/BuyBoxWinnersRule.js";


import { TopSellerWinRule }
    from "../engines/scoring/rules/TopSellerWinRule.js";


import { SalesEstimatedOnRule }
    from "../engines/scoring/rules/SalesEstimatedOnRule.js";


import { EstimatedSalesRule }
    from "../engines/scoring/rules/EstimatedSalesRule.js";


import { EstimatedSharedSalesRule }
    from "../engines/scoring/rules/EstimatedSharedSalesRule.js";


import { PackSizeRule }
    from "../engines/scoring/rules/PackSizeRule.js";


import { EligibleToSellRule }
    from "../engines/scoring/rules/EligibleToSellRule.js";


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


        const scoringRuleRepository =

            new ScoringRuleRepository(

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


        this.services.scoringRuleRepository =

            scoringRuleRepository;
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
            DOMAIN LAYER
        */


        const validatedPriceResolver =

            new ValidatedPriceResolver();


        const domainResolverPipeline =

            new DomainResolverPipeline([

                validatedPriceResolver

            ]);


        const domainService =

            new DomainService(

                domainResolverPipeline

            );


        this.services.validatedPriceResolver =

            validatedPriceResolver;


        this.services.domainResolverPipeline =

            domainResolverPipeline;


        this.services.domainService =

            domainService;





        /*
            APPLICATION SERVICES
        */


        const opportunityService =

            new OpportunityService(

                opportunityRepository,

                enrichmentPipeline,

                domainService

            );


        const supplierOpportunityService =

            new SupplierOpportunityService(

                supplierOpportunityRepository,

                enrichmentPipeline,

                domainService

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


        const scoringRuleService =

            new ScoringRuleService(

                scoringRuleRepository

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


        this.services.scoringRuleService =

            scoringRuleService;






        /*
            FINANCIAL ENGINE
        */


        const feeCalculator =

            new FeeCalculator();


        const vatCalculator =

            new VatCalculator();


        const profitCalculator =

            new ProfitCalculator();


        const financialEngine =

            new FinancialEngine({

                feeCalculator:

                    feeCalculator,


                vatCalculator:

                    vatCalculator,


                profitCalculator:

                    profitCalculator

            });


        this.services.feeCalculator =

            feeCalculator;


        this.services.vatCalculator =

            vatCalculator;


        this.services.profitCalculator =

            profitCalculator;


        this.services.financialEngine =

            financialEngine;






        /*
            PRICING AND COST RESOLUTION
        */


        const profitAtPrice =

            new ProfitAtPrice();


        const findPriceForTarget =

            new FindPriceForTarget(

                profitAtPrice

            );


        const maxCostAtPrice =

            new MaxCostAtPrice(

                financialEngine

            );


        const costResolutionEngine =

            new CostResolutionEngine({

                financialEngine:

                    financialEngine,


                maxCostAtPrice:

                    maxCostAtPrice

            });


        const pricingTargetEngine =

            new PricingTargetEngine({

                profitAtPrice:

                    profitAtPrice,


                financialEngine:

                    financialEngine,


                costResolutionEngine:

                    costResolutionEngine,


                maxCostAtPrice:

                    maxCostAtPrice,


                findPriceForTarget:

                    findPriceForTarget

            });


        this.services.profitAtPrice =

            profitAtPrice;


        this.services.findPriceForTarget =

            findPriceForTarget;


        this.services.maxCostAtPrice =

            maxCostAtPrice;


        this.services.costResolutionEngine =

            costResolutionEngine;


        this.services.pricingTargetEngine =

            pricingTargetEngine;
                    /*
            SCORING ENGINE
        */


        const scoringRuleResolver =

            new ScoringRuleResolver(

                scoringRuleService

            );


        await scoringRuleResolver.load(

            this.appState.getState()

                ?.userKey

        );


    const scoreEngine =

    new ScoreEngine(

        scoringRuleResolver,

        [

            new BuyBoxAtOrAboveTargetRule(scoringRuleResolver),

            new WatchPriceRule(scoringRuleResolver),

            new ValidatedPriceTypeRule(scoringRuleResolver),

            new BreakevenWiggleRule(scoringRuleResolver),

            new CurrentMinimumEconomicsRule(scoringRuleResolver),

            new PriceDeviationRule(scoringRuleResolver),

            new AmazonOOSRule(scoringRuleResolver),

            new BuyBoxWinnersRule(scoringRuleResolver),

            new TopSellerWinRule(scoringRuleResolver),

            new SalesEstimatedOnRule(scoringRuleResolver),

            new EstimatedSalesRule(scoringRuleResolver),

             new EstimatedSharedSalesRule(scoringRuleResolver),

            new PackSizeRule(scoringRuleResolver),

            new EligibleToSellRule(scoringRuleResolver)

        ]

    );

this.services.scoringRuleResolver =

    scoringRuleResolver;

this.services.scoreEngine =

    scoreEngine;






        /*
            CALCULATION PIPELINE

            PricingTargetEngine runs first so that
            Break Even, Target Selling Price and
            Maximum Cost are available before the
            remaining calculators execute.
        */


        const calculationEngine =

            new CalculationEngine(

                null,

                null,

                scoreEngine

            );


        if(

            typeof calculationEngine.registerFirst ===

                "function"

        ){


            calculationEngine.registerFirst(

                pricingTargetEngine

            );


        }

        else {


            calculationEngine.register(

                pricingTargetEngine

            );


        }


        this.services.calculationEngine =

            calculationEngine;






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

                gridRenderer,

                calculationEngine,

                dashboardConstantsService

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
                /*
            STARTUP DIAGNOSTICS
        */


        console.log(

            "[PHX SERVICE CONTAINER READY]",

            {

                calculationEngine:

                    Boolean(

                        calculationEngine

                    ),


                financialEngine:

                    Boolean(

                        financialEngine

                    ),


                pricingTargetEngine:

                    Boolean(

                        pricingTargetEngine

                    ),


                scoreEngine:

                    Boolean(

                        scoreEngine

                    ),


                scoringRuleResolver:

                    Boolean(

                        scoringRuleResolver

                    ),


                scoringRuleService:

                    Boolean(

                        scoringRuleService

                    ),


                costResolutionEngine:

                    Boolean(

                        costResolutionEngine

                    ),


                maxCostAtPrice:

                    Boolean(

                        maxCostAtPrice

                    ),


                dashboardConstantsService:

                    Boolean(

                        dashboardConstantsService

                    ),


                calculatorCount:

                    calculationEngine.calculators?.length

                    ??

                    0,


                calculatorOrder:

                    calculationEngine.calculators?.map(

                        calculator =>

                            calculator?.constructor?.name

                            ??

                            "UnknownCalculator"

                    )

                    ??

                    [],


                scoringRules:

                    scoreEngine?.rules?.map(

                        rule =>

                            rule?.constructor?.name

                            ??

                            "UnknownRule"

                    )

                    ??

                    [],


                scoringRuleCount:

                    scoreEngine?.rules?.length

                    ??

                    0

            }

        );


    }






    get(name){


        return this.services[name];


    }


}