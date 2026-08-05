export class StatusEngine {

    calculate(row) {

        return this.calculateTransition(
            row
        );

    }


    calculateTransition(row) {

        const eligible =
            String(
                row.eligible_to_sell ??
                ""
            ).trim();

        const buySignal =
            String(
                row.buy_signal ??
                ""
            ).trim();

        const disqualified =
            [

                "Gated - Not Accepting Applications",

                "Exclude",

                "Possible Private Label Product",

                "Gated - Transparency Code Needed",

                "Large Oversize",

                "Low Sales"

            ];

        if (

            disqualified.includes(
                eligible
            )

        ) {

            return "Qualified Out";

        }

        if (

            buySignal ===
            "Avoid"

        ) {

            return "Qualified Out";

        }

        const qualifyingBuySignals =
            [

                "Strong Buy",

                "Strong Opportunity"

            ];

        const eligibleForQualification =
            [

                "No Known Issues",

                "Gated - Approved",

                "Gated - Approval Needed"

            ];

        if (

            eligibleForQualification.includes(
                eligible
            )

            &&

            qualifyingBuySignals.includes(
                buySignal
            )

        ) {

            return "Qualified";

        }

        return null;

    }

}