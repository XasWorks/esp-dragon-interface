
import useESP from '../api/useESP'

import BasicPanel from './Panels/BasicPanel'
import RadioPanel from './Panels/RadioPanel'
import ButtonPanel from './Panels/ButtonPanel';
import SliderPanel from './Panels/SliderPanel';
import ColourPanel from './Panels/ColourPanel';
import WiFiPanel from './Panels/WiFiPanel';

function PanelSelector(props) {
    let Type = undefined;

    let connected = useESP('connection', {}, (esp) => esp.connected);

    if(props.config.options !== undefined) {
        if(Object.keys(props.config.options).length <= 4)
            Type = RadioPanel;
    }

    if(props.config.type === 'colour')
        Type = ColourPanel;

    if(props.config.type === 'bool')
        Type = ButtonPanel;

    if(props.config.type === 'numeric') {
        if(props.config.min !== undefined && props.config.max !== undefined)
            Type = SliderPanel;
    }

    if(Type === undefined)
        return <BasicPanel {...props} state='err' disabled={true}> 
            Unknown type!
        </BasicPanel>

    let copyProps = Object.assign({}, props);

    if(!connected)
        copyProps.disabled = true

    return <Type {...copyProps} />
}

export default PanelSelector;