export class DemoOpportunityRepository {


    constructor() {


        this.datasets = {


            default: [

                {
                    asin: "B001TEST01",
                    locale: "UK",
                    brand: "Demo Brand",
                    title: "Phoenix Test Product",
                    validated_sales_price: 14.99,
                    opportunity_score: 82,
                    buy_signal: "Strong Opportunity",
                    status: "Qualified"
                },


                {
                    asin: "B002TEST02",
                    locale: "UK",
                    brand: "Sample Brand",
                    title: "Second Test Product",
                    validated_sales_price: 19.99,
                    opportunity_score: 65,
                    buy_signal: "Review",
                    status: "Review"
                }

            ],



            supplier: [

                {
                    asin: "B001TEST01",
                    locale: "UK",
                    brand: "Demo Brand",
                    title: "Phoenix Test Product",
                    supplier: "Supplier A",
                    supplier_price: 4.50,
                    validated_sales_price: 14.99,
                    opportunity_score: 82,
                    buy_signal: "Strong Opportunity",
                    status: "Qualified"
                },


                {
                    asin: "B002TEST02",
                    locale: "UK",
                    brand: "Sample Brand",
                    title: "Second Test Product",
                    supplier: "Supplier B",
                    supplier_price: 6.20,
                    validated_sales_price: 19.99,
                    opportunity_score: 65,
                    buy_signal: "Review",
                    status: "Review"
                }

            ]


        };


    }



    async getRows(view = "default") {


        return this.datasets[view] || [];


    }


}