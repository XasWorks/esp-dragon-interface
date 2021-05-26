

class EspWSInterface {
    constructor(address) {
        // Full URI of the Websocket connection to listen to
        this.addr = address;
    
        this.socket = new WebSocket("ws://localhost:4567/ws");
        this.socket.onopen = () => {
            this.socket.send(JSON.stringify({action: "get-settings"}));
        }

        this.socket.onmessage = (msg) => {
            console.log("Message is " + msg.data);

            msg = JSON.parse(msg.data);

            if(msg['update'] !== undefined) {
                const u = msg['update'];

                for(const key in u) {
                    
                    this.values[key] = u[key];
                    this.runEvent('values/' + key, u[key]);
                }
            }
        }

        // Hooks, sorted by type of event they're listening to.
        // Events are sorted, similarly to MQTT Topics
        // * is "all events", with other sub-events being addressable like values/category1/* etc.
        this.hooks = {};

        this.values = {
            b1: false
        };
    }

    toggleButton = (name) => {
        console.log("Changing " + name);
        
        this.socket.send(JSON.stringify({toggle: name}));

        // this.values[name] = !this.values[name];
        // this.runEvent('values/' + name, this.values[name]);
    }
    setValue = (name, data) => {
        console.log("Setting " + name + " to " + data);

        let outData = {set: {}}
        outData['set'][name] = data;

        this.socket.send(JSON.stringify(outData));
    }

    runEvent = (evtTag, data) => {
        while(true) {
            if(this.hooks[evtTag] !== undefined)
                this.hooks[evtTag].forEach((v, _i, _arr) => {
                    v(data);
                });
            
            if(evtTag === '*' || (evtTag.length < 1))
                break;

            evtTag = evtTag.replace(/[^\/]+(\/\*)?$/, "*");
        }
    }

    registerCB = (tag, callback) => {
        if(this.hooks[tag] === undefined)
            this.hooks[tag] = [];

        this.hooks[tag].push(callback)

        return {
            tag: tag,
            cb: callback
        };
    }

    unregisterCB = (cb_data) => {
        this.hooks[cb_data['tag']] = this.hooks[cb_data['tag']].filter((cVal, index, array) => cVal !== cb_data['cb']);
    }
}

export default EspWSInterface;