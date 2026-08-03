export class AmazonPackInfoRepository {


    constructor(

        supabaseClient,

        appState

    ){


        this.supabaseClient =

            supabaseClient;


        this.appState =

            appState;


        this.tableName =

            "amazonpackinfo";


    }






    ensureConfigured(){


        if(

            !this.supabaseClient

            ||

            typeof this.supabaseClient.isConfigured !==

                "function"

            ||

            !this.supabaseClient.isConfigured()

        ){


            throw new Error(

                "Supabase client is not configured"

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






    normaliseAsin(value){


        return this.normaliseText(

            value

        ).toUpperCase();


    }






    normaliseLocale(value){


        return this.normaliseText(

            value

        ).toLowerCase()

        ||

        "co.uk";


    }






    normalisePositiveInteger(

        value,

        fallback =

            null

    ){


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

                    .trim()

            );


        if(

            !Number.isFinite(

                parsed

            )

        ){


            return fallback;


        }


        const rounded =

            Math.round(

                parsed

            );


        return rounded > 0

            ? rounded

            : fallback;


    }






    getAsin(source = {}){


        return this.normaliseAsin(

            source.asin

            ??

            source.ASIN

            ??

            source.matched_asin

        );


    }






    getLocale(source = {}){


        return this.normaliseLocale(

            source.locale

            ??

            source.Locale

            ??

            source.matched_locale

        );


    }






    buildKey(

        asin,

        locale

    ){


        const resolvedAsin =

            this.normaliseAsin(

                asin

            );


        const resolvedLocale =

            this.normaliseLocale(

                locale

            );


        if(!resolvedAsin){


            throw new Error(

                "ASIN is required for amazonpackinfo persistence"

            );


        }


        return `${resolvedAsin}-${resolvedLocale}`;


    }






    buildIdentity(source = {}){


        return {

            key:

                this.buildKey(

                    this.getAsin(

                        source

                    ),

                    this.getLocale(

                        source

                    )

                )

        };


    }






    buildHeaders(extra = {}){


        return {

            apikey:

                this.supabaseClient.key,


            Authorization:

                `Bearer ${this.supabaseClient.key}`,


            "Content-Type":

                "application/json",


            Accept:

                "application/json",


            ...extra

        };


    }






    buildTableUrl(){


        return (

            String(

                this.supabaseClient.url

                ??

                ""

            ).replace(

                /\/$/,

                ""

            )

            +

            `/rest/v1/${this.tableName}`

        );


    }






    async getPackInfo(

        userId,

        asins,

        locale =

            "co.uk"

    ){


        this.ensureConfigured();


        const resolvedLocale =

            this.normaliseLocale(

                locale

            );


        const keys =

            Array.isArray(

                asins

            )

                ? asins

                    .map(value =>

                        this.normaliseAsin(

                            value

                        )

                    )

                    .filter(Boolean)

                    .map(asin =>

                        this.buildKey(

                            asin,

                            resolvedLocale

                        )

                    )

                : [];


        if(keys.length === 0){


            return [];


        }


        const encodedKeys =

            keys

                .map(value =>

                    `"${

                        value.replaceAll(

                            "\"",

                            "\\\""

                        )

                    }"`

                )

                .join(",");


        const params =

            new URLSearchParams();


        params.set(

            "select",

            "*"

        );


        params.set(

            "key",

            `in.(${encodedKeys})`

        );


        const response =

            await fetch(

                `${this.buildTableUrl()}?${params.toString()}`,

                {

                    method:

                        "GET",


                    headers:

                        this.buildHeaders()

                }

            );


        if(!response.ok){


            const responseText =

                await response.text();


            throw new Error(

                `amazonpackinfo load failed `
                +
                `${response.status}: `
                +
                responseText.slice(

                    0,

                    500

                )

            );


        }


        const rows =

            await response.json();


        return Array.isArray(

            rows

        )

            ? rows

            : [];


    }






    buildPayload(

        source,

        changes = {}

    ){


        const payload = {

            ...this.buildIdentity(

                source

            )

        };


        if(

            Object.prototype.hasOwnProperty.call(

                changes,

                "pack_size"

            )

        ){


            const packSize =

                this.normalisePositiveInteger(

                    changes.pack_size,

                    null

                );


            if(packSize === null){


                throw new Error(

                    "Pack Size must be a positive whole number"

                );


            }


            payload.pack_size =

                packSize;


        }


        if(

            Object.prototype.hasOwnProperty.call(

                changes,

                "buy_qty"

            )

        ){


            const buyQty =

                this.normalisePositiveInteger(

                    changes.buy_qty,

                    null

                );


            if(buyQty === null){


                throw new Error(

                    "Buy Qty must be a positive whole number"

                );


            }


            payload.buy_qty =

                buyQty;


        }


        const hasPackSize =

            Object.prototype.hasOwnProperty.call(

                payload,

                "pack_size"

            );


        const hasBuyQty =

            Object.prototype.hasOwnProperty.call(

                payload,

                "buy_qty"

            );


        if(

            !hasPackSize

            &&

            !hasBuyQty

        ){


            throw new Error(

                "No amazonpackinfo fields were supplied"

            );


        }


        return payload;


    }






    async upsert(

        source,

        changes

    ){


        this.ensureConfigured();


        const payload =

            this.buildPayload(

                source,

                changes

            );


        const url =

            this.buildTableUrl()

            +

            "?on_conflict="

            +

            encodeURIComponent(

                "key"

            );


        const response =

            await fetch(

                url,

                {

                    method:

                        "POST",


                    headers:

                        this.buildHeaders({

                            Prefer:

                                "resolution=merge-duplicates,return=representation"

                        }),


                    body:

                        JSON.stringify(

                            payload

                        )

                }

            );


        if(!response.ok){


            const responseText =

                await response.text();


            throw new Error(

                `amazonpackinfo upsert failed `
                +
                `${response.status}: `
                +
                responseText.slice(

                    0,

                    500

                )

            );


        }


        const result =

            await response.json()

                .catch(() => []);


        const returnedRow =

            Array.isArray(

                result

            )

            &&

            result.length > 0

                ? result[0]

                : null;


        const resolvedPayload =

            returnedRow

                ? {

                    ...payload,

                    ...returnedRow

                }

                : payload;


        return {

            identity:

                this.buildIdentity(

                    source

                ),


            payload:

                resolvedPayload,


            rows:

                Array.isArray(

                    result

                )

                    ? result

                    : []

        };


    }






    async saveFields(

        source,

        changes = {}

    ){


        return this.upsert(

            source,

            changes

        );


    }






    async savePackSize(

        source,

        value

    ){


        const packSize =

            this.normalisePositiveInteger(

                value,

                null

            );


        if(packSize === null){


            throw new Error(

                "Pack Size must be a positive whole number"

            );


        }


        const buyQty =

            this.normalisePositiveInteger(

                source?.amazonpackinfo_buy_qty

                ??

                source?.buy_qty

                ??

                packSize,

                packSize

            );


        return this.upsert(

            source,

            {

                pack_size:

                    packSize,


                buy_qty:

                    buyQty

            }

        );


    }






    async saveBuyQty(

        source,

        value

    ){


        const buyQty =

            this.normalisePositiveInteger(

                value,

                null

            );


        if(buyQty === null){


            throw new Error(

                "Buy Qty must be a positive whole number"

            );


        }


        const packSize =

            this.normalisePositiveInteger(

                source?.amazonpackinfo_pack_size

                ??

                source?.manual_pack_size

                ??

                source?.pack_size

                ??

                1,

                1

            );


        return this.upsert(

            source,

            {

                pack_size:

                    packSize,


                buy_qty:

                    buyQty

            }

        );


    }






    async savePackInfo(

        source,

        {

            packSize,

            buyQty

        } = {}

    ){


        const resolvedPackSize =

            this.normalisePositiveInteger(

                packSize,

                null

            );


        const resolvedBuyQty =

            this.normalisePositiveInteger(

                buyQty,

                null

            );


        if(resolvedPackSize === null){


            throw new Error(

                "Pack Size must be a positive whole number"

            );


        }


        if(resolvedBuyQty === null){


            throw new Error(

                "Buy Qty must be a positive whole number"

            );


        }


        return this.upsert(

            source,

            {

                pack_size:

                    resolvedPackSize,


                buy_qty:

                    resolvedBuyQty

            }

        );


    }


}