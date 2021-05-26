import logo from './logo.svg';
import './App.css';
import PanelContainer from './components/PanelContainer';
import BasicPanel from './components/BasicPanel';
import ButtonPanel from './components/ButtonPanel';

import useESP from './api/useESP'
import RadioPanel from './components/SliderButton';

function App() {
  let theme = useESP('values/v2', '', (esp, data) => data ? '' : ' dark-theme', []);

  return (
    <div className={"App" + theme}>
      <header className="App-header">
        dragon-home Interface
      </header>

      <div className="ConfigContent">
        <PanelContainer title="Test Area 1">
          <BasicPanel></BasicPanel>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '50px'}}>
            <ButtonPanel name="v1"/>
            <ButtonPanel name="v2"/>
            <ButtonPanel name="v1"/>
          </div>
          <RadioPanel options={{'ON': true, 'AUTO': 3, 'OFF': false}} name='v1'/>
          <BasicPanel></BasicPanel>
          <BasicPanel></BasicPanel>
        </PanelContainer>

        <PanelContainer title="Test Area 2" />
      </div>
    </div>
  );
}

export default App;
