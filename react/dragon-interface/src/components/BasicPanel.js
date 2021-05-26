

import React from 'react'

import './BasicPanel.css'

function BasicPanel(props) {
    let indicatorColor = 'var(--ind-standby)';
    if(props.state) {
        indicatorColor = 'var(--ind-' + props.state + ')';
    }

    let classNames = 'BasicPanel'

    if(props.onClick) {
        classNames += ' BasicPanelClickable'
    }

    return <div className={classNames} onClick={props.onClick}>
        <div className="BasicPanelContent">
            {props.children}
        </div>
        {props.state !== 'no_ind' ? 
            <div className="BasicPanelIndicator" style={{backgroundColor: indicatorColor}}/>
            : ''}
    </div>
}

export default BasicPanel;