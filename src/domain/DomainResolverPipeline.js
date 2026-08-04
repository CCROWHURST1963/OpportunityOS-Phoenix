export class DomainResolverPipeline {


    constructor(

        resolvers = []

    ){

        this.resolvers =

            Array.isArray(

                resolvers

            )

                ? resolvers

                : [];

    }






    register(

        resolver

    ){

        this.resolvers.push(

            resolver

        );

        return this;

    }






    async resolve(

        row

    ){

        let resolved =

            row;

        for(

            const resolver of this.resolvers

        ){

            if(

                resolver

                &&

                typeof resolver.resolve ===

                    "function"

            ){

                resolved =

                    await resolver.resolve(

                        resolved

                    );

            }

        }

        return resolved;

    }






    async resolveRows(

        rows = []

    ){

        const resolvedRows =

            [];

        for(

            const row of rows

            ){

            resolvedRows.push(

                await this.resolve(

                    row

                )

            );

        }

        return resolvedRows;

    }

}