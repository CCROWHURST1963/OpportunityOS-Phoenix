export class WixUserService {


    constructor(

        userRepository

    ) {


        this.userRepository =
            userRepository;


    }





    async getRequestedUserKey() {


        /*
            Phoenix / OpportunityOS behaviour:

            The application works from
            internal userKey.

            Wix identity is only used
            to determine the active user.

            Local fallback:
            DEFAULT
        */


        try {


            if (

                window.PHOENIX_CONFIG?.userKey

            ) {


                return (

                    window.PHOENIX_CONFIG.userKey

                );


            }


        }

        catch(error) {


        }



        return "DEFAULT";


    }





    clean(value) {


        return String(

            value ?? ""

        )
        .trim();


    }





    async loadUserContext() {


        const requestedUserKey =

            await this.getRequestedUserKey();



        let appUser =

            await this.userRepository
                .getUserByKey(

                    requestedUserKey

                );



        let sourceKey =

            requestedUserKey;



        /*
            DEFAULT fallback
        */


        if (!appUser) {


            appUser =

                await this.userRepository
                    .getUserByKey(

                        "DEFAULT"

                    );


            sourceKey =

                "DEFAULT";


        }





        /*
            Final fallback

        */


        if (!appUser) {


            return {


                userKey:
                    "DEFAULT",


                userName:
                    "Default User",


                role:
                    "User",


                multiUsers:
                    false


            };


        }





        return {


            userKey:

                this.clean(

                    appUser.user_key
                    ||
                    appUser.user_id
                    ||
                    sourceKey

                )
                ||
                "DEFAULT",



            userName:

                this.clean(

                    appUser.user_name
                    ||
                    appUser.name
                    ||
                    appUser.display_name
                    ||
                    "User"

                ),



            role:

                this.clean(

                    appUser.role
                    ||
                    appUser.user_role
                    ||
                    appUser.user_type
                    ||
                    "User"

                ),



            multiUsers:

                Boolean(

                    appUser.multi_users

                )


        };


    }


}