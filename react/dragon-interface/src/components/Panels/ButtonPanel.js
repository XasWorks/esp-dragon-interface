
import {useContext} from 'react';
import BasicPanel from "./BasicPanel";

import useESP, { ESPContext } from '../../api/useESP'

function ButtonPanel(props) {
    const cState = useESP('values/' + props.name, false, (esp) => (esp.values[props.name] || {}), [props.name]);
    const esp = useContext(ESPContext);

    return <BasicPanel {...props} value={cState} state={cState['value'] ? 'ok' : 'standby'} onClick={() => { esp.toggleButton(props.name); }}>
        {props.config.text || props.name}
    </BasicPanel>
}

export default ButtonPanel;