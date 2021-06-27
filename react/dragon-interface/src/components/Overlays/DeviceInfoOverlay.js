
import BaseOverlay from "./BaseOverlay";
import {useDragonValue} from "../../api/useESP"

import './DeviceInfoOverlay.css'

function DeviceInfoOverlay(props) {
	const device_info = useDragonValue('_device', {});
	const ping_info   = useDragonValue('_ping', {});

	let mixed_info = Object.assign({}, ping_info, device_info);

	return <BaseOverlay {...props} childContainerClass='DeviceInfoOverlayRoot' canClose={true} title="Device Info">
		<table>
			<thead>
				<tr>
					<td>Key</td>
					<td>Value</td>
				</tr>
			</thead>
			<tbody>
			{Object.keys(mixed_info).map((key) => <tr key={key}>
				<td>
					{key}
				</td>
				<td>
					{mixed_info[key]}
				</td>
			</tr>)}
			</tbody>
		</table>
	</BaseOverlay>
}

export default DeviceInfoOverlay;