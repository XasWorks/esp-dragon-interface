

import {useContext} from 'react'

import BasicPanel, {stateToColor} from './BasicPanel';
import './RadioPanel.css'

import useESP, { ESPContext } from '../../api/useESP'


function RadioPanel(props) {
    const options = props.config.options;

    const cState = useESP('values/' + props.name, false, (esp, data) => (esp.values[props.name] || {}), [props.name]);
    const esp = useContext(ESPContext);

    const selectedIndex = Object.values(options).findIndex(v => v === cState['value']);

    let width = '100%'
    let left = 0;

    if(selectedIndex >= 0) {
        width = 100.0 / Object.keys(options).length;
        left  = width * selectedIndex;

        width = width.toString() + '%';
        left  = left.toString() + '%';
    }

    let indicatorColor = stateToColor(cState, props, 'ok');

    if(selectedIndex >= 0)
        indicatorColor = indicatorColor || 'var(--ind-ok)';

    indicatorColor = indicatorColor || 'var(--ind-standby)';

    const classNames = "RadioPanel " + props.className || '';

    return <BasicPanel {...props} value={cState} state='none' className={classNames}>
        {
            Object.keys(options).map((key, index) => {
                let clickFn = () => { esp.setValue(props.name, options[key]) };
                if(props.config['readonly'])
                    clickFn = undefined;

                return <BasicPanel key={key} onClick={clickFn} style={{border: 'none'}}>
                    {key}
                </BasicPanel>
            })
        }

        <div className='RadioPanelIndicator' style={{width: width, left: left, backgroundColor: indicatorColor}}/>
    </BasicPanel>
}

export default RadioPanel;