

import {useContext} from 'react'

import BasicPanel from './BasicPanel';
import './RadioPanel.css'

import useESP, { ESPContext } from '../api/useESP'


function RadioPanel(props) {
    const cState = useESP('values/' + props.name, false, (esp, data) => esp.values[props.name], [props.name]);
    const esp = useContext(ESPContext);

    
    const selectedIndex = Object.values(props.options).findIndex(v => v === cState);

    let width = '100%'
    let left = 0;

    if(selectedIndex >= 0) {
        width = 100.0 / Object.keys(props.options).length;
        left  = width * selectedIndex;

        width = width.toString() + '%';
        left  = left.toString() + '%';
    }

    console.log("Widths are " + width + left);

    let indicatorColor = 'var(--ind-standby)';
    if(props.state) {
        indicatorColor = 'var(--ind-' + props.state + ')';
    }
    else if(selectedIndex >= 0)
        indicatorColor = 'var(--ind-ok)';

    return <div className='RadioPanel'>
        {
            Object.keys(props.options).map((key) =>
                <BasicPanel key={key} state='no_ind' onClick={() => { esp.setValue(props.name, props.options[key]) }}>
                    {key}
                </BasicPanel>)
        }

        <div className='RadioPanelIndicator' style={{width: width, left: left, backgroundColor: indicatorColor}}/>
    </div>
}

export default RadioPanel;