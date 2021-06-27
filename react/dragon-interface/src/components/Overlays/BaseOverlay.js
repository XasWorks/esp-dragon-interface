
import { MdClose } from 'react-icons/md';
import { Fragment } from 'react'

import './BaseOverlay.css'

function BaseOverlay(props) {

	const closeButton = props.canClose && (props.closeFn !== undefined) ? <div className="OverlayClose" onClick={props.closeFn}> <MdClose /> </div>
	: <Fragment />

	return <div className={"OverlayPanelRoot " + (props.className || '')}>
		<h2>{props.title}</h2>

		{closeButton}
		
		<div className={"OverlayPanelChildren " + (props.childContainerClass || '')}> 
			{props.children}
		</div>
	</div>
}

export default BaseOverlay;