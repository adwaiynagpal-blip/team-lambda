import React from 'react';
import ControlCard from './components/ControlCard';
import CommandLog from './components/CommandLog';
import type { LogEntry, ControllerConfig } from './types';
import './App.css';

const CONTROLLERS: ControllerConfig[] = [
  { label: 'Drive Motor',      forwardCmd: 'fm', reverseCmd: 'rm', stopCmd: 'b' },
  { label: 'Brush',            forwardCmd: 'fb', reverseCmd: 'rb', stopCmd: 's' },
  { label: 'Linear Actuator',  forwardCmd: 'fl', reverseCmd: 'rl', stopCmd: 'p' },
];

let logIdCounter = 0;

const App: React.FC = () => {
  const [ip, setIp] = React.useState<string>('');
  const [logs, setLogs] = React.useState<LogEntry[]>([]);

  const addLog = (text: string, success = true) => {
    setLogs((prev) => [
      ...prev,
      {
        id: ++logIdCounter,
        time: new Date().toLocaleTimeString(),
        text,
        success,
      },
    ]);
  };

  return (
    <>
      <h1>Motor &amp; Brush Control</h1>

      <div className="card">
        <label>Device IP Address</label>
        <input
          id="ip-input"
          type="text"
          placeholder="e.g. 192.168.4.1"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="ip-input"
        />
      </div>

      {CONTROLLERS.map((cfg) => (
        <ControlCard key={cfg.label} config={cfg} ip={ip} onLog={addLog} />
      ))}

      <CommandLog entries={logs} />
    </>
  );
};

export default App;
