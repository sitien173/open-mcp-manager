import React, { useEffect } from 'react';
import { useCloudSyncStore } from '../../stores/cloudSyncStore';
import { Btn } from '../ui/Btn';
import { SyncStatusCard } from './SyncStatusCard';
import { ProviderSelector } from './ProviderSelector';
import { SyncSettingsCard } from './SyncSettingsCard';
import { DevicesCard } from './DevicesCard';
import { SyncHistoryCard } from './SyncHistoryCard';

const styles = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', minWidth: 0,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 24px',
    borderBottom: '1px solid var(--color-hairline)',
    flexShrink: 0,
  },
  title: {
    fontSize: 15, fontWeight: 600, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.3px',
    flex: 1,
  },
  content: {
    flex: 1, overflowY: 'auto' as const, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16,
    maxWidth: 720,
    margin: '0 auto',
    width: '100%',
  },
  statusDot: (connected: boolean) => ({
    width: 8, height: 8, borderRadius: '50%',
    background: connected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
    flexShrink: 0,
  }),
};

export const CloudSyncView: React.FC = () => {
  const { connected, fetchProviders } = useCloudSyncStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return (
    <div style={styles.root as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <span style={styles.title as React.CSSProperties}>Cloud Sync</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontFamily: 'var(--font-mono)',
          color: connected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
        }}>
          <div style={styles.statusDot(connected) as React.CSSProperties} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
        {connected && (
          <Btn variant="ghost" size="sm" onClick={() => {}}>Disconnect</Btn>
        )}
      </div>

      <div style={styles.content as React.CSSProperties}>
        <SyncStatusCard />
        <ProviderSelector />
        <SyncSettingsCard />
        <DevicesCard />
        <SyncHistoryCard />
      </div>
    </div>
  );
};
