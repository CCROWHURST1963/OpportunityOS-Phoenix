export class ScoringRuleService {


    constructor(

        repository

    ){


        this.repository =

            repository;


        this.rules = [];


        this.source =

            "";


    }






    ensureAvailable(){


        if(

            !this.repository

            ||

            typeof this.repository.getRows !==

                "function"

        ){


            throw new Error(

                "ScoringRuleService requires ScoringRuleRepository.getRows()"

            );


        }


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseUserKey(value){


        return this.normaliseText(

            value

        )

        ||

        "DEFAULT";


    }






    number(

        value,

        fallback = 0

    ){


        if(

            value === null

            ||

            value === undefined

            ||

            String(

                value

            ).trim() === ""

        ){


            return fallback;


        }


        const parsed =

            Number(

                value

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : fallback;


    }






    isActive(row){


        return Boolean(

            row

        )

        &&

        row.active !== false;


    }






    sortRules(rows){


        return rows

            .map(

                (

                    row,

                    index

                ) => ({


                    ...row,


                    sort_order:

                        this.number(

                            row?.sort_order,

                            index

                        ),


                    active:

                        row?.active !== false

                })

            )

            .sort(

                (

                    first,

                    second

                ) => {


                    const orderDifference =

                        this.number(

                            first.sort_order,

                            0

                        )

                        -

                        this.number(

                            second.sort_order,

                            0

                        );


                    if(orderDifference !== 0){


                        return orderDifference;


                    }


                    const ruleDifference =

                        this.normaliseText(

                            first.rule_name

                        ).localeCompare(

                            this.normaliseText(

                                second.rule_name

                            )

                        );


                    if(ruleDifference !== 0){


                        return ruleDifference;


                    }


                    return this.normaliseText(

                        first.option_label

                    ).localeCompare(

                        this.normaliseText(

                            second.option_label

                        )

                    );


                }

            );


    }






    selectRules(

        rows,

        userKey

    ){


        const resolvedUserKey =

            this.normaliseUserKey(

                userKey

            );


        const activeRows =

            Array.isArray(

                rows

            )

                ? rows.filter(

                    row =>

                        this.isActive(

                            row

                        )

                )

                : [];


        /*
            Production OpportunityOS behaviour:

            1. Use the user's complete active rule set when
               at least one user-specific row exists.

            2. Otherwise use the complete DEFAULT rule set.

            DEFAULT and user-specific rows are deliberately
            not merged.
        */


        if(resolvedUserKey !== "DEFAULT"){


            const userRows =

                activeRows.filter(

                    row =>

                        this.normaliseText(

                            row.user_key

                        ) ===

                        resolvedUserKey

                );


            if(userRows.length > 0){


                return {

                    rows:

                        this.sortRules(

                            userRows

                        ),


                    source:

                        resolvedUserKey

                };


            }


        }


        const defaultRows =

            activeRows.filter(

                row =>

                    this.normaliseText(

                        row.user_key

                    ) ===

                    "DEFAULT"

            );


        return {

            rows:

                this.sortRules(

                    defaultRows

                ),


            source:

                "DEFAULT"

        };


    }






    async loadRules(userKey){


        this.ensureAvailable();


        const resolvedUserKey =

            this.normaliseUserKey(

                userKey

            );


        const rows =

            await this.repository.getRows(

                resolvedUserKey

            );


        const selected =

            this.selectRules(

                rows,

                resolvedUserKey

            );


        this.rules =

            selected.rows;


        this.source =

            selected.source;


        return this.rules;


    }






    getRules(){


        return this.rules.slice();


    }






    getSource(){


        return this.source;


    }






    getAudit(){


        return {

            source:

                this.source,


            ruleRows:

                this.rules.length,


            ruleNames:

                Array.from(

                    new Set(

                        this.rules.map(

                            row =>

                                this.normaliseText(

                                    row.rule_name

                                )

                        )

                    )

                )

        };


    }


}