export class OpportunityService {


    constructor(repository) {


        this.repository = repository;


    }



    async getRows(view = "default") {


        const rows =
            await this.repository.getRows(view);



        return rows;


    }


}