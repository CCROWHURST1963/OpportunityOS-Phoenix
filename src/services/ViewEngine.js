export class ViewEngine {


    constructor(viewState) {


        this.viewState =
            viewState;


    }



    apply(rows) {


        let result =
            [...rows];



        const state =
            this.viewState.get();



        /*
            Supplier view

            Uses the same row collection.
            No separate loading pipeline.
        */

        if (

            state.activeView === "By Supplier"

            &&

            state.supplier

        ) {


            result =

                result.filter(row =>

                    row.supplier === state.supplier

                );


        }



        /*
            Future filters plug in here.
        */


        if (

            state.filter === "Strong Only"

        ) {


            result =

                result.filter(row =>

                    row.buy_signal ===
                    "Strong Opportunity"

                );


        }



        /*
            Single sorting point.
        */


        if (

            state.sort ===
            "opportunity_score_desc"

        ) {


            result.sort(

                (a,b) =>

                    (b.opportunity_score || 0)

                    -

                    (a.opportunity_score || 0)

            );


        }



        /*
            Row limit

        */


        if (

            state.rowLimit

        ) {


            result =

                result.slice(

                    0,

                    state.rowLimit

                );


        }



        return result;


    }


}