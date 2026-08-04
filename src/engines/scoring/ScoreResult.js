export class ScoreResult {


    constructor(){


        this.rawScore = 0;

        this.maxScore = 0;

        this.percent = 0;

        this.completed = false;

        this.rules = [];

        this.breakdown = [];

    }






    add(rule){


        if(!rule){

            return;

        }


        const score =

            Number(

                rule.score

                ??

                0

            );


        const maxScore =

            Number(

                rule.maxScore

                ??

                0

            );


        this.rawScore += score;

        this.maxScore += maxScore;


        this.rules.push(rule);


        this.breakdown.push({

            rule:

                rule.rule,

            label:

                rule.label,

            outcome:

                rule.outcome,

            value:

                rule.value,

            score:

                score,

            maxScore:

                maxScore,

            validated:

                rule.validated,

            calculation:

                rule.calculation

        });


    }






    complete(){


        this.percent =

            this.maxScore > 0

                ? Math.round(

                    (

                        this.rawScore

                        /

                        this.maxScore

                    )

                    * 100

                )

                : 0;


        this.completed = true;

    }






    toJSON(){


        return {

            rawScore:

                this.rawScore,

            maxScore:

                this.maxScore,

            percent:

                this.percent,

            completed:

                this.completed,

            rules:

                this.rules,

            breakdown:

                this.breakdown

        };

    }


}