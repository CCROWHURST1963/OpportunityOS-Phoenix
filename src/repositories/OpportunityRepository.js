export class OpportunityRepository {


    constructor() {


        if (this.constructor === OpportunityRepository) {

            throw new Error(
                "OpportunityRepository is an abstract repository"
            );

        }


    }



    async getRows(view = "default") {


        throw new Error(
            "getRows(view) must be implemented"
        );


    }


}