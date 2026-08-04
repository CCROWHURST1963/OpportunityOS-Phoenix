export class ScoreRule{


    constructor(

        resolver

    ){


        this.resolver =

            resolver;


    }






    result(

        rule,

        label,

        score,

        maxScore,

        detail = ""

    ){


        return{

            rule,

            label,

            score,

            maxScore,

            detail

        };


    }


}