

import React from 'react'

import './BasicPanel.css'

export function stateToColor(value, props = {}, def = undefined) {
    if(props.state === 'none')
        return undefined;

    if(value['_state'] !== undefined) {
        const valid_states = ['ok', 'standby', 'warn', 'err'];

        if(valid_states.includes(value['_state']))
            return "var(--ind-" + value['_state'] + ')';
        
        let s = new Option().style;
        s.color = value['_state'];

        return s.color;
    }


    return "var(--ind-" + (props.state || def) + ')';
}

function BasicPanel(props) {
    const value = props.value || {value: ''};

    let style = {
        borderRadius: props.corners
    }

    let indicatorColor = stateToColor(value, props)

    let classNames = (props.className || '') + ' BasicPanel'

    let onClick = props.onClick;
    if(props.disabled || value._disabled) {
        if(onClick !== undefined)
            style['cursor'] = 'not-allowed';

        onClick = undefined;
        classNames += ' BasicPanelDisabled'
    }
    
    if(onClick)
        classNames += ' BasicPanelClickable'

    Object.assign(style, props.style);

    return <div className={classNames} onClick={onClick} style={style}>
        {props.children}
        
        {indicatorColor !== undefined ? 
            <div className="BasicPanelIndicator" style={{backgroundColor: indicatorColor}}/>
            : ''}
    </div>
}

export default BasicPanel;
