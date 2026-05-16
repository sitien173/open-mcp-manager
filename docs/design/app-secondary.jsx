/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Profiles & Settings Views
   ═══════════════════════════════════════════════════════ */

// ── Profiles View ────────────────────────────────────

const profStyles = {
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
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  card: {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 12, padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: 10,
    transition: 'background 0.12s, border-color 0.12s',
    cursor: 'pointer',
  },
  cardTop: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
};

function ProfileCard({ profile, onExport, onApply, onDelete }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{
        ...profStyles.card,
        borderColor: hovered ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={profStyles.cardTop}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'var(--color-surface-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i data-lucide="layers" style={{ width: 17, height: 17, color: 'var(--color-ink-subtle)' }}></i>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--color-ink)',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.2px',
          }}>{profile.name}</div>
          <div style={{
            fontSize: 11, color: 'var(--color-ink-tertiary)',
            fontFamily: 'var(--font-mono)', marginTop: 2,
          }}>
            {profile.serverCount} servers · {profile.clientCount} clients · {profile.createdAt}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 13, color: 'var(--color-ink-subtle)', lineHeight: 1.45,
      }}>{profile.description}</div>
      {hovered && (
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <Btn variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onApply(profile.id); }}>
            <i data-lucide="check" style={{ width: 12, height: 12 }}></i> Apply
          </Btn>
          <Btn variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onExport(profile.id); }}>
            <i data-lucide="download" style={{ width: 12, height: 12 }}></i> Export
          </Btn>
          <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}>
            <i data-lucide="trash-2" style={{ width: 12, height: 12 }}></i>
          </Btn>
        </div>
      )}
    </div>
  );
}

function ProfilesView({ profiles, onSaveProfile, onExport, onApply, onImport, onDelete }) {
  return (
    <div style={profStyles.root}>
      <div style={profStyles.header}>
        <span style={profStyles.title}>Profiles</span>
        <Btn variant="secondary" size="sm" onClick={onImport}>
          <i data-lucide="upload" style={{ width: 13, height: 13 }}></i> Import
        </Btn>
        <Btn variant="primary" size="sm" onClick={onSaveProfile}>
          <i data-lucide="plus" style={{ width: 13, height: 13 }}></i> Save current
        </Btn>
      </div>
      <div style={profStyles.content}>
        <div style={{
          fontSize: 13, color: 'var(--color-ink-subtle)', lineHeight: 1.5,
          padding: '8px 0 4px',
        }}>
          Profiles capture your current server and client configuration as a snapshot.
          Export profiles to share between machines, or import to restore a previous setup.
        </div>
        {profiles.map(p => (
          <ProfileCard key={p.id} profile={p} onExport={onExport} onApply={onApply} onDelete={onDelete} />
        ))}
        {profiles.length === 0 && (
          <EmptyState icon="layers" title="No profiles saved" subtitle="Save your current configuration as a profile to back up or share it" />
        )}
      </div>
    </div>
  );
}

// ── Settings View ────────────────────────────────────

const setStyles = {
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
    flex: 1, overflowY: 'auto', padding: 24,
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
};

function SettingsView() {
  const [autoSync, setAutoSync] = React.useState(true);
  const [autoUpdate, setAutoUpdate] = React.useState(false);
  const [telemetry, setTelemetry] = React.useState(false);
  const [registryUrl, setRegistryUrl] = React.useState('https://registry.mcphub.io');

  return (
    <div style={setStyles.root}>
      <div style={setStyles.header}>
        <span style={setStyles.title}>Settings</span>
      </div>
      <div style={setStyles.content}>
        {/* General */}
        <div style={setStyles.group}>
          <div style={setStyles.groupTitle}>General</div>
          <div style={setStyles.row}>
            <div>
              <div style={setStyles.rowLabel}>Auto-sync client configs</div>
              <div style={setStyles.rowSub}>Automatically keep all client configs in sync when changes are made</div>
            </div>
            <Toggle checked={autoSync} onChange={setAutoSync} />
          </div>
          <div style={setStyles.row}>
            <div>
              <div style={setStyles.rowLabel}>Auto-update servers</div>
              <div style={setStyles.rowSub}>Automatically update installed servers when new versions are available</div>
            </div>
            <Toggle checked={autoUpdate} onChange={setAutoUpdate} />
          </div>
          <div style={setStyles.row}>
            <div>
              <div style={setStyles.rowLabel}>Send anonymous usage data</div>
              <div style={setStyles.rowSub}>Help improve Open MCP Manager by sharing anonymous usage statistics</div>
            </div>
            <Toggle checked={telemetry} onChange={setTelemetry} />
          </div>
        </div>

        {/* Registry */}
        <div style={setStyles.group}>
          <div style={setStyles.groupTitle}>Registry</div>
          <div style={setStyles.row}>
            <div>
              <div style={setStyles.rowLabel}>Registry URL</div>
              <div style={setStyles.rowSub}>MCP server registry endpoint</div>
            </div>
            <input
              style={setStyles.input}
              value={registryUrl}
              onChange={e => setRegistryUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Cloud sync */}
        <div style={setStyles.group}>
          <div style={setStyles.groupTitle}>Cloud sync</div>
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 10, padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i data-lucide="cloud" style={{ width: 16, height: 16, color: 'var(--color-semantic-success)' }}></i>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>BYO Cloud Sync</span>
              <Badge color="var(--color-semantic-success)" bg="#27a64418">Connected</Badge>
            </div>
            <div style={{
              fontSize: 13, color: 'var(--color-ink-subtle)', lineHeight: 1.5,
            }}>
              Your configs are syncing to an S3-compatible endpoint across 3 devices.
              Manage your connection, view history, and configure sync behavior in the Cloud Sync panel.
            </div>
            <div>
              <Btn variant="secondary" size="sm" onClick={() => { if (window.__navigateToCloudSync) window.__navigateToCloudSync(); }}>
                <i data-lucide="cloud-cog" style={{ width: 13, height: 13 }}></i>
                Open Cloud Sync settings
              </Btn>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={setStyles.group}>
          <div style={setStyles.groupTitle}>About</div>
          <div style={setStyles.row}>
            <div style={setStyles.rowLabel}>Version</div>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>0.1.0-beta</span>
          </div>
          <div style={setStyles.row}>
            <div style={setStyles.rowLabel}>License</div>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>MIT</span>
          </div>
          <div style={{ ...setStyles.row, borderBottom: 'none' }}>
            <div style={setStyles.rowLabel}>GitHub</div>
            <a href="#" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
              github.com/open-mcp/manager
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfilesView, SettingsView });
