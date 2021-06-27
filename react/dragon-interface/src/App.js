
import './App.css';
import PanelContainer from './components/PanelContainer';

import useESP from './api/useESP'
import PanelSelector from './components/PanelSelector';

import OverlaySelector from './components/OverlaySelector';

import TopBar from './components/TopBar';
import NotificationBox from './components/NotificationBox';

function App() {
  let theme = useESP('values/v2', '', (esp, data) => data ? ' dark-theme' : ' dark-theme', []);

  const config = useESP('config', {}, (esp, data) => esp.config, []);

  console.log("Our config is: " + JSON.stringify(config));

  return (
    <div className={"App" + theme}>
      <NotificationBox />

      <TopBar />
      
      <OverlaySelector />

      <div className="ConfigContent">
        {Object.keys(config.sections || {}).map((category) =>
          <PanelContainer key={category} title={category} config={config.sections[category]}>
            {Object.keys(config.sections[category].fields).map((key) =>
              <PanelSelector config={config.sections[category].fields[key]} name={key} key={key} className="InfoPanel"/>
            )}
          </PanelContainer>
        )}
      </div>
      
    </div>
  );
}

export default App;
