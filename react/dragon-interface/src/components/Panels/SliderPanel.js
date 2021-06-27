
import {useState, useContext, useEffect} from 'react'
import useESP, {ESPContext} from '../../api/useESP'

import BasicPanel, {stateToColor} from './BasicPanel'

import './SliderPanel.css'

function SliderPanel(props) {
    const cfg = props.config;

    const esp = useContext(ESPContext);
    const espSliderValue = useESP('values/' + props.name, esp.values[props.name]) || {};

    const [sliderValue, setSliderValue] = useState(undefined);

    useEffect(() => {
        if(sliderValue === undefined)
            return;

        const to = setTimeout(() => {
            esp.setValue(props.name, sliderValue);

            setSliderValue(undefined);
        }, 200);

        return () => { clearTimeout(to) }
    }, [sliderValue, esp, props.name]);

    let inputSlider = <input className="SliderPanelSlider" type="range" min={cfg.min || 0} max={cfg.max || 1} onChange={(v) => { 
        setSliderValue(v.target.value)
    }}/>

    if(cfg.ro)
        inputSlider = '';

    const sliderColor = stateToColor(espSliderValue, props, 'ok');

    let copyProps = Object.assign({}, props);
    copyProps.className += ' SliderPanelRoot';

    return <BasicPanel {...copyProps} value={espSliderValue} state='ok'>
        
        <div className="SliderPanelTitle">
            {cfg.text || props.name}
        </div>

        <div className="SliderPanelValue">
            {(sliderValue || espSliderValue.value) + (cfg.unit || '')}
        </div>

        <div className="SliderPanelBar" style={{
            width: (100*(Math.min(1, Math.max(0, (sliderValue || espSliderValue['value']) - cfg.min) / (cfg.max - cfg.min)))).toString() + '%',
            backgroundColor: sliderColor
        }} />

        {inputSlider}
    </BasicPanel>
}

export default SliderPanel;