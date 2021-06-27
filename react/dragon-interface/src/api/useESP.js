
import React, {useState, useEffect, useContext} from 'react'

import EspWSInterface from './esp_ws_interface'

export const ESPContext = React.createContext(new EspWSInterface());

const useESP = (tag, defa, reducer = undefined, extra_deps = []) => {
    let esp = useContext(ESPContext);

    let [currentValue, setCurrentValue] = useState(() => (reducer === undefined ? defa : reducer(esp, defa)));

    useEffect(() => {
        const cb_data = esp.subscribe(tag, (data) => {
            if(reducer === undefined)
                setCurrentValue(data);
            else
                setCurrentValue(reducer(esp, data));
        });

        return () => { esp.unsubscribe(cb_data) }
    }, [esp, tag, ...extra_deps]);

    return currentValue;
}

export const useDragonValue = (tag, def = {}) => {
    let connection = useContext(ESPContext);

    let [currentValue, setCurrentValue] = useState(connection.values[tag] || def);

    useEffect(() => {
        const cb_data = connection.subscribe('values/' + tag, (data) => {

            if(Object.prototype.toString.call(data) === '[object Object]')
                setCurrentValue(data);  
        });

        return () => { connection.unsubscribe(cb_data) }
    }, [connection, tag]);

    return currentValue;
}

export default useESP;