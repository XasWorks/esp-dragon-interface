

import { useContext} from 'react'
import {ESPContext} from '../../api/useESP'

import FormOverlay from './FormOverlay.js'

import './LoginOverlay.css'

function LoginOverlay(props) {
	const esp = useContext(ESPContext);

	const onSubmitFunc = (data) => {
		esp.tryLogin(data[0], data[1]);
	}

	return <FormOverlay title="Please log in!"
	formItems={[
		{label: 'Username', type: 'text'},
		{label: 'Password', type: 'password'}
	]}
	
	onSubmit={onSubmitFunc}/>
}

export default LoginOverlay;