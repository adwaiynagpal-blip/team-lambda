import React from 'react';
import type { ControllerConfig } from '../types';

interface Props {
  config: ControllerConfig;
  ip: string;
  onLog: (text: string, success?: boolean) => void;
}

/**
 * Builds the request URL.
 *
 * When served over HTTPS (Vercel) the browser blocks plain-HTTP fetches
 * (Mixed Content policy).  We route through the local proxy that the user
 * runs with `node proxy.js` — it listens on http://localhost:8080 and
 * forwards to the device, which is a secure-context exception browsers allow.
 *
 * When the page is served locally over HTTP we can hit the device directly.
 */
function buildUrl(ip: string, cmd: string): string {
  if (window.location.protocol === 'https:') {
    // Route via local proxy (node proxy.js must be running on the user's PC)
    return `http://localhost:8080/proxy?ip=${encodeURIComponent(ip)}&cmd=${encodeURIComponent(cmd)}`;
  }
  // Direct access when running dev server locally
  return `http://${ip}/data?cmd=${encodeURIComponent(cmd)}`;
}

const ControlCard: React.FC<Props> = ({ config, ip, onLog }) => {
  const [speed, setSpeed] = React.useState<number>(128);
  const [busy, setBusy] = React.useState<boolean>(false);

  const sendCommand = async (cmd: string) => {
    if (!ip.trim()) {
      onLog('⚠️  No IP set — enter the device IP above', false);
      return;
    }
    if (busy) return;

    setBusy(true);
    const url = buildUrl(ip.trim(), cmd);
    onLog(`→ Sending "${cmd}" to ${ip.trim()} …`);

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        onLog(`✅ Sent "${cmd}" — device responded ${res.status}`);
      } else {
        onLog(`❌ Error ${res.status} for "${cmd}"`, false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        onLog(
          `❌ Could not reach device. Make sure proxy.js is running (node proxy.js) and the device is on.`,
          false,
        );
      } else {
        onLog(`❌ ${msg}`, false);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2>{config.label}</h2>
      <label>
        Speed: <span className="speed-val">{speed}</span>
      </label>
      <input
        type="range"
        min={0}
        max={255}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
      <div className="btn-row">
        <button disabled={busy} onClick={() => sendCommand(`${config.forwardCmd}${speed}`)}>
          Forward
        </button>
        <button disabled={busy} onClick={() => sendCommand(`${config.reverseCmd}${speed}`)}>
          Reverse
        </button>
        <button className="stop-btn" disabled={busy} onClick={() => sendCommand(config.stopCmd)}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default ControlCard;
