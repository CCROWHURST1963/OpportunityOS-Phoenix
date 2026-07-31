export class AppConfig {


    constructor() {


        this.supabase = {


            url: null,

            key: null


        };


    }



    getSupabaseConfig() {


        return this.supabase;


    }



    setSupabaseConfig(config = {}) {


        this.supabase = {


            url:
                config.url || null,


            key:
                config.key || null


        };


    }


}