

import {useState, useContext, useEffect} from 'react'
import useESP, {ESPContext} from '../../api/useESP';

import BasicPanel from './BasicPanel'

import './ColourPanel.css'

function ColourPanel(props) {
	const cfg = props.config;

	const [selectedColour, setSelectedColour] = useState(undefined);

	const esp = useContext(ESPContext);
	const espColourValue = useESP('values/' + props.name, esp.values[props.name], (esp) => {
		setSelectedColour(undefined);
		return esp.values[props.name];
	}).value;


	useEffect(() => {
		if(selectedColour === undefined)
			return;

		const to = setTimeout(() => {
			esp.setValue(props.name, selectedColour);
		}, 100);

		return () => clearTimeout(to);
	}, [esp, selectedColour, props.name]);

	let colourPickerElements = <form>
		<input type="color" value={selectedColour || espColourValue} onChange={(c) =>
			{console.log("COLOUR CHANGING!"); setSelectedColour(c.target.value)}} />
	</form>;

	return <div className={"ColourPanelRoot " + (props.className || '')}>
		<BasicPanel {...props} className='' value={espColourValue}>
			<div className="ColourPanelTitle"> 
				{cfg.text || props.name}
			</div>

			{cfg.ro ?
			<div className="ColourPanelButton">
				<div className="ColourPanelSwatch" style={{backgroundColor: selectedColour || espColourValue}}/>
			</div> : 
			colourPickerElements }
		</BasicPanel>
	</div>
}

export default ColourPanel;