export class BuySignalResult {


    constructor({

        signal = "",

        colour = "",

        score = 0,

        reason = "",

        reasonCode = "",

        matchedRule = null,

        rules = [],

        completed = false,

        targetAlreadyAchieved = false,

        watchPriceScore = null,

        hardCapApplied = false

    } = {}){


        this.signal =

            String(

                signal

                ??

                ""

            ).trim();


        this.colour =

            String(

                colour

                ??

                ""

            ).trim();


        this.score =

            Number.isFinite(

                Number(score)

            )

                ? Number(score)

                : 0;


        this.reason =

            String(

                reason

                ??

                ""

            ).trim();


        this.reasonCode =

            String(

                reasonCode

                ??

                ""

            ).trim();


        this.matchedRule =

            matchedRule

            &&

            typeof matchedRule ===

                "object"

                ? {

                    ...matchedRule

                }

                : null;


        this.rules =

            Array.isArray(

                rules

            )

                ? rules.map(

                    rule =>

                        rule

                        &&

                        typeof rule ===

                            "object"

                            ? {

                                ...rule

                            }

                            : rule

                )

                : [];


        this.completed =

            Boolean(

                completed

            );


        this.targetAlreadyAchieved =

            Boolean(

                targetAlreadyAchieved

            );


        this.watchPriceScore =

            watchPriceScore === null

            ||

            watchPriceScore === undefined

                ? null

                : Number(

                    watchPriceScore

                );


        this.hardCapApplied =

            Boolean(

                hardCapApplied

            );


    }






    toJSON(){


        return {

            signal:

                this.signal,


            buySignal:

                this.signal,


            buy_signal:

                this.signal,


            label:

                this.signal,


            colour:

                this.colour,


            color:

                this.colour,


            score:

                this.score,


            percent:

                this.score,


            reason:

                this.reason,


            reasonText:

                this.reason,


            reasonCode:

                this.reasonCode,


            matchedRule:

                this.matchedRule,


            rules:

                this.rules.map(

                    rule =>

                        rule

                        &&

                        typeof rule ===

                            "object"

                            ? {

                                ...rule

                            }

                            : rule

                ),


            completed:

                this.completed,


            targetAlreadyAchieved:

                this.targetAlreadyAchieved,


            watchPriceScore:

                this.watchPriceScore,


            hardCapApplied:

                this.hardCapApplied

        };


    }


}