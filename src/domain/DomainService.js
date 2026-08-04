export class DomainService {

    constructor(

        pipeline

    ){

        this.pipeline =

            pipeline;

    }






    async resolveRows(

        rows,

        dashboardConstants,

        options = {}

    ){

        return this.pipeline.resolveRows(

            rows,

            dashboardConstants,

            options

        );

    }

}