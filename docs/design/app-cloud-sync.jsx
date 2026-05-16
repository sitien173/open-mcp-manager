/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Cloud Sync View
   ═══════════════════════════════════════════════════════ */

const csStyles = {
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
    flex: 1, overflowY: 'auto', padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16,
    maxWidth: 720,
  },
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
  mono: { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' },
  input: {
    background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
    borderRadius: 6, padding: '7px 10px', color: 'var(--color-ink)',
    fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none',
    width: '100%', transition: 'border-color 0.12s',
  },
  select: {
    background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
    borderRadius: 6, padding: '7px 10px', color: 'var(--color-ink)',
    fontSize: 12, fontFamily: 'var(--font-text)', outline: 'none',
    cursor: 'pointer', minWidth: 160,
  },
  statusDot: (connected) => ({
    width: 8, height: 8, borderRadius: '50%',
    background: connected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
    flexShrink: 0,
  }),
  deviceCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px',
    background: 'var(--color-surface-2)',
    borderRadius: 8,
  },
  deviceIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--color-surface-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logEntry: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid var(--color-hairline)',
    fontSize: 13,
  },
  logDot: (type) => ({
    width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0,
    background: type === 'push' ? 'var(--color-primary)' :
      type === 'pull' ? 'var(--color-semantic-success)' :
      type === 'conflict' ? '#f2994a' : 'var(--color-ink-tertiary)',
  }),
};

const SYNC_PROVIDERS = [
  { id: 's3', name: 'S3-Compatible', icon: 'hard-drive', fields: ['endpoint', 'bucket', 'accessKey', 'secretKey'] },
  { id: 'webdav', name: 'WebDAV', icon: 'server', fields: ['endpoint', 'username', 'password'] },
  { id: 'rest', name: 'REST API', icon: 'globe', fields: ['endpoint', 'apiKey'] },
  { id: 'gist', name: 'GitHub Gist', icon: 'git-branch', fields: ['token', 'gistId'] },
];

const MOCK_DEVICES = [
  { id: 'd1', name: 'DESKTOP-WORK', os: 'Windows 11', lastSeen: '2 min ago', current: true, servers: 5, clients: 4 },
  { id: 'd2', name: 'MacBook-Pro', os: 'macOS 15.2', lastSeen: '1 hour ago', current: false, servers: 3, clients: 2 },
  { id: 'd3', name: 'dev-server', os: 'Ubuntu 24.04', lastSeen: '3 hours ago', current: false, servers: 2, clients: 1 },
];

const MOCK_SYNC_LOG = [
  { id: 1, type: 'push', message: 'Pushed config to cloud', device: 'DESKTOP-WORK', time: '2 min ago', details: '5 servers, 4 clients' },
  { id: 2, type: 'pull', message: 'Pulled config from cloud', device: 'MacBook-Pro', time: '1 hour ago', details: '3 servers, 2 clients' },
  { id: 3, type: 'push', message: 'Pushed config to cloud', device: 'DESKTOP-WORK', time: '3 hours ago', details: '5 servers, 3 clients' },
  { id: 4, type: 'conflict', message: 'Conflict resolved (local wins)', device: 'dev-server', time: '6 hours ago', details: 'filesystem server config' },
  { id: 5, type: 'pull', message: 'Initial sync from cloud', device: 'dev-server', time: '1 day ago', details: '2 servers, 1 client' },
  { id: 6, type: 'push', message: 'Pushed config to cloud', device: 'DESKTOP-WORK', time: '1 day ago', details: '4 servers, 3 clients' },
];

function CloudSyncView({ addToast }) {
  const [connected, setConnected] = React.useState(true);
  const [provider, setProvider] = React.useState('s3');
  const [endpoint, setEndpoint] = React.useState('https://s3.us-east-1.amazonaws.com');
  const [bucket, setBucket] = React.useState('mcp-sync-prod');
  const [accessKey, setAccessKey] = React.useState('AKIA••••••••EXAMPLE');
  const [secretKey, setSecretKey] = React.useState('••••••••••••••••••••••••');
  const [token, setToken] = React.useState('ghp_••••••••••••••••••••');
  const [gistId, setGistId] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [autoSync, setAutoSync] = React.useState(true);
  const [syncInterval, setSyncInterval] = React.useState('5');
  const [conflictStrategy, setConflictStrategy] = React.useState('local-wins');
  const [encryptData, setEncryptData] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [lastSync, setLastSync] = React.useState('2 min ago');
  const [showLog, setShowLog] = React.useState(true);

  const currentProvider = SYNC_PROVIDERS.find(p => p.id === provider);

  const handleSync = (direction) => {
    setSyncing(direction);
    setTimeout(() => {
      setSyncing(false);
      setLastSync('Just now');
      addToast(`${direction === 'push' ? 'Pushed' : 'Pulled'} configuration ${direction === 'push' ? 'to' : 'from'} cloud`);
    }, 1200);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setConnected(true);
      addToast('Connection successful', 'success');
    }, 900);
  };

  const handleDisconnect = () => {
    setConnected(false);
    addToast('Disconnected from cloud sync', 'info');
  };

  return (
    <div style={csStyles.root}>
      <div style={csStyles.header}>
        <span style={csStyles.title}>Cloud Sync</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontFamily: 'var(--font-mono)',
          color: connected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
        }}>
          <div style={csStyles.statusDot(connected)} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
        {connected && (
          <Btn variant="ghost" size="sm" onClick={handleDisconnect}>Disconnect</Btn>
        )}
      </div>

      <div style={csStyles.content}>

        {/* ── Status Overview ── */}
        <div style={csStyles.card}>
          <div style={csStyles.cardTitle}>
            <i data-lucide="activity" style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }}></i>
            Sync status
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Status metrics */}
            {[
              { label: 'Status', value: connected ? 'Connected' : 'Offline', color: connected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)' },
              { label: 'Last sync', value: lastSync, color: 'var(--color-ink-muted)' },
              { label: 'Provider', value: currentProvider?.name, color: 'var(--color-ink-muted)' },
              { label: 'Devices', value: MOCK_DEVICES.length, color: 'var(--color-ink-muted)' },
            ].map((m, i) => (
              <div key={i} style={{
                flex: 1, padding: '10px 14px',
                background: 'var(--color-surface-2)', borderRadius: 8,
              }}>
                <div style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: m.color, fontFamily: 'var(--font-display)' }}>{m.value}</div>
              </div>
            ))}
          </div>
          {/* Sync buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn
              variant="primary"
              onClick={() => handleSync('push')}
              disabled={!!syncing || !connected}
            >
              {syncing === 'push' ? (
                <><i data-lucide="loader" style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }}></i> Pushing...</>
              ) : (
                <><i data-lucide="upload" style={{ width: 13, height: 13 }}></i> Push to cloud</>
              )}
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => handleSync('pull')}
              disabled={!!syncing || !connected}
            >
              {syncing === 'pull' ? (
                <><i data-lucide="loader" style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }}></i> Pulling...</>
              ) : (
                <><i data-lucide="download" style={{ width: 13, height: 13 }}></i> Pull from cloud</>
              )}
            </Btn>
          </div>
        </div>

        {/* ── Provider Configuration ── */}
        <div style={csStyles.card}>
          <div style={csStyles.cardTitle}>
            <i data-lucide="cloud-cog" style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }}></i>
            Provider configuration
          </div>

          {/* Provider selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {SYNC_PROVIDERS.map(p => {
              const active = provider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  style={{
                    flex: 1, padding: '10px 12px',
                    background: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
                    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.12s',
                  }}
                >
                  <i data-lucide={p.icon} style={{ width: 16, height: 16, color: active ? '#fff' : 'var(--color-ink-subtle)' }}></i>
                  <span style={{ fontSize: 11, fontWeight: 500, color: active ? '#fff' : 'var(--color-ink-subtle)' }}>{p.name}</span>
                </div>
              );
            })}
          </div>

          {/* Provider-specific fields */}
          {provider === 's3' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>Endpoint</div>
                <input style={csStyles.input} value={endpoint} onChange={e => setEndpoint(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>Bucket</div>
                <input style={csStyles.input} value={bucket} onChange={e => setBucket(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>Access Key</div>
                  <input style={csStyles.input} value={accessKey} onChange={e => setAccessKey(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>Secret Key</div>
                  <input style={csStyles.input} type="password" value={secretKey} onChange={e => setSecretKey(e.target.value)} />
                </div>
              </div>
            </div>
          )}
          {provider === 'webdav' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>WebDAV URL</div>
                <input style={csStyles.input} value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://dav.example.com/mcp/" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>Username</div>
                  <input style={csStyles.input} value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>Password</div>
                  <input style={csStyles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
            </div>
          )}
          {provider === 'rest' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>API Endpoint</div>
                <input style={csStyles.input} value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://api.example.com/mcp-sync" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>API Key</div>
                <input style={csStyles.input} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." />
              </div>
            </div>
          )}
          {provider === 'gist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>GitHub Personal Access Token</div>
                <input style={csStyles.input} type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="ghp_..." />
                <div style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 4 }}>Requires <code style={{ color: 'var(--color-primary)' }}>gist</code> scope</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 4 }}>Gist ID (leave empty to create new)</div>
                <input style={csStyles.input} value={gistId} onChange={e => setGistId(e.target.value)} placeholder="abc123def456..." />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" onClick={handleTestConnection} disabled={testing}>
              {testing ? (
                <><i data-lucide="loader" style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }}></i> Testing...</>
              ) : (
                <><i data-lucide="plug" style={{ width: 13, height: 13 }}></i> Test connection</>
              )}
            </Btn>
            <Btn variant="ghost" size="sm">
              <i data-lucide="book-open" style={{ width: 13, height: 13 }}></i> Docs
            </Btn>
          </div>
        </div>

        {/* ── Sync Settings ── */}
        <div style={csStyles.card}>
          <div style={csStyles.cardTitle}>
            <i data-lucide="settings" style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }}></i>
            Sync settings
          </div>
          <div style={csStyles.rowBorder}>
            <div>
              <div style={csStyles.label}>Auto-sync</div>
              <div style={csStyles.sub}>Automatically push changes when config is modified</div>
            </div>
            <Toggle checked={autoSync} onChange={setAutoSync} />
          </div>
          {autoSync && (
            <div style={csStyles.rowBorder}>
              <div>
                <div style={csStyles.label}>Sync interval</div>
                <div style={csStyles.sub}>How often to check for remote changes</div>
              </div>
              <select
                style={csStyles.select}
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
          <div style={csStyles.rowBorder}>
            <div>
              <div style={csStyles.label}>Conflict resolution</div>
              <div style={csStyles.sub}>How to handle conflicts when local and remote differ</div>
            </div>
            <select
              style={csStyles.select}
              value={conflictStrategy}
              onChange={e => setConflictStrategy(e.target.value)}
            >
              <option value="local-wins">Local wins</option>
              <option value="remote-wins">Remote wins</option>
              <option value="newest-wins">Newest wins</option>
              <option value="ask">Ask each time</option>
            </select>
          </div>
          <div style={csStyles.row}>
            <div>
              <div style={csStyles.label}>Encrypt sync data</div>
              <div style={csStyles.sub}>AES-256-GCM encryption before upload (recommended)</div>
            </div>
            <Toggle checked={encryptData} onChange={setEncryptData} />
          </div>
        </div>

        {/* ── Devices ── */}
        <div style={csStyles.card}>
          <div style={csStyles.cardTitle}>
            <i data-lucide="monitor-smartphone" style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }}></i>
            Synced devices
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-tertiary)', fontWeight: 400 }}>
              {MOCK_DEVICES.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_DEVICES.map(dev => (
              <div key={dev.id} style={csStyles.deviceCard}>
                <div style={csStyles.deviceIcon}>
                  <i data-lucide={dev.os.includes('Windows') ? 'monitor' : dev.os.includes('mac') ? 'laptop' : 'server'} style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: 'var(--color-ink)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {dev.name}
                    {dev.current && <Badge color="var(--color-primary)" bg="#5e6ad220">This device</Badge>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {dev.os} · {dev.servers} servers · {dev.clients} clients
                  </div>
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--color-ink-tertiary)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <div style={csStyles.statusDot(dev.current || dev.lastSeen.includes('min'))} />
                  {dev.lastSeen}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sync History ── */}
        <div style={csStyles.card}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ ...csStyles.cardTitle, flex: 1 }}>
              <i data-lucide="history" style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }}></i>
              Sync history
            </div>
            <Btn variant="ghost" size="sm" onClick={() => setShowLog(!showLog)}>
              <i data-lucide={showLog ? 'chevron-up' : 'chevron-down'} style={{ width: 13, height: 13 }}></i>
              {showLog ? 'Collapse' : 'Expand'}
            </Btn>
          </div>
          {showLog && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {MOCK_SYNC_LOG.map(entry => (
                <div key={entry.id} style={csStyles.logEntry}>
                  <div style={csStyles.logDot(entry.type)} />
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

      </div>
    </div>
  );
}

Object.assign(window, { CloudSyncView });
