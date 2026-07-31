export class PhoenixConfig {


    constructor() {


        this.settings = {


            supabaseUrl:
                window.PHOENIX_CONFIG?.supabaseUrl
                || null,


            supabaseKey:
                window.PHOENIX_CONFIG?.supabaseKey
                || null,


            userKey:
                window.PHOENIX_CONFIG?.userKey
                || "DEFAULT"


        };


    }



    getSupabaseUrl() {


        return this.settings.supabaseUrl;


    }



    getSupabaseKey() {


        return this.settings.supabaseKey;


    }



    getUserKey() {


        return this.settings.userKey;


    }



    isSupabaseConfigured() {


        return Boolean(

            this.settings.supabaseUrl
            &&
            this.settings.supabaseKey

        );


    }


}