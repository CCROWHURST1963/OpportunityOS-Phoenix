import { Logger } from "./Logger.js";
import { ViewConfigService } from "./ViewConfigService.js";
import { OpportunityService } from "./OpportunityService.js";

import { DemoOpportunityRepository } from "../repositories/DemoOpportunityRepository.js";
import { SupabaseOpportunityRepository } from "../repositories/SupabaseOpportunityRepository.js";

import { SupabaseClient } from "./SupabaseClient.js";
import { AppConfig } from "../config/AppConfig.js";


export class ServiceContainer {


    constructor() {


        this.logger =
            new Logger();



        this.config =
            new AppConfig();



        this.viewConfig =
            new ViewConfigService();



        this.supabaseClient =
            new SupabaseClient(
                this.config.getSupabaseConfig()
            );



        /*
            Repository switch point.

            false = demo data
            true  = Supabase

            We keep demo mode for now.
        */


        const useSupabase = false;



        const opportunityRepository =


            useSupabase

                ?

                new SupabaseOpportunityRepository(
                    this.supabaseClient
                )

                :

                new DemoOpportunityRepository();



        this.opportunity =

            new OpportunityService(
                opportunityRepository
            );


    }


}