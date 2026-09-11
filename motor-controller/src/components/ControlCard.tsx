import React from 'react';
import type { ControllerConfig } from '../types';

interface Props {
  config: ControllerConfig;
  ip: string;
  onLog: (text: string, success?: boolean) => void;
}

const ControlCard: React.FC<Props> = ({ config, ip, onLog }) => {
  const [speed, setSpeed] = React.useState<number>(128);

  const sendCommand = async (cmd: string) => {
    if (!ip.trim()) {
      onLog('No IP set', false);
      return;
    }
    const url = `http://${ip.trim()}/data?cmd=${cmd}`;
    onLog(`Sending ${cmd} to ${ip.trim()} ...`);
    try {
      const res = await fetch(url);
      if (res.ok) onLog(`✓ Sent ${cmd}`);
      else onLog(`✗ Error ${res.status}`, false);
    } catch {
      onLog(`✗ Failed to reach ${ip.trim()}`, false);
    }
  };

  return (
    <div className="card">
      <h2>{config.label}</h2>
      <label>Speed: <span className="speed-val">{speed}</span></label>
      <input
        type="range"
        min={0}
        max={255}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
      <div className="btn-row">
        <button onClick={() => sendCommand(`${config.forwardCmd}${speed}`)}>Forward</button>
        <button onClick={() => sendCommand(`${config.reverseCmd}${speed}`)}>Reverse</button>
        <button className="stop-btn" onClick={() => sendCommand(config.stopCmd)}>Stop</button>
      </div>
    </div>
  );
};

export default ControlCard;
