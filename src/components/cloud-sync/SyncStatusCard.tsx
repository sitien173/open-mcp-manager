import React from 'react';
import { Activity, Loader, Upload, Download } from 'lucide-react';
import { useCloudSyncStore } from '../../stores/cloudSyncStore';
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
  metric: {
    flex: 1, padding: '10px 14px',
    background: 'var(--color-surface-2)', borderRadius: 8,
  },
  metricLabel: { fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-display)' },
};

export const SyncStatusCard: React.FC = () => {
  const { connected, lastSync, providers, activeProviderId, syncing, push, pull } = useCloudSyncStore();
  
  const activeProvider = providers.find(p => p.id === activeProviderId);
  const providerName = activeProvider?.providerType === 's3' ? 'S3-Compatible' :
                     activeProvider?.providerType === 'webdav' ? 'WebDAV' :
                     activeProvider?.providerType === 'rest' ? 'REST API' :
                     activeProvider?.providerType === 'gist' ? 'GitHub Gist' : 'None';

  const metrics = [
    { label: 'Status', value: connected ? 'Connected' : 'Offline', color: connected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)' },
    { label: 'Last sync', value: lastSync || 'Never', color: 'var(--color-ink-muted)' },
    { label: 'Provider', value: providerName, color: 'var(--color-ink-muted)' },
    { label: 'Devices', value: '1', color: 'var(--color-ink-muted)' }, // Hardcoded for now as per spec
  ];

  return (
    <div style={styles.card as React.CSSProperties}>
      <div style={styles.cardTitle as React.CSSProperties}>
        <Activity style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} />
        Sync status
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {metrics.map((m, i) => (
          <div key={i} style={styles.metric as React.CSSProperties}>
            <div style={styles.metricLabel as React.CSSProperties}>{m.label}</div>
            <div style={{ ...styles.metricValue, color: m.color } as React.CSSProperties}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn
          variant="primary"
          onClick={() => activeProviderId && push(activeProviderId, { version: '1', exportedAt: new Date().toISOString(), appVersion: '0.1.0', servers: [], metadata: {} })}
          disabled={!!syncing || !connected || !activeProviderId}
          style={{ flex: 1 }}
        >
          {syncing === 'push' ? (
            <><Loader style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Pushing...</>
          ) : (
            <><Upload style={{ width: 13, height: 13 }} /> Push to cloud</>
          )}
        </Btn>
        <Btn
          variant="secondary"
          onClick={() => activeProviderId && pull(activeProviderId)}
          disabled={!!syncing || !connected || !activeProviderId}
          style={{ flex: 1 }}
        >
          {syncing === 'pull' ? (
            <><Loader style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Pulling...</>
          ) : (
            <><Download style={{ width: 13, height: 13 }} /> Pull from cloud</>
          )}
        </Btn>
      </div>
    </div>
  );
};
