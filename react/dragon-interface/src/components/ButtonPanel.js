
import {useContext, useState} from 'react';
import BasicPanel from "./BasicPanel";

import useESP, { ESPContext } from '../api/useESP'

function ButtonPanel(props) {
    const cState = useESP('values/' + props.name, false, (esp, data) => esp.values[props.name], [props.name]);

    const esp = useContext(ESPContext);

    return <BasicPanel state={cState ? 'err' : 'ok'} onClick={() => { esp.toggleButton(props.name); }}>
        {"Press Me <3"}
    </BasicPanel>
}

export default ButtonPanel;