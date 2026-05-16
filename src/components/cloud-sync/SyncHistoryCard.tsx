import React, { useState } from 'react';
import { History, ChevronUp, ChevronDown } from 'lucide-react';
import { Btn } from '../ui/Btn';

const styles = {
  card: {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 12, padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  cardTitle: {
    fontSize: 13, fontWeight: 600, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.1px',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  logEntry: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid var(--color-hairline)',
    fontSize: 13,
  },
  logDot: (type: string) => ({
    width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0,
    background: type === 'push' ? 'var(--color-primary)' :
      type === 'pull' ? 'var(--color-semantic-success)' :
      type === 'conflict' ? '#f2994a' : 'var(--color-ink-tertiary)',
  }),
};

const MOCK_SYNC_LOG = [
  { id: 1, type: 'push', message: 'Pushed config to cloud', device: 'DESKTOP-WORK', time: '2 min ago', details: '5 servers, 4 clients' },
  { id: 2, type: 'pull', message: 'Pulled config from cloud', device: 'MacBook-Pro', time: '1 hour ago', details: '3 servers, 2 clients' },
  { id: 3, type: 'push', message: 'Pushed config to cloud', device: 'DESKTOP-WORK', time: '3 hours ago', details: '5 servers, 3 clients' },
  { id: 4, type: 'conflict', message: 'Conflict resolved (local wins)', device: 'dev-server', time: '6 hours ago', details: 'filesystem server config' },
  { id: 5, type: 'pull', message: 'Initial sync from cloud', device: 'dev-server', time: '1 day ago', details: '2 servers, 1 client' },
  { id: 6, type: 'push', message: 'Pushed config to cloud', device: 'DESKTOP-WORK', time: '1 day ago', details: '4 servers, 3 clients' },
];

export const SyncHistoryCard: React.FC = () => {
  const [showLog, setShowLog] = useState(true);

  return (
    <div style={styles.card as React.CSSProperties}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ ...styles.cardTitle, flex: 1 } as React.CSSProperties}>
          <History style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} />
          Sync history
        </div>
        <Btn variant="ghost" size="sm" onClick={() => setShowLog(!showLog)}>
          {showLog ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
          {showLog ? 'Collapse' : 'Expand'}
        </Btn>
      </div>
      {showLog && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MOCK_SYNC_LOG.map(entry => (
            <div key={entry.id} style={styles.logEntry as React.CSSProperties}>
              <div style={styles.logDot(entry.type) as React.CSSProperties} />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                  {entry.message}
                  <span style={{ color: 'var(--color-ink-tertiary)', fontSize: 12 }}> — {entry.device}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 2 }}>
                  {entry.details}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {entry.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
