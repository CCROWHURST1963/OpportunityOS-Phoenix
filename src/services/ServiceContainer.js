export class ServiceContainer {

    constructor() {

        this.services = new Map();

    }


    register(name, service) {

        this.services.set(
            name,
            service
        );

    }


    resolve(name) {

        return this.services.get(name);

    }

}