export class ViewConfigService {


    constructor() {


        this.views = {


            default: {

                id: "default",

                name: "Default View",


                columns: [

                    {
                        field: "asin",
                        label: "ASIN",
                        width: 140,
                        visible: true
                    },


                    {
                        field: "brand",
                        label: "Brand",
                        width: 160,
                        visible: true
                    },


                    {
                        field: "title",
                        label: "Product",
                        width: 300,
                        visible: true
                    },


                    {
                        field: "validated_sales_price",
                        label: "Sales Price",
                        width: 120,
                        visible: true
                    },


                    {
                        field: "opportunity_score",
                        label: "Score",
                        width: 100,
                        visible: true
                    },


                    {
                        field: "buy_signal",
                        label: "Buy Signal",
                        width: 150,
                        visible: true
                    },


                    {
                        field: "status",
                        label: "Status",
                        width: 120,
                        visible: true
                    }

                ]

            },



            supplier: {

                id: "supplier",

                name: "Supplier View",


                columns: [

                    {
                        field: "asin",
                        label: "ASIN",
                        width: 140,
                        visible: true
                    },


                    {
                        field: "brand",
                        label: "Brand",
                        width: 160,
                        visible: true
                    },


                    {
                        field: "supplier",
                        label: "Supplier",
                        width: 180,
                        visible: true
                    },


                    {
                        field: "supplier_price",
                        label: "Supplier Cost",
                        width: 120,
                        visible: true
                    },


                    {
                        field: "validated_sales_price",
                        label: "Sales Price",
                        width: 120,
                        visible: true
                    },


                    {
                        field: "opportunity_score",
                        label: "Score",
                        width: 100,
                        visible: true
                    },


                    {
                        field: "buy_signal",
                        label: "Buy Signal",
                        width: 150,
                        visible: true
                    }

                ]

            }


        };


    }



    getView(name = "default") {

        return this.views[name];

    }



    getColumns(name = "default") {

        const view =
            this.getView(name);


        return view.columns
            .filter(column => column.visible);

    }


}