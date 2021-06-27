

import { Fragment } from 'react';
import BaseOverlay from './BaseOverlay'

import './FormOverlay.css'

function FormOverlay(props) {

	const onSubmitFunc = (event) => {
		event.preventDefault();

		let outData = [];
		for(let i=0; i<event.target.length; i++) {
			outData.push(event.target[i].value);
		}

		props.onSubmit(outData);
	}

	let index = 0;
	return <BaseOverlay {...props}>
		<form onSubmit={onSubmitFunc}>
			<div className="FormOverlayGrid">
				{props.formItems.map(i => {
					if(i.type === 'dropdown') {
						return <Fragment key={index++}>
							<label>{i.label}</label>
							<select>
								{i.options.map(o => <option value={o}>{o}</option>)}
							</select>
						</Fragment>
					}
					
					return <Fragment key={index++}>
						<label>{i.label}</label>
						<input {...i}/>
					</Fragment>
				})}
			</div>

			<input className="FormOverlaySubmit" type="submit" value="Submit"/>
		</form>
	</BaseOverlay>
}

export default FormOverlay;