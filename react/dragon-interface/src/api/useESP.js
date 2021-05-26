
import React, {useState, useEffect, useContext} from 'react'

import EspWSInterface from './esp_ws_interface'

export const ESPContext = React.createContext(new EspWSInterface());

const useESP = (tag, defa, reducer, extra_deps) => {
    let esp = useContext(ESPContext);

    let [currentValue, setCurrentValue] = useState(reducer(esp, defa));

    useEffect(() => {
        const cb_data = esp.registerCB(tag, (data) => {
            if(reducer === undefined)
                setCurrentValue(data);
            else
                setCurrentValue(reducer(esp, data));
        });

        return () => { esp.unregisterCB(cb_data) }
    }, [esp, tag, ...extra_deps]);

    return currentValue;
}


export default useESP;