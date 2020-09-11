export default class Plugin {
    enabled = false;
    events = {};

    constructor(args) {
        this.name = args['name'];
        this.key = args['key'];
        this.description = args['description'];
        this.bool = !args.hasOwnProperty('bool') ? true : args['bool'];
    }

    on(event, cb) {
        this.events[event] = cb;
    }

    toggle(value) {
        this.enabled = value;

        return this.enabled;
    }

    receive(header, data) {
        if(this.events.hasOwnProperty(header)) {
            this.events[header](data);
        }
    }
}
