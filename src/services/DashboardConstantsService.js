export class DashboardConstantsService {


    constructor(

        dashboardConstantsRepository

    ){


        this.dashboardConstantsRepository =

            dashboardConstantsRepository;


        this.cache =

            new Map();


        this.pendingLoads =

            new Map();


        this.defaults = {

            targetRoiPercent:

                20,


            targetMarginPercent:

                20,


            targetProfitAmount:

                3,


            vatRatePercent:

                20,


            vatOnCostPercent:

                20,


            vatOnSalePercent:

                20,


            referralFeePercent:

                15,


            fbaFee:

                0,


            nettPrepFee:

                0,


            digitalTaxFeePercent:

                2,


            fuelSurchargePercent:

                1.5,


            maxCostCalc:

                "ROI",


            maxCostCalcNoSupplier:

                "ROI"

        };


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






    hasValue(value){


        return (

            value !==

                null

            &&

            value !==

                undefined

            &&

            String(

                value

            ).trim() !==

                ""

        );


    }






    normaliseNumber(

        value,

        fallback

    ){


        if(!this.hasValue(value)){


            return fallback;


        }


        const parsed =

            Number(

                String(

                    value

                )

                    .replaceAll(

                        ",",

                        ""

                    )

                    .replace(

                        /[£$€%]/g,

                        ""

                    )

                    .trim()

            );


        return Number.isFinite(parsed)

            ? parsed

            : fallback;


    }






    getRowUserKey(row){


        return this.normaliseUserKey(

            row?.user_key

            ??

            row?.userKey

            ??

            row?.userid

            ??

            row?.user_id

        );


    }






    applyRow(

        constants,

        row

    ){


        if(!row){


            return constants;


        }


        const next = {

            ...constants

        };


        if(this.hasValue(row.nett_prep)){


            next.nettPrepFee =

                this.normaliseNumber(

                    row.nett_prep,

                    next.nettPrepFee

                );


        }


        if(this.hasValue(row.nett_prep_fee)){


            next.nettPrepFee =

                this.normaliseNumber(

                    row.nett_prep_fee,

                    next.nettPrepFee

                );


        }


        if(this.hasValue(row.fbm_cost)){


            next.fbaFee =

                this.normaliseNumber(

                    row.fbm_cost,

                    next.fbaFee

                );


        }


        if(this.hasValue(row.vat_rate)){


            next.vatRatePercent =

                this.normaliseNumber(

                    row.vat_rate,

                    next.vatRatePercent

                );


        }


        if(this.hasValue(row.vat_on_cost)){


            next.vatOnCostPercent =

                this.normaliseNumber(

                    row.vat_on_cost,

                    next.vatOnCostPercent

                );


        }


        if(this.hasValue(row.vat_rate_on_cost)){


            next.vatOnCostPercent =

                this.normaliseNumber(

                    row.vat_rate_on_cost,

                    next.vatOnCostPercent

                );


        }


        if(this.hasValue(row.vat_on_sale)){


            next.vatOnSalePercent =

                this.normaliseNumber(

                    row.vat_on_sale,

                    next.vatOnSalePercent

                );


        }


        if(this.hasValue(row.vat_rate_on_sale)){


            next.vatOnSalePercent =

                this.normaliseNumber(

                    row.vat_rate_on_sale,

                    next.vatOnSalePercent

                );


        }


        const digitalServiceFee =

            row.digital_service_fee

            ??

            row.digital_services_tax

            ??

            row.digital_tax_fee;


        if(this.hasValue(digitalServiceFee)){


            next.digitalTaxFeePercent =

                this.normaliseNumber(

                    digitalServiceFee,

                    next.digitalTaxFeePercent

                );


        }


        if(this.hasValue(row.fuel_surcharge_percent)){


            next.fuelSurchargePercent =

                this.normaliseNumber(

                    row.fuel_surcharge_percent,

                    next.fuelSurchargePercent

                );


        }


        if(this.hasValue(row.target_roi)){


            next.targetRoiPercent =

                this.normaliseNumber(

                    row.target_roi,

                    next.targetRoiPercent

                );


        }


        if(this.hasValue(row.target_profit)){


            next.targetProfitAmount =

                this.normaliseNumber(

                    row.target_profit,

                    next.targetProfitAmount

                );


        }


        if(this.hasValue(row.target_profit_margin)){


            next.targetMarginPercent =

                this.normaliseNumber(

                    row.target_profit_margin,

                    next.targetMarginPercent

                );


        }


        if(this.hasValue(row.max_cost_calc)){


            next.maxCostCalc =

                this.normaliseText(

                    row.max_cost_calc

                );


        }


        if(this.hasValue(row.max_cost_calc_no_supplier)){


            next.maxCostCalcNoSupplier =

                this.normaliseText(

                    row.max_cost_calc_no_supplier

                );


        }


        /*
            Preserve the raw database fields too.

            This helps the calculation migration remain
            compatible with the production HTML terminology.
        */


        return {

            ...next,

            ...row

        };


    }






    mergeRows(

        rows,

        userKey

    ){


        const resolvedUserKey =

            this.normaliseUserKey(

                userKey

            );


        const defaultRow =

            rows.find(row =>

                this.getRowUserKey(

                    row

                ) ===

                    "DEFAULT"

            );


        const userRow =

            resolvedUserKey ===

                "DEFAULT"

                ? null

                : rows.find(row =>

                    this.getRowUserKey(

                        row

                    ) ===

                        resolvedUserKey

                );


        let constants = {

            ...this.defaults

        };


        constants =

            this.applyRow(

                constants,

                defaultRow

            );


        constants =

            this.applyRow(

                constants,

                userRow

            );


        return constants;


    }






    async load(

        userKey,

        {

            force = false

        } = {}

    ){


        const resolvedUserKey =

            this.normaliseUserKey(

                userKey

            );


        if(

            !force

            &&

            this.cache.has(

                resolvedUserKey

            )

        ){


            return {

                ...this.cache.get(

                    resolvedUserKey

                )

            };


        }


        if(

            !force

            &&

            this.pendingLoads.has(

                resolvedUserKey

            )

        ){


            return this.pendingLoads.get(

                resolvedUserKey

            );


        }


        const pendingLoad =

            Promise.resolve()

                .then(async () => {


                    const rows =

                        await this.dashboardConstantsRepository.getRows(

                            resolvedUserKey

                        );


                    const constants =

                        this.mergeRows(

                            rows,

                            resolvedUserKey

                        );


                    this.cache.set(

                        resolvedUserKey,

                        constants

                    );


                    return {

                        ...constants

                    };


                })

                .finally(() => {


                    this.pendingLoads.delete(

                        resolvedUserKey

                    );


                });


        this.pendingLoads.set(

            resolvedUserKey,

            pendingLoad

        );


        return pendingLoad;


    }






    clearCache(userKey = null){


        if(!userKey){


            this.cache.clear();


            this.pendingLoads.clear();


            return;


        }


        const resolvedUserKey =

            this.normaliseUserKey(

                userKey

            );


        this.cache.delete(

            resolvedUserKey

        );


        this.pendingLoads.delete(

            resolvedUserKey

        );


    }


}