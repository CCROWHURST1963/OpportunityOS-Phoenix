export class RuleResult {


    constructor({

        rule,

        label,

        outcome,

        value = null,

        validated = "",

        ruleApplied = "",

        calculation = "",

        resolverType = "score",

        fallbackScore = 0

    } = {}){


        this.rule =

            String(

                rule

                ??

                ""

            ).trim();


        this.label =

            String(

                label

                ??

                this.rule

            ).trim();


        this.outcome =

            String(

                outcome

                ??

                ""

            ).trim();


        this.value =

            value;


        this.validated =

            String(

                validated

                ??

                ""

            ).trim();


        this.ruleApplied =

            String(

                ruleApplied

                ??

                ""

            ).trim();


        this.calculation =

            String(

                calculation

                ??

                ""

            ).trim();


        /*
            "score" means categorical ruleScore().
            "band" means numeric ruleBand().
            "direct" means the rule already owns its score,
            used only where production HTML explicitly does so.
        */


        this.resolverType =

            String(

                resolverType

                ??

                "score"

            ).trim();


        this.fallbackScore =

            Number.isFinite(

                Number(

                    fallbackScore

                )

            )

                ? Number(

                    fallbackScore

                )

                : 0;


    }






    toJSON(){


        return {

            rule:

                this.rule,


            label:

                this.label,


            outcome:

                this.outcome,


            value:

                this.value,


            validated:

                this.validated,


            ruleApplied:

                this.ruleApplied,


            calculation:

                this.calculation,


            resolverType:

                this.resolverType,


            fallbackScore:

                this.fallbackScore

        };


    }


}