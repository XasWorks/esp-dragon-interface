

import BasicPanel from "./BasicPanel";

function WiFiPanel(props) {
	return <BasicPanel onClick={() => {console.log("Would open WiFi overlay now");}} {...props}>

	</BasicPanel>
}

export default WiFiPanel;