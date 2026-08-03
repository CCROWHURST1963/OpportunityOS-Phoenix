export class ViewFilterService {


    constructor(

        repository

    ){


        this.repository =

            repository;


        this.cache = {

            brands:

                null,


            categories:

                null,


            assignedTo:

                null,


            statuses:

                null,


            subCategories:

                new Map()

        };


    }






    clearCache(){


        this.cache = {

            brands:

                null,


            categories:

                null,


            assignedTo:

                null,


            statuses:

                null,


            subCategories:

                new Map()

        };


    }






    async getBrands(){


        if(

            this.cache.brands

        ){


            return this.cache.brands;


        }


        const brands =

            await this.repository.getBrands();


        this.cache.brands =

            brands;


        return brands;


    }






    async getCategories(){


        if(

            this.cache.categories

        ){


            return this.cache.categories;


        }


        const categories =

            await this.repository.getCategories();


        this.cache.categories =

            categories;


        return categories;


    }






    async getAssignedTo(){


        if(

            this.cache.assignedTo

        ){


            return this.cache.assignedTo;


        }


        const assignedTo =

            await this.repository.getAssignedTo();


        this.cache.assignedTo =

            assignedTo;


        return assignedTo;


    }






    async getStatuses(){


        if(

            this.cache.statuses

        ){


            return this.cache.statuses;


        }


        const statuses =

            await this.repository.getStatuses();


        this.cache.statuses =

            statuses;


        return statuses;


    }






    async getSubCategories(

        category

    ){


        const key =

            String(

                category

                ??

                ""

            ).trim();


        if(

            this.cache.subCategories.has(

                key

            )

        ){


            return this.cache.subCategories.get(

                key

            );


        }


        const values =

            await this.repository.getSubCategoriesByCategory(

                key

            );


        this.cache.subCategories.set(

            key,

            values

        );


        return values;


    }






    async getOptions(

        view,

        context = {}

    ){


        switch(view){


            case "By Brand":


                return this.getBrands();




            case "By Category":


                return this.getCategories();




            case "By Assigned To":


                return this.getAssignedTo();




            case "By Status Tracker":


                return this.getStatuses();




            case "By Sub Category":


                return this.getSubCategories(

                    context.category

                );




            default:


                return [];


        }


    }


}