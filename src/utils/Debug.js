export const DEBUG = false;

export function debug(...args){

    if(DEBUG){

        console.log(...args);

    }

}

export function debugWarn(...args){

    if(DEBUG){

        console.warn(...args);

    }

}