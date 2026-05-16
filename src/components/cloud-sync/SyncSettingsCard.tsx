import React from 'react';
import { Settings } from 'lucide-react';
import { useCloudSyncStore } from '../../stores/cloudSyncStore';
import { Toggle } from '../ui/Toggle';

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
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0', gap: 16,
  },
  rowBorder: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 0', gap: 16,
    borderBottom: '1px solid var(--color-hairline)',
  },
  label: { fontSize: 13, color: 'var(--color-ink-muted)' },
  sub: { fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 2 },
  select: {
    background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
    borderRadius: 6, padding: '7px 10px', color: 'var(--color-ink)',
    fontSize: 12, fontFamily: 'var(--font-text)', outline: 'none',
    cursor: 'pointer', minWidth: 160,
  },
};

export const SyncSettingsCard: React.FC = () => {
  const { 
    autoSync, setAutoSync,
    syncInterval, setSyncInterval,
    conflictStrategy, setConflictStrategy,
    encryptData, setEncryptData 
  } = useCloudSyncStore();

  return (
    <div style={styles.card as React.CSSProperties}>
      <div style={styles.cardTitle as React.CSSProperties}>
        <Settings style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} />
        Sync settings
      </div>
      
      <div style={styles.rowBorder as React.CSSProperties}>
        <div>
          <div style={styles.label as React.CSSProperties}>Auto-sync</div>
          <div style={styles.sub as React.CSSProperties}>Automatically push changes when config is modified</div>
        </div>
        <Toggle checked={autoSync} onChange={setAutoSync} />
      </div>

      {autoSync && (
        <div style={styles.rowBorder as React.CSSProperties}>
          <div>
            <div style={styles.label as React.CSSProperties}>Sync interval</div>
            <div style={styles.sub as React.CSSProperties}>How often to check for remote changes</div>
          </div>
          <select
            style={styles.select as React.CSSProperties}
            value={syncInterval}
            onChange={e => setSyncInterval(e.target.value)}
          >
            <option value="1">Every minute</option>
            <option value="5">Every 5 minutes</option>
            <option value="15">Every 15 minutes</option>
            <option value="30">Every 30 minutes</option>
            <option value="60">Every hour</option>
          </select>
        </div>
      )}

      <div style={styles.rowBorder as React.CSSProperties}>
        <div>
          <div style={styles.label as React.CSSProperties}>Conflict resolution</div>
          <div style={styles.sub as React.CSSProperties}>How to handle conflicts when local and remote differ</div>
        </div>
        <select
          style={styles.select as React.CSSProperties}
          value={conflictStrategy}
          onChange={e => setConflictStrategy(e.target.value)}
        >
          <option value="local-wins">Local wins</option>
          <option value="remote-wins">Remote wins</option>
          <option value="newest-wins">Newest wins</option>
          <option value="ask">Ask each time</option>
        </select>
      </div>

      <div style={styles.row as React.CSSProperties}>
        <div>
          <div style={styles.label as React.CSSProperties}>Encrypt sync data</div>
          <div style={styles.sub as React.CSSProperties}>AES-256-GCM encryption before upload (recommended)</div>
        </div>
        <Toggle checked={encryptData} onChange={setEncryptData} />
      </div>
    </div>
  );
};
