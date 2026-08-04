export class ColumnRegistry {


    constructor(){


        /*
            Standard row aliases.

            These preserve compatibility with saved views
            that use legacy leading-underscore field names.
        */


        this.aliases = {

            "_brand":

                "brand",


            "_category":

                "categories_root",


            "_sub_category":

                "sub_category",


            "_title":

                "title",


            "_buy_qty":

                "buy_qty",


            "_pack_size":

                "pack_size",


            "_supplier":

                "supplier",


            "_price":

                "supplier_price"

        };






        /*
            Canonical Phoenix calculation fields.

            Any grid column using one of these field names
            reads from row.calc first.

            This ensures the grid displays exactly the same
            financial values produced by CalculationEngine.
        */


        this.calculationAliases = {

            /*
                Resolved Cost / Cost Price
            */


            resolvedCost:

                "resolvedCost",


            resolved_cost:

                "resolvedCost",


            costPrice:

                "resolvedCost",


            cost_price:

                "resolvedCost",


            _cost_price:

                "resolvedCost",


            effective_cost:

                "resolvedCost",


            calculated_cost:

                "resolvedCost",





            /*
                Break Even Price
            */


            breakEvenPrice:

                "breakEvenPrice",


            break_even_price:

                "breakEvenPrice",


            breakeven_price:

                "breakEvenPrice",


            _break_even_price:

                "breakEvenPrice",


            _breakeven_price:

                "breakEvenPrice",





            /*
                Target Selling Price
            */


            targetSellingPrice:

                "targetSellingPrice",


            target_selling_price:

                "targetSellingPrice",


            _target_selling_price:

                "targetSellingPrice",


            adjusted_target_selling_price:

                "targetSellingPrice",





            /*
                Maximum Cost
            */


            maximumCost:

                "maximumCost",


            maximum_cost:

                "maximumCost",


            maxCost:

                "maximumCost",


            max_cost:

                "maximumCost",


            _maximum_cost:

                "maximumCost",


            _max_cost:

                "maximumCost",


            target_selling_price_max_cost:

                "maximumCost",





            /*
                Profit
            */


            profit:

                "profit",


            _profit:

                "profit",


            profit_amount:

                "profit",


            calculated_profit:

                "profit",


            target_price_profit:

                "profit",





            /*
                ROI
            */


            roi:

                "roi",


            _roi:

                "roi",


            roi_percent:

                "roi",


            roi_percentage:

                "roi",


            return_on_investment:

                "roi",


            calculated_roi:

                "roi",





            /*
                Profit Margin
            */


            margin:

                "margin",


            _margin:

                "margin",


            margin_percent:

                "margin",


            margin_percentage:

                "margin",


            profit_margin:

                "margin",


            calculated_margin:

                "margin",





            /*
                VAT values
            */


            vatOnCost:

                "vatOnCost",


            vat_on_cost:

                "vatOnCost",


            cost_vat_amount:

                "vatOnCost",


            vatDue:

                "vatDue",


            vat_due:

                "vatDue",


            tax_due:

                "vatDue",





            /*
                Cost source / audit
            */


            costSource:

                "costSource",


            cost_source:

                "costSource",


            resolved_cost_source:

                "costSource"

        };


    }






    hasValue(value){


        return (

            value !== undefined

            &&

            value !== null

        );


    }






    getCalculationValue(

        key,

        row

    ){


        const calculationKey =

            this.calculationAliases[key];


        if(!calculationKey){


            return undefined;


        }


        const calculation =

            row?.calc;


        if(

            calculation

            &&

            typeof calculation ===

                "object"

            &&

            this.hasValue(

                calculation[calculationKey]

            )

        ){


            return calculation[calculationKey];


        }


        return undefined;


    }






    getDirectRowValue(

        key,

        row

    ){


        if(

            this.hasValue(

                row?.[key]

            )

        ){


            return row[key];


        }


        return undefined;


    }






    getAliasValue(

        key,

        row

    ){


        const alias =

            this.aliases[key];


        if(

            alias

            &&

            this.hasValue(

                row?.[alias]

            )

        ){


            return row[alias];


        }


        return undefined;


    }






    getCleanKeyValue(

        key,

        row

    ){


        if(

            !String(

                key

            ).startsWith(

                "_"

            )

        ){


            return undefined;


        }


        const cleanKey =

            String(

                key

            ).substring(

                1

            );


        if(

            this.hasValue(

                row?.[cleanKey]

            )

        ){


            return row[cleanKey];


        }


        return undefined;


    }






    getNestedCalculationFallback(

        key,

        row

    ){


        const calculation =

            row?.calc;


        if(

            !calculation

            ||

            typeof calculation !==

                "object"

        ){


            return undefined;


        }


        /*
            Preserve compatibility while CalculationEngine
            still publishes its original nested values object.
        */


        const values =

            calculation.values;


        if(

            values

            &&

            typeof values ===

                "object"

            &&

            this.hasValue(

                values[key]

            )

        ){


            return values[key];


        }


        return undefined;


    }






    getValue(

        key,

        row

    ){


        if(

            !row

            ||

            !key

        ){


            return "";


        }






        /*
            Financial columns always prefer row.calc.

            This prevents stale RPC or legacy row values from
            overriding the canonical Phoenix calculation.
        */


        const calculationValue =

            this.getCalculationValue(

                key,

                row

            );


        if(

            this.hasValue(

                calculationValue

            )

        ){


            return calculationValue;


        }






        /*
            Non-financial columns continue using their direct
            row values exactly as before.
        */


        const directValue =

            this.getDirectRowValue(

                key,

                row

            );


        if(

            this.hasValue(

                directValue

            )

        ){


            return directValue;


        }






        const aliasValue =

            this.getAliasValue(

                key,

                row

            );


        if(

            this.hasValue(

                aliasValue

            )

        ){


            return aliasValue;


        }






        const cleanKeyValue =

            this.getCleanKeyValue(

                key,

                row

            );


        if(

            this.hasValue(

                cleanKeyValue

            )

        ){


            return cleanKeyValue;


        }






        const nestedCalculationValue =

            this.getNestedCalculationFallback(

                key,

                row

            );


        if(

            this.hasValue(

                nestedCalculationValue

            )

        ){


            return nestedCalculationValue;


        }


        return "";


    }


}