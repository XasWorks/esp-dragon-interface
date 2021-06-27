
import './PanelContainer.css'

import {MdExpandLess, MdExpandMore} from 'react-icons/md'

import {useState} from 'react'

function PanelContainer(props) {
    const cfg = props.config || {};

    const [minimized, setMinimized] = useState(cfg.minimized);

    const title = cfg.title || props.title;

    let has_title = true;
    if(props.title === undefined)
        has_title = false;
    else if(props.title === '')
        has_title = false;
    else if(props.title.charAt(0) === '!')
        has_title = false;

    const clickFn = () => setMinimized(!minimized);

    const container_title = has_title ? <div className="ContainerTitle" onClick={clickFn}>
        {title}
    </div> : '';
    
    return <div className="PanelContainerRoot">
        {container_title}

        <div className="PanelContainerMinimizer" onClick={clickFn}>
            {minimized ? <MdExpandMore /> : <MdExpandLess />}
        </div>

        {minimized ? '' : 
        <div className="PanelContainerBox">
            {props.children}
        </div>}
    </div>
}

export default PanelContainer;