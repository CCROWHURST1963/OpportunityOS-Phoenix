export class ImportOpportunityService {


    constructor(

        opportunityService,

        supabaseClient,

        appState

    ){


        this.opportunityService =

            opportunityService;


        this.supabaseClient =

            supabaseClient;


        this.appState =

            appState;


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseValues(values){


        if(!Array.isArray(values)){


            return [];


        }


        const seen =

            new Set();


        const result =

            [];


        for(

            const source of values

        ){


            const value =

                this.normaliseText(

                    source

                );


            if(!value){


                continue;


            }


            const key =

                value.toLocaleLowerCase();


            if(seen.has(key)){


                continue;


            }


            seen.add(key);


            result.push(

                value

            );


        }


        return result;


    }






    normaliseLimit(value){


        const parsed =

            Number(

                value

            );


        if(

            !Number.isFinite(parsed)

            ||

            parsed <= 0

        ){


            return 100;


        }


        return Math.floor(

            parsed

        );


    }






    getState(){


        return this.appState?.getState?.()

            ||

            {};


    }






    getOpportunityRepository(){


        return this.opportunityService

            ?.opportunityRepository

            ??

            null;


    }






    quoteInValue(value){


        return `"${

            String(

                value

            )

                .replaceAll(

                    "\\",

                    "\\\\"

                )

                .replaceAll(

                    "\"",

                    "\\\""

                )

        }"`;


    }






    buildInExpression(values){


        return `in.(${

            values

                .map(value =>

                    this.quoteInValue(

                        value

                    )

                )

                .join(",")

        })`;


    }






    chunkValues(

        values,

        size = 50

    ){


        const result =

            [];


        for(

            let index = 0;

            index < values.length;

            index += size

        ){


            result.push(

                values.slice(

                    index,

                    index + size

                )

            );


        }


        return result;


    }






    dedupeRows(rows){


        const seen =

            new Set();


        const result =

            [];


        for(

            const row of rows

        ){


            const asin =

                this.normaliseText(

                    row?.asin

                );


            const key =

                `${

                    asin.toUpperCase()

                }|${

                    this.normaliseText(

                        row?.locale

                    ).toLowerCase()

                }`;


            if(

                !asin

                ||

                seen.has(

                    key

                )

            ){


                continue;


            }


            seen.add(

                key

            );


            result.push(

                row

            );


        }


        return result;


    }






    async enrichAndResolve(

        rows,

        request

    ){


        let result =

            Array.isArray(rows)

                ? rows

                : [];


        if(

            this.opportunityService

            &&

            typeof this.opportunityService.enrichRows ===

                "function"

        ){


            result =

                await this.opportunityService.enrichRows(

                    result

                );


        }


        if(

            this.opportunityService

            &&

            typeof this.opportunityService.resolveDomainRows ===

                "function"

        ){


            result =

                await this.opportunityService.resolveDomainRows(

                    result,

                    request

                );


        }


        return Array.isArray(result)

            ? result

            : [];


    }






    async loadRowsByAsin(

        importValues,

        request

    ){


        if(

            !this.supabaseClient

            ||

            typeof this.supabaseClient.selectRows !==

                "function"

        ){


            throw new Error(

                "Supabase row lookup is not available for ASIN import"

            );


        }


        const state =

            this.getState();


        const locale =

            this.normaliseText(

                request.locale

            )

            ||

            this.normaliseText(

                state.locale

            )

            ||

            "co.uk";


        const rowsLimit =

            this.normaliseLimit(

                request.rowsLimit

                ??

                request.limit

            );


        const values =

            importValues.map(

                value =>

                    value.toUpperCase()

            );


        const allRows =

            [];


        for(

            const chunk of this.chunkValues(

                values

            )

        ){


            const rows =

                await this.supabaseClient.selectRows(

                    "opportunity_database",

                    {

                        select:

                            "*",


                        filters: {

                            locale:

                                `eq.${locale}`,


                            asin:

                                this.buildInExpression(

                                    chunk

                                )

                        },


                        limit:

                            rowsLimit

                    }

                );


            allRows.push(

                ...rows

            );


            if(

                allRows.length >=

                rowsLimit

            ){


                break;


            }


        }


        const directRows =

            this.dedupeRows(

                allRows

            )

                .slice(

                    0,

                    rowsLimit

                );


        console.log(

            "[PHX IMPORT ASIN LOOKUP]",

            {

                values:

                    importValues.length,


                rows:

                    directRows.length,


                locale:

                    locale

            }

        );


        return this.enrichAndResolve(

            directRows,

            request

        );


    }






    async loadRowsByBarcode(

        importValues,

        request

    ){


        const repository =

            this.getOpportunityRepository();


        if(

            !repository

            ||

            typeof repository.loadRowsByBarcode !==

                "function"

        ){


            throw new Error(

                "Opportunity repository barcode lookup is not available"

            );


        }


        const rows =

            await repository.loadRowsByBarcode({

                ...request,


                importValues:

                    importValues

            });


        console.log(

            "[PHX IMPORT BARCODE LOOKUP]",

            {

                values:

                    importValues.length,


                rows:

                    Array.isArray(rows)

                        ? rows.length

                        : 0

            }

        );


        return this.enrichAndResolve(

            rows,

            request

        );


    }






    async getRows(request = {}){


        const state =

            this.getState();


        const importType =

            this.normaliseText(

                request.importType

                ??

                state.importType

            );


        const importFileName =

            this.normaliseText(

                request.importFileName

                ??

                state.importFileName

            );


        const importValues =

            this.normaliseValues(

                request.importValues

                ??

                state.importValues

            );


        if(!importType){


            throw new Error(

                "Select an Import Type before loading the dashboard"

            );


        }


        if(!importFileName){


            throw new Error(

                "Choose an import file before loading the dashboard"

            );


        }


        if(

            importValues.length ===

            0

        ){


            throw new Error(

                "The selected import file did not contain any values"

            );


        }


        console.log(

            "[PHX IMPORT OPPORTUNITY SERVICE]",

            {

                importType:

                    importType,


                importFileName:

                    importFileName,


                values:

                    importValues.length

            }

        );


        if(

            importType ===

            "By Brand"

        ){


            if(

                !this.opportunityService

                ||

                typeof this.opportunityService.getRows !==

                    "function"

            ){


                throw new Error(

                    "Opportunity service is not available for import lookup"

                );


            }


            return this.opportunityService.getRows({

                ...request,


                opportunityMode:

                    "By View",


                opportunityView:

                    "By Brand",


                attributeField:

                    "brand",


                selectedAttributeValues:

                    importValues,


                viewFilterType:

                    "brand",


                viewFilterValues:

                    importValues

            });


        }


        if(

            importType ===

            "By ASIN"

        ){


            return this.loadRowsByAsin(

                importValues,

                request

            );


        }


        if(

            importType ===

            "By Barcode"

        ){


            return this.loadRowsByBarcode(

                importValues,

                request

            );


        }


        throw new Error(

            `Unsupported import type: ${importType}`

        );


    }


}