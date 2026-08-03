export class AttributeService {


    constructor(

        attributeRepository

    ){


        this.attributeRepository =

            attributeRepository;


        /*
            Raw attribute rows are cached by attribute only.

            Changing between:

            - Alphabetical
            - Top Opportunities
            - Top Bought
            - Top 10 / 25 / 50 / 100

            does not trigger another Supabase request.
        */


        this.rawRowsCache =

            new Map();


        this.resultCache =

            new Map();


        this.pendingLoads =

            new Map();


    }






    normaliseText(value){


        return String(

            value

            ??

            ""

        ).trim();


    }






    normaliseNumber(value){


        if(

            value ===

            null

            ||

            value ===

            undefined

            ||

            value ===

            ""

        ){


            return 0;


        }


        const cleaned =

            String(

                value

            )

                .replaceAll(

                    ",",

                    ""

                )

                .replace(

                    /[^0-9.-]/g,

                    ""

                );


        const parsed =

            Number(

                cleaned

            );


        return Number.isFinite(

            parsed

        )

            ? parsed

            : 0;


    }






    normaliseAttribute(value){


        const attribute =

            this.normaliseText(

                value

            );


        const allowedAttributes =

            new Set([

                "brand",

                "categories_root",

                "sub_category"

            ]);


        if(

            !allowedAttributes.has(

                attribute

            )

        ){


            throw new Error(

                `Unsupported attribute: ${attribute}`

            );


        }


        return attribute;


    }






    normaliseSelectionType(value){


        const selectionType =

            this.normaliseText(

                value

            );


        const allowedTypes =

            new Set([

                "alphabetical",

                "top_opportunities",

                "top_bought"

            ]);


        if(

            !allowedTypes.has(

                selectionType

            )

        ){


            throw new Error(

                `Unsupported selection type: ${selectionType}`

            );


        }


        return selectionType;


    }






    normaliseTopCount(value){


        const parsed =

            Number(

                value

            );


        const allowedValues =

            [

                10,

                25,

                50,

                100

            ];


        return allowedValues.includes(

            parsed

        )

            ? parsed

            : 10;


    }






    validate(request){


        if(

            !request

            ||

            typeof request !==

                "object"

        ){


            throw new Error(

                "Attribute request missing"

            );


        }


        this.normaliseAttribute(

            request.attribute

        );


        this.normaliseSelectionType(

            request.selectionType

        );


    }






    buildRawRowsCacheKey(attribute){


        return this.normaliseAttribute(

            attribute

        );


    }






    buildResultCacheKey({

        attribute,

        selectionType,

        topCount

    }){


        return JSON.stringify({

            attribute:

                attribute,


            selectionType:

                selectionType,


            topCount:

                topCount

        });


    }






    normaliseRawRow(source){


        const row =

            source

            &&

            typeof source ===

                "object"

                ? source

                : {};


        return {

            value:

                this.normaliseText(

                    row.value

                ),


            bought:

                this.normaliseNumber(

                    row.bought

                    ??

                    row.boughtCount

                    ??

                    row.bought_count

                    ??

                    0

                )

        };


    }






    normaliseRawRows(rows){


        if(

            !Array.isArray(

                rows

            )

        ){


            return [];


        }


        return rows

            .map(row =>

                this.normaliseRawRow(

                    row

                )

            )

            .filter(row =>

                row.value

            );


    }






    async loadRawRows(attribute){


        const cacheKey =

            this.buildRawRowsCacheKey(

                attribute

            );


        if(

            this.rawRowsCache.has(

                cacheKey

            )

        ){


            console.log(

                "[PHX ATTRIBUTE RAW CACHE HIT]",

                cacheKey

            );


            return this.rawRowsCache.get(

                cacheKey

            );


        }


        if(

            this.pendingLoads.has(

                cacheKey

            )

        ){


            console.log(

                "[PHX ATTRIBUTE PENDING LOAD REUSED]",

                cacheKey

            );


            return this.pendingLoads.get(

                cacheKey

            );


        }


        const pendingLoad =

            Promise.resolve()

                .then(async () => {


                    console.log(

                        "[PHX ATTRIBUTE RAW LOAD]",

                        {

                            attribute:

                                cacheKey

                        }

                    );


                    const rows =

                        await this.attributeRepository.getRows({

                            attribute:

                                cacheKey

                        });


                    const normalisedRows =

                        this.normaliseRawRows(

                            rows

                        );


                    this.rawRowsCache.set(

                        cacheKey,

                        normalisedRows

                    );


                    console.log(

                        "[PHX ATTRIBUTE RAW LOAD COMPLETE]",

                        {

                            attribute:

                                cacheKey,


                            rows:

                                normalisedRows.length

                        }

                    );


                    return normalisedRows;


                })

                .finally(() => {


                    this.pendingLoads.delete(

                        cacheKey

                    );


                });


        this.pendingLoads.set(

            cacheKey,

            pendingLoad

        );


        return pendingLoad;


    }






    aggregateRows(rows){


        const aggregates =

            new Map();


        for(

            const row of rows

        ){


            const value =

                this.normaliseText(

                    row.value

                );


            if(!value){


                continue;


            }


            const key =

                value.toLocaleLowerCase();


            let aggregate =

                aggregates.get(

                    key

                );


            if(!aggregate){


                aggregate = {

                    value:

                        value,


                    opportunityCount:

                        0,


                    boughtCount:

                        0

                };


                aggregates.set(

                    key,

                    aggregate

                );


            }


            aggregate.opportunityCount +=

                1;


            aggregate.boughtCount +=

                this.normaliseNumber(

                    row.bought

                );


        }


        return [

            ...aggregates.values()

        ];


    }






    sortAlphabetically(rows){


        return [

            ...rows

        ].sort(

            (left, right) => {


                return left.value.localeCompare(

                    right.value,

                    undefined,

                    {

                        sensitivity:

                            "base",


                        numeric:

                            true

                    }

                );


            }

        );


    }






    sortByOpportunities(rows){


        return [

            ...rows

        ].sort(

            (left, right) => {


                const countDifference =

                    right.opportunityCount

                    -

                    left.opportunityCount;


                if(countDifference !== 0){


                    return countDifference;


                }


                return left.value.localeCompare(

                    right.value,

                    undefined,

                    {

                        sensitivity:

                            "base",


                        numeric:

                            true

                    }

                );


            }

        );


    }






    sortByBought(rows){


        return [

            ...rows

        ].sort(

            (left, right) => {


                const boughtDifference =

                    right.boughtCount

                    -

                    left.boughtCount;


                if(boughtDifference !== 0){


                    return boughtDifference;


                }


                const countDifference =

                    right.opportunityCount

                    -

                    left.opportunityCount;


                if(countDifference !== 0){


                    return countDifference;


                }


                return left.value.localeCompare(

                    right.value,

                    undefined,

                    {

                        sensitivity:

                            "base",


                        numeric:

                            true

                    }

                );


            }

        );


    }






    rankRows(

        rows,

        selectionType

    ){


        switch(selectionType){


            case "top_opportunities":


                return this.sortByOpportunities(

                    rows

                );


            case "top_bought":


                return this.sortByBought(

                    rows

                );


            case "alphabetical":


            default:


                return this.sortAlphabetically(

                    rows

                );


        }


    }






    applyTopCount(

        rows,

        selectionType,

        topCount

    ){


        if(

            selectionType ===

            "alphabetical"

        ){


            return rows;


        }


        return rows.slice(

            0,

            topCount

        );


    }






    cloneResults(rows){


        return rows.map(row => ({

            value:

                row.value,


            opportunityCount:

                row.opportunityCount,


            boughtCount:

                row.boughtCount

        }));


    }






    async getOptions(request){


        this.validate(

            request

        );


        const resolvedRequest = {

            attribute:

                this.normaliseAttribute(

                    request.attribute

                ),


            selectionType:

                this.normaliseSelectionType(

                    request.selectionType

                ),


            topCount:

                this.normaliseTopCount(

                    request.topCount

                )

        };


        const resultCacheKey =

            this.buildResultCacheKey(

                resolvedRequest

            );


        if(

            this.resultCache.has(

                resultCacheKey

            )

        ){


            console.log(

                "[PHX ATTRIBUTE RESULT CACHE HIT]",

                resolvedRequest

            );


            return this.cloneResults(

                this.resultCache.get(

                    resultCacheKey

                )

            );


        }


        const rawRows =

            await this.loadRawRows(

                resolvedRequest.attribute

            );


        const aggregatedRows =

            this.aggregateRows(

                rawRows

            );


        const rankedRows =

            this.rankRows(

                aggregatedRows,

                resolvedRequest.selectionType

            );


        const resultRows =

            this.applyTopCount(

                rankedRows,

                resolvedRequest.selectionType,

                resolvedRequest.topCount

            );


        this.resultCache.set(

            resultCacheKey,

            resultRows

        );


        console.log(

            "[PHX ATTRIBUTE OPTIONS READY]",

            {

                attribute:

                    resolvedRequest.attribute,


                selectionType:

                    resolvedRequest.selectionType,


                topCount:

                    resolvedRequest.selectionType ===

                        "alphabetical"

                        ? null

                        : resolvedRequest.topCount,


                rawRows:

                    rawRows.length,


                distinctValues:

                    aggregatedRows.length,


                returnedValues:

                    resultRows.length

            }

        );


        return this.cloneResults(

            resultRows

        );


    }






    clearCache(attribute = null){


        const resolvedAttribute =

            this.normaliseText(

                attribute

            );


        if(!resolvedAttribute){


            this.rawRowsCache.clear();


            this.resultCache.clear();


            this.pendingLoads.clear();


            return;


        }


        this.rawRowsCache.delete(

            resolvedAttribute

        );


        this.pendingLoads.delete(

            resolvedAttribute

        );


        for(

            const key of this.resultCache.keys()

        ){


            try{


                const parsed =

                    JSON.parse(

                        key

                    );


                if(

                    parsed.attribute ===

                    resolvedAttribute

                ){


                    this.resultCache.delete(

                        key

                    );


                }


            }

            catch(error){


                console.warn(

                    "[PHX ATTRIBUTE CACHE KEY ERROR]",

                    error

                );


            }


        }


    }


}