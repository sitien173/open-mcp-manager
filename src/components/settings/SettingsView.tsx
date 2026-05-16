import React, { useState } from 'react';
import { Cloud, CloudCog } from 'lucide-react';
import { Toggle } from '../ui/Toggle';
import { Btn } from '../ui/Btn';
import { Badge } from '../ui/Badge';
import { useCloudSyncStore } from '../../stores/cloudSyncStore';

interface SettingsViewProps {
  onNavigate: (view: any) => void;
}

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
  },
  content: {
    flex: 1, overflowY: 'auto' as const, padding: 24,
    maxWidth: 640,
  },
  group: {
    marginBottom: 28,
  },
  groupTitle: {
    fontSize: 13, fontWeight: 600, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.1px',
    marginBottom: 12,
  },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--color-hairline)',
    gap: 16,
  },
  rowLabel: {
    fontSize: 13, color: 'var(--color-ink-muted)',
  },
  rowSub: {
    fontSize: 11, color: 'var(--color-ink-tertiary)',
    marginTop: 2,
  },
  input: {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 6, padding: '6px 10px',
    color: 'var(--color-ink)', fontSize: 12,
    fontFamily: 'var(--font-mono)',
    outline: 'none', width: 260,
  },
  cloudCard: {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 10, padding: '16px 18px',
    display: 'flex', flexDirection: 'column' as const, gap: 10,
  },
};

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const [autoSync, setAutoSync] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [registryUrl, setRegistryUrl] = useState('https://registry.mcphub.io');
  
  const { connected, providers, activeProviderId } = useCloudSyncStore();
  const activeProvider = providers.find(p => p.id === activeProviderId);
  const providerName = activeProvider?.providerType === 's3' ? 'an S3-compatible endpoint' :
                     activeProvider?.providerType === 'webdav' ? 'a WebDAV server' :
                     activeProvider?.providerType === 'rest' ? 'a REST API' :
                     activeProvider?.providerType === 'gist' ? 'GitHub Gist' : 'the cloud';

  return (
    <div style={styles.root as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <span style={styles.title as React.CSSProperties}>Settings</span>
      </div>
      <div style={styles.content as React.CSSProperties}>
        {/* General */}
        <div style={styles.group}>
          <div style={styles.groupTitle as React.CSSProperties}>General</div>
          <div style={styles.row as React.CSSProperties}>
            <div>
              <div style={styles.rowLabel as React.CSSProperties}>Auto-sync client configs</div>
              <div style={styles.rowSub as React.CSSProperties}>Automatically keep all client configs in sync when changes are made</div>
            </div>
            <Toggle checked={autoSync} onChange={setAutoSync} />
          </div>
          <div style={styles.row as React.CSSProperties}>
            <div>
              <div style={styles.rowLabel as React.CSSProperties}>Auto-update servers</div>
              <div style={styles.rowSub as React.CSSProperties}>Automatically update installed servers when new versions are available</div>
            </div>
            <Toggle checked={autoUpdate} onChange={setAutoUpdate} />
          </div>
          <div style={styles.row as React.CSSProperties}>
            <div>
              <div style={styles.rowLabel as React.CSSProperties}>Send anonymous usage data</div>
              <div style={styles.rowSub as React.CSSProperties}>Help improve Open MCP Manager by sharing anonymous usage statistics</div>
            </div>
            <Toggle checked={telemetry} onChange={setTelemetry} />
          </div>
        </div>

        {/* Registry */}
        <div style={styles.group}>
          <div style={styles.groupTitle as React.CSSProperties}>Registry</div>
          <div style={styles.row as React.CSSProperties}>
            <div>
              <div style={styles.rowLabel as React.CSSProperties}>Registry URL</div>
              <div style={styles.rowSub as React.CSSProperties}>MCP server registry endpoint</div>
            </div>
            <input
              style={styles.input}
              value={registryUrl}
              onChange={e => setRegistryUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Cloud sync */}
        <div style={styles.group}>
          <div style={styles.groupTitle as React.CSSProperties}>Cloud sync</div>
          <div style={styles.cloudCard as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cloud style={{ width: 16, height: 16, color: connected ? 'var(--color-semantic-success)' : 'var(--color-ink-subtle)' }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>BYO Cloud Sync</span>
              <Badge 
                color={connected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)'} 
                bg={connected ? '#27a64418' : 'var(--color-surface-2)'}
              >
                {connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div style={{
              fontSize: 13, color: 'var(--color-ink-subtle)', lineHeight: 1.5,
            }}>
              {connected 
                ? `Your configs are syncing to ${providerName}. Manage your connection, view history, and configure sync behavior in the Cloud Sync panel.`
                : "Connect your own storage to sync your configurations across all your devices securely."}
            </div>
            <div>
              <Btn variant="secondary" size="sm" onClick={() => onNavigate('cloud-sync')}>
                <CloudCog style={{ width: 13, height: 13 }} />
                Open Cloud Sync settings
              </Btn>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={styles.group}>
          <div style={styles.groupTitle as React.CSSProperties}>About</div>
          <div style={styles.row as React.CSSProperties}>
            <div style={styles.rowLabel as React.CSSProperties}>Version</div>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>0.1.0-beta</span>
          </div>
          <div style={styles.row as React.CSSProperties}>
            <div style={styles.rowLabel as React.CSSProperties}>License</div>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>MIT</span>
          </div>
          <div style={{ ...styles.row, borderBottom: 'none' } as React.CSSProperties}>
            <div style={styles.rowLabel as React.CSSProperties}>GitHub</div>
            <a href="https://github.com/open-mcp/manager" target="_blank" rel="noreferrer" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textDecoration: 'none' }}>
              github.com/open-mcp/manager
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
