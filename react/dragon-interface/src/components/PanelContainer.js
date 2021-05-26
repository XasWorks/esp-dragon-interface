
import './PanelContainer.css'

function PanelContainer(props) {
    return <div className="PanelContainerRoot">
        <div className="ContainerTitle">
            {props.title}
        </div>

        <div className="PanelContainerBox">
            {props.children}
        </div>
    </div>
}

export default PanelContainer;