import { Logger } from "./Logger.js";
import { ViewConfigService } from "./ViewConfigService.js";
import { OpportunityService } from "./OpportunityService.js";
import { ViewEngine } from "./ViewEngine.js";

import { DemoOpportunityRepository } from "../repositories/DemoOpportunityRepository.js";
import { SupabaseOpportunityRepository } from "../repositories/SupabaseOpportunityRepository.js";

import { SupabaseClient } from "./SupabaseClient.js";
import { PhoenixConfig } from "../config/PhoenixConfig.js";

import { ViewState } from "../state/ViewState.js";


export class ServiceContainer {


    constructor() {


        this.logger =
            new Logger();



        this.config =
            new PhoenixConfig();



        this.viewConfig =
            new ViewConfigService();



        this.viewState =
            new ViewState();



        this.viewEngine =
            new ViewEngine(
                this.viewState
            );



        this.supabaseClient =

            new SupabaseClient({

                url:
                    this.config.getSupabaseUrl(),

                key:
                    this.config.getSupabaseKey()

            });



        let opportunityRepository;



        if (
            this.config.isSupabaseConfigured()
        ) {


            opportunityRepository =

                new SupabaseOpportunityRepository(

                    this.supabaseClient,

                    this.config

                );


        } else {


            opportunityRepository =

                new DemoOpportunityRepository();


        }



        this.opportunity =

            new OpportunityService(
                opportunityRepository
            );


    }


}
