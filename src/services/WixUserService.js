export class WixUserService {


    constructor(

        userRepository

    ){


        this.userRepository = userRepository;


        this.user = null;


        this.userKey = "DEFAULT";


    }







    async loadUserContext(){



        let wixId = null;



        /*
            Try Wix user id
        */


        if(

            window.wixUsers &&

            window.wixUsers.currentUser

        ){


            wixId =

                window.wixUsers.currentUser.id;


        }







        this.userKey =

            wixId ||

            "DEFAULT";






        console.log(

            "[PHX USER KEY]",

            this.userKey

        );







        this.user =

            await this.userRepository.getUserByKey(

                this.userKey

            );








        /*
            Safety fallback
        */


        if(!this.user){



            this.user = {


                user_key:

                    "DEFAULT",


                user_name:

                    "Testing",


                role:

                    "admin"


            };


        }








        console.log(

            "[PHX USER LOADED]",

            this.user

        );





        return this.user;



    }








    getUserKey(){


        return this.userKey;


    }



}