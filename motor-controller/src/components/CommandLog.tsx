import React from 'react';
import type { LogEntry } from '../types';

interface Props {
  entries: LogEntry[];
}

const CommandLog: React.FC<Props> = ({ entries }) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="log">
      <h2>Command Log</h2>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="log-entry"
          style={{ color: entry.success ? '#7CFC00' : '#FF6347' }}
        >
          [{entry.time}] {entry.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default CommandLog;
