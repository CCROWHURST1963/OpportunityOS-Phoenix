export class ViewConfigService {


    constructor(

        repository

    ){


        this.repository = repository;


        this.userKey = "DEFAULT";


        this.views = [];


        this.currentView = null;


    }






    setUserKey(

        userKey

    ){


        this.userKey =

            userKey ||

            "DEFAULT";


    }








    async loadUserViews(){



        this.views =

            await this.repository.getViews(

                this.userKey

            );



        console.log(

            "[PHX USER VIEWS]",

            this.views

        );



        return this.views;


    }








    async loadCurrentView(

        process

    ){



        console.log(

            "[PHX LOAD VIEW]",

            {

                user:this.userKey,

                process

            }

        );







        let view =

            await this.repository.getUserView(

                this.userKey,

                process

            );







        if(!view){



            console.log(

                "[PHX VIEW FALLBACK]",

                "DEFAULT"

            );



            view =

                await this.repository.getUserView(

                    "DEFAULT",

                    process

                );


        }







        this.currentView = view;





        console.log(

            "[PHX CURRENT VIEW]",

            view

        );





        return view;



    }








    getCurrentView(){


        return this.currentView;


    }








    getViews(){


        return this.views;


    }



}