
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        ((((c ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >> c) / 4).toString(16)
    );
}

class GenericInterface {
    constructor() {
        // Hooks, sorted by type of event they're listening to.
        // Events are sorted, similarly to MQTT Topics
        // * is "all events", with other sub-events being addressable like values/category1/* etc.
        this.hooks  = {}

        this.values = {}

        this.config = {}

        this.connected = false;

        this.overlays = {}
        this.currentNotification = {title: 'none'};
    }

    updateValue = (key, data) => {
        if(key === '_config') {
            this.config = data;
            this.runEvent('config', this.config);
        }
        else {
            this.values[key] = data;
            this.runEvent('values/' + key, data);
        }
    }

    subscribe = (tag, callback) => {
        if(this.hooks[tag] === undefined)
            this.hooks[tag] = [];

        this.hooks[tag].push(callback)

        return {
            tag: tag,
            cb: callback
        };
    }

    unsubscribe = (cb_data) => {
        this.hooks[cb_data['tag']] = this.hooks[cb_data['tag']].filter((cVal, index, array) => cVal !== cb_data['cb']);
    }

    runEvent = (evtTag, data) => {
        while(true) {
            if(this.hooks[evtTag] !== undefined)
                this.hooks[evtTag].forEach((v, _i, _arr) => {
                    v(data);
                });
            
            if(evtTag === '*' || (evtTag.length < 1))
                break;

            evtTag = evtTag.replace(/[^/]+(\/\*)?$/, "*");
        }
    }

    updateOverlay = (ovKey, ovData) => {
        if(this.overlays[ovKey] === undefined)
            return;
        
        this.openOverlay(ovKey, ovData);
    }
    openOverlay = (ovKey, ovData) => {
        this.overlays = Object.assign({}, this.overlays);
        this.overlays[ovKey] = ovData;

        this.runEvent('overlays')
    }

    closeOverlay = (ovKey) => {
        if(this.overlays[ovKey] === undefined)
            return;
        
        this.overlays = Object.assign({}, this.overlays);
        delete this.overlays[ovKey];

        this.runEvent('overlays');
    }
}

class EspWSInterface extends GenericInterface {
    constructor(address) {
        super();

        // Full URI of the Websocket connection to listen to
        this.addr = address;
    
        this.setQueue = {}

        this.sessionID = localStorage.getItem('cookie-session-key');
        if(this.sessionID === null || this.sessionID.length <= 0) {
            this.sessionID = uuidv4();
            localStorage.setItem('cookie-session-key', this.sessionID);
        }

        this.loginCreds = JSON.parse(localStorage.getItem('cookie-login-credentials'));

        this.authenticated = false;

        this.connectSocket();
    }

    connectSocket = () => {
        if(this.socket !== undefined) {
            let s = this.socket;
            this.socket = undefined;

            s.close();
        }

        this.connected = false;
        this.authenticated = false;
        this.usedLoginCredentials = false;

        this.socket = new WebSocket("wss://xaseiresh.hopto.org/dragonHome/ws?sessionID=" + this.sessionID);
        
        this.socket.onclose = () => {
            this.socket = undefined
            this.connected = false

            this.runEvent('connection', {connected: false, authenticated: this.authenticated})

            this.runEvent('notification', {state: 'err', title: 'Disconnected!'});

            setTimeout(() => {
                this.connectSocket()
            }, 100);
        }

        this.socket.onmessage = (msg) => {
            this.connected = true;
            
            console.log(msg.data);

            msg = JSON.parse(msg.data);

            if(msg['authenticated'] === true) {
                if(this.didLoginAttempt)
                    this.runEvent('notification', {state: 'ok', title: 'Logged in!'});
                this.didLoginAttempt = false;

                this.socket.send(JSON.stringify({get: '_config'}));
                this.authenticated = true;
                this.usedLoginCredentials = false;

                this.runEvent('connection', {connected: true, authenticated: true});

                for(const key in this.setQueue)
                    this.setValue(key, this.setQueue[key]);

                this.setQueue = {};
            }
            else if(msg['authenticated'] === false) {
                if(this.didLoginAttempt)
                    this.runEvent('notification', {state: 'err', title: 'Login failed', message: 'Please provide a correct username and password!'});


                if(this.usedLoginCredentials) {
                    this.loginCreds = null;
                    localStorage.removeItem('cookie-login-credentials');
                }
                
                if(this.loginCreds !== null) {
                    this.usedLoginCredentials = true;
                    this.socket.send(JSON.stringify({authenticate: this.loginCreds}));
                }

                if(this.loginCreds === null) {
                    this.authenticated = false;
                    this.runEvent('connection', {connected: true, authenticated: false});
                }
            }

            if(msg['store_credentials'] !== undefined) {
                this.loginCreds = msg['store_credentials'];
                localStorage.setItem('cookie-login-credentials', JSON.stringify(msg['store_credentials']));
            }

            if(msg['update'] !== undefined) {
                const u = msg['update'];

                for(const key in u) {
                    if(key !== '_config')
                        this.updateValue(key, u[key]);
                }

                if(u['_config'] !== undefined)
                    this.updateValue('_config', u['_config'])
            }
        }
    }

    tryLogin = (user, password) => {
        this.didLoginAttempt = true;

        this.socket.send(JSON.stringify({authenticate: {user: user, password: password}}));
    }

    logout = () => {
        this.loginCreds = undefined;
        localStorage.removeItem('cookie-login-credentials');

        this.socket.send(JSON.stringify({logout: true}))

        this.socket.close();
    }

    setValue = (name, data) => {
        if(Object.prototype.toString.call(data) !== '[object Object]')
            data = {value: data};

        if(!this.connected || !this.authenticated) {
            this.setQueue[name] = data;

            return;
        }

        let outData = {set: {}}
        outData['set'][name] = data;

        this.socket.send(JSON.stringify(outData));
    }
}

export default EspWSInterface;