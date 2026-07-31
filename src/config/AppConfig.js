export class AppConfig {


    constructor() {


        this.supabase = {


            url:
                window.PHOENIX_CONFIG?.supabaseUrl
                || null,


            key:
                window.PHOENIX_CONFIG?.supabaseKey
                || null


        };


    }



    getSupabaseConfig() {


        return this.supabase;


    }



}