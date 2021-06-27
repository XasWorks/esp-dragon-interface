
import {TransitionGroup, CSSTransition} from 'react-transition-group'

import useESP, {ESPContext} from '../api/useESP'


import {MdError, MdSettings, 
	MdVolumeUp,
	MdExitToApp, MdInfo} from 'react-icons/md'

import {FaSignOutAlt} from 'react-icons/fa'

import './TopBar.css'
import { useContext } from 'react';

function TopBarIcons(props) {
	let activeIcons = [];
	
	const loginState = useESP('connection', false, (esp, data) => esp.connected && esp.authenticated);
	const esp = useContext(ESPContext);

	if(!loginState) {
		activeIcons.unshift(['disconnected', <div title="Disconnected!">
			<MdError/>
		</div>
		])
	}

	activeIcons = activeIcons.map((i) => 
		<CSSTransition timeout={300}
			appear={true}
			classNames="top-bar-t"
			key={i[0]}>
			<li>
				{i[1]}
			</li>
		</CSSTransition>
	);

	return <ul className="TopBarIconList">
		<li className="TopBarSettingsIcon">
			<MdSettings />

			<ul className="TopBarSettingsList">
				<li onClick={() => esp.logout()}>
					<FaSignOutAlt />Logout
				</li>
				<li onClick={() => esp.openOverlay('deviceInfo', {type: 'deviceInfo'})}>
					<MdInfo /> Device Info
				</li>
			</ul>
		</li>
	
		<TransitionGroup component={null}>
			{activeIcons}
		</TransitionGroup>

	</ul>
}

function TopBar(props) {
	return <header className="TopBarRoot">
		<div className="TopBarTitle">
			Dragon's Home Interface
		</div>

		<TopBarIcons />
	</header>
}

export default TopBar;