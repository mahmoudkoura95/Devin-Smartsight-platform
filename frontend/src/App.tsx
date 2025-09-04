import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SmartSight MMM Platform</h1>
        <p>Marketing Mix Modeling for Everyone</p>
        <div className="mode-selector">
          <button className="mode-btn autopilot">Autopilot Mode</button>
          <button className="mode-btn copilot">Co-Pilot Mode</button>
        </div>
      </header>
    </div>
  );
}

export default App;
