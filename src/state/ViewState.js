export class ViewState {


    constructor(){


        this.rows = [];


        this.listeners = [];


    }







    setRows(rows){


        this.rows = rows || [];


        this.notify();


    }







    getRows(){


        return this.rows;


    }







    subscribe(callback){


        this.listeners.push(

            callback

        );


        return () => {


            this.listeners =

                this.listeners.filter(

                    l => l !== callback

                );


        };


    }







    notify(){


        this.listeners.forEach(

            callback =>

                callback(this.rows)

        );


    }



}