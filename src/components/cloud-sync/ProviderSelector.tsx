import React, { useState, useEffect } from 'react';
import { CloudCog, HardDrive, Server, Globe, GitBranch, Loader, Plug, BookOpen } from 'lucide-react';
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
  providerGrid: { display: 'flex', gap: 6 },
  providerItem: (active: boolean) => ({
    flex: 1, padding: '10px 12px',
    background: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
    borderRadius: 8, cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    transition: 'all 0.12s',
  }),
  fieldLabel: { fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 },
  input: {
    background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
    borderRadius: 6, padding: '7px 10px', color: 'var(--color-ink)',
    fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none',
    width: '100%', transition: 'border-color 0.12s',
  },
  hint: { fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 4 },
};

const PROVIDERS = [
  { id: 's3', name: 'S3-Compatible', icon: HardDrive },
  { id: 'webdav', name: 'WebDAV', icon: Server },
  { id: 'rest', name: 'REST API', icon: Globe },
  { id: 'gist', name: 'GitHub Gist', icon: GitBranch },
];

export const ProviderSelector: React.FC = () => {
  const { providers, activeProviderId, testing, configureProvider, testConnection } = useCloudSyncStore();
  const [selectedType, setSelectedType] = useState('s3');
  
  const activeProvider = providers.find(p => p.id === activeProviderId);

  // Form state
  const [config, setConfig] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeProvider) {
      setSelectedType(activeProvider.providerType);
      setConfig(activeProvider.config || {});
    }
  }, [activeProvider]);

  const handleSave = async () => {
    await configureProvider({
      id: activeProviderId || undefined,
      providerType: selectedType,
      config,
      secrets,
    });
  };

  const handleTest = async () => {
    if (activeProviderId) {
      await testConnection(activeProviderId);
    } else {
      // If not saved yet, we might need to save first or the backend might handle unsaved
      // For now, let's assume we save then test
      await handleSave();
      // Re-fetch to get the ID if it was new
      const latestActiveId = useCloudSyncStore.getState().activeProviderId;
      if (latestActiveId) {
        await testConnection(latestActiveId);
      }
    }
  };

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateSecret = (key: string, value: string) => {
    setSecrets(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={styles.card as React.CSSProperties}>
      <div style={styles.cardTitle as React.CSSProperties}>
        <CloudCog style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} />
        Provider configuration
      </div>

      <div style={styles.providerGrid}>
        {PROVIDERS.map(p => {
          const active = selectedType === p.id;
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedType(p.id)}
              style={styles.providerItem(active) as React.CSSProperties}
            >
              <Icon style={{ width: 16, height: 16, color: active ? '#fff' : 'var(--color-ink-subtle)' }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: active ? '#fff' : 'var(--color-ink-subtle)' }}>{p.name}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {selectedType === 's3' && (
          <>
            <div>
              <div style={styles.fieldLabel as React.CSSProperties}>Endpoint</div>
              <input 
                style={styles.input} 
                value={config.endpoint || ''} 
                onChange={e => updateConfig('endpoint', e.target.value)} 
                placeholder="https://s3.us-east-1.amazonaws.com"
              />
            </div>
            <div>
              <div style={styles.fieldLabel as React.CSSProperties}>Bucket</div>
              <input 
                style={styles.input} 
                value={config.bucket || ''} 
                onChange={e => updateConfig('bucket', e.target.value)} 
                placeholder="mcp-sync-prod"
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={styles.fieldLabel as React.CSSProperties}>Access Key</div>
                <input 
                  style={styles.input} 
                  value={secrets.accessKey || ''} 
                  onChange={e => updateSecret('accessKey', e.target.value)} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.fieldLabel as React.CSSProperties}>Secret Key</div>
                <input 
                  style={styles.input} 
                  type="password" 
                  value={secrets.secretKey || ''} 
                  onChange={e => updateSecret('secretKey', e.target.value)} 
                />
              </div>
            </div>
          </>
        )}

        {selectedType === 'webdav' && (
          <>
            <div>
              <div style={styles.fieldLabel as React.CSSProperties}>WebDAV URL</div>
              <input 
                style={styles.input} 
                value={config.endpoint || ''} 
                onChange={e => updateConfig('endpoint', e.target.value)} 
                placeholder="https://dav.example.com/mcp/" 
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={styles.fieldLabel as React.CSSProperties}>Username</div>
                <input 
                  style={styles.input} 
                  value={secrets.username || ''} 
                  onChange={e => updateSecret('username', e.target.value)} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.fieldLabel as React.CSSProperties}>Password</div>
                <input 
                  style={styles.input} 
                  type="password" 
                  value={secrets.password || ''} 
                  onChange={e => updateSecret('password', e.target.value)} 
                />
              </div>
            </div>
          </>
        )}

        {selectedType === 'rest' && (
          <>
            <div>
              <div style={styles.fieldLabel as React.CSSProperties}>API Endpoint</div>
              <input 
                style={styles.input} 
                value={config.endpoint || ''} 
                onChange={e => updateConfig('endpoint', e.target.value)} 
                placeholder="https://api.example.com/mcp-sync" 
              />
            </div>
            <div>
              <div style={styles.fieldLabel as React.CSSProperties}>API Key</div>
              <input 
                style={styles.input} 
                type="password" 
                value={secrets.apiKey || ''} 
                onChange={e => updateSecret('apiKey', e.target.value)} 
                placeholder="sk-..." 
              />
            </div>
          </>
        )}

        {selectedType === 'gist' && (
          <>
            <div>
              <div style={styles.fieldLabel as React.CSSProperties}>GitHub Personal Access Token</div>
              <input 
                style={styles.input} 
                type="password" 
                value={secrets.token || ''} 
                onChange={e => updateSecret('token', e.target.value)} 
                placeholder="ghp_..." 
              />
              <div style={styles.hint as React.CSSProperties}>Requires <code style={{ color: 'var(--color-primary)' }}>gist</code> scope</div>
            </div>
            <div>
              <div style={styles.fieldLabel as React.CSSProperties}>Gist ID (leave empty to create new)</div>
              <input 
                style={styles.input} 
                value={config.gistId || ''} 
                onChange={e => updateConfig('gistId', e.target.value)} 
                placeholder="abc123def456..." 
              />
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="primary" size="sm" onClick={handleSave}>
          Save configuration
        </Btn>
        <Btn variant="secondary" size="sm" onClick={handleTest} disabled={testing}>
          {testing ? (
            <><Loader style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Testing...</>
          ) : (
            <><Plug style={{ width: 13, height: 13 }} /> Test connection</>
          )}
        </Btn>
        <Btn variant="ghost" size="sm">
          <BookOpen style={{ width: 13, height: 13 }} /> Docs
        </Btn>
      </div>
    </div>
  );
};
