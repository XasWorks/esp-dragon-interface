
import { useContext, Fragment } from "react";

import FormOverlay from "./Overlays/FormOverlay";
import DeviceInfoOverlay from "./Overlays/DeviceInfoOverlay";

import {CSSTransition, SwitchTransition} from "react-transition-group"
import LoginOverlay from "./Overlays/LoginOverlay";

import useESP, {ESPContext} from '../api/useESP'

import './OverlaySelector.css'

function useOverlay() {
	const loginState = useESP('connection', {connected: false, authenticated: true}, (esp, data) => {
		return {connected: esp.connected, authenticated: esp.authenticated}
	});

	let overlay_list = Object.assign({}, useESP('overlays', {}, (esp, data) => esp.overlays));

	console.log("Login state is" + JSON.stringify(loginState));

	if((loginState.connected) && (!loginState.authenticated))
		overlay_list['login'] = {
			priority: 100,
			type: 'login'
		};

	let overlay_key = Object.keys(overlay_list).sort((ka, kb) => ((overlay_list[kb].priority | 0) - (overlay_list[ka].priority | 0)))[0];
	return [overlay_key, overlay_list[overlay_key]];
}

function OverlaySelector(props) {
	const esp = useContext(ESPContext);

	const [overlay_key, c_u] = useOverlay();

	console.log("Overlay is " + overlay_key);

	let OverlayType = undefined;
	if(c_u === undefined)
		OverlayType = undefined;
	else if(c_u.type === 'form')
		OverlayType = FormOverlay;
	else if(c_u.type === 'login')
		OverlayType = LoginOverlay;
	else if(c_u.type === 'deviceInfo')
		OverlayType = DeviceInfoOverlay;

	const current_overlay = <CSSTransition 
		key={overlay_key}
		classNames='overlay-slide'
		timeout={400}>
			{OverlayType === undefined ? <Fragment /> : <OverlayType {...c_u} closeFn={() => {
				console.log("Closing!")
				esp.closeOverlay(overlay_key)}
			}/>}
		</CSSTransition>
	

	// {current_overlay !== undefined} 
	return <div className="OverlaySelectorRoot">		
		<CSSTransition 
			in={OverlayType !== undefined}
			appear={true}
			timeout={500}
			classNames="overlay-shadow">

			<div className="OverlayShadow"> 
				<SwitchTransition>
					{current_overlay}
				</SwitchTransition>
			</div>
		</CSSTransition>
	</div>
}

export default OverlaySelector;