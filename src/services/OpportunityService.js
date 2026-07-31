export class OpportunityService {


    constructor(repository) {


        this.repository =
            repository;


    }



    async getRows(view = "default") {


        const rows =

            await this.repository.getRows(
                view
            );



        return rows.map(row => {


            return {


                asin:
                    row.asin || "",


                locale:
                    row.locale || "UK",


                brand:
                    row.brand || "",


                title:
                    row.title || "",


                validated_sales_price:
                    row.validated_sales_price || 0,


                supplier:
                    row.supplier || "",


                supplier_price:
                    row.supplier_price || 0,


                opportunity_score:
                    row.opportunity_score || 0,


                buy_signal:
                    row.buy_signal || "",


                status:
                    row.status || ""


            };


        });


    }


}