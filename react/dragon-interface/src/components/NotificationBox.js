
import { useEffect, useState } from 'react';
import {CSSTransition} from 'react-transition-group';

import {stateToColor} from './Panels/BasicPanel'

import useESP from '../api/useESP';

import './NotificationBox.css'

function NotificationBox(props) {
	let active = false;

	const [eventShown, setEventShown] = useState(false);

	const currentEvent = useESP('notification', {}, (esp, data) => {
		setEventShown(true);
		return data;
	});

	useEffect(() => {
		const closing_to = setTimeout(() => {
			setEventShown(false);
		}, 3000);

		return () => clearTimeout(closing_to);
	}, [currentEvent, setEventShown]);

	const bg_color = stateToColor({'_state': currentEvent.state || 'var(--secondary-bg-color)'});

	return <CSSTransition in={eventShown} timeout={200} classNames="notification-slide">
		<div style={{backgroundColor: bg_color}} className="NotificationBoxRoot">
			<h2>
				{currentEvent.title}
			</h2>

			{currentEvent.message}
		</div>
	</CSSTransition>
}

export default NotificationBox;