/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Sidebar Navigation
   ═══════════════════════════════════════════════════════ */

const sbStyles = {
  root: {
    width: 220, height: '100%',
    background: '#0a0b0f',
    borderRight: '1px solid var(--color-hairline)',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'var(--font-text)', flexShrink: 0,
    userSelect: 'none',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '16px 16px 12px',
  },
  brandIcon: {
    width: 28, height: 28, borderRadius: 8,
    background: 'var(--color-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  brandName: {
    fontSize: 14, fontWeight: 600,
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.3px',
  },
  brandSub: {
    fontSize: 10, color: 'var(--color-ink-tertiary)',
    fontFamily: 'var(--font-mono)',
    marginTop: 1,
  },
  scroll: {
    flex: 1, overflowY: 'auto', overflowX: 'hidden',
    padding: '4px 0',
  },
  section: { padding: '6px 0' },
  sectionLabel: {
    fontSize: 10.5, fontWeight: 500,
    color: 'var(--color-ink-tertiary)',
    padding: '10px 16px 4px',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '6px 12px', margin: '1px 8px',
    fontSize: 13, fontWeight: 400,
    color: 'var(--color-ink-subtle)',
    cursor: 'pointer', borderRadius: 6,
    transition: 'background 0.1s, color 0.1s',
  },
  itemActive: {
    background: 'var(--color-surface-2)',
    color: 'var(--color-ink)',
  },
  itemHover: {
    background: 'var(--color-surface-1)',
    color: 'var(--color-ink-muted)',
  },
  count: {
    fontSize: 11, color: 'var(--color-ink-tertiary)',
    marginLeft: 'auto', fontFamily: 'var(--font-mono)',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid var(--color-hairline)',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  footerVersion: {
    fontSize: 11, color: 'var(--color-ink-tertiary)',
    fontFamily: 'var(--font-mono)',
  },
};

function SbItem({ icon, label, count, active, onClick, badge }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{
        ...sbStyles.item,
        ...(active ? sbStyles.itemActive : {}),
        ...(hovered && !active ? sbStyles.itemHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <i data-lucide={icon} style={{ width: 15, height: 15, opacity: active ? 0.9 : 0.5, flexShrink: 0 }}></i>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <Badge color={badge.color} bg={badge.bg}>{badge.text}</Badge>}
      {count != null && <span style={sbStyles.count}>{count}</span>}
    </div>
  );
}

function AppSidebar({ view, onNavigate, installedCount, clientCount }) {
  return (
    <div style={sbStyles.root}>
      <div style={sbStyles.brand}>
        <div style={sbStyles.brandIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.15 2.15M16.25 16.25l2.15 2.15M5.6 18.4l2.15-2.15M16.25 7.75l2.15-2.15" />
          </svg>
        </div>
        <div>
          <div style={sbStyles.brandName}>Open MCP Manager</div>
          <div style={sbStyles.brandSub}>v0.1.0-beta</div>
        </div>
      </div>

      <div style={sbStyles.scroll}>
        <div style={sbStyles.section}>
          <div style={sbStyles.sectionLabel}>Discover</div>
          <SbItem icon="package" label="Marketplace" active={view === 'marketplace'} onClick={() => onNavigate('marketplace')} count={MCP_SERVERS.length} />
        </div>

        <div style={sbStyles.section}>
          <div style={sbStyles.sectionLabel}>Manage</div>
          <SbItem icon="check-circle-2" label="Installed" active={view === 'installed'} onClick={() => onNavigate('installed')} count={installedCount} />
          <SbItem icon="monitor" label="Clients" active={view === 'clients'} onClick={() => onNavigate('clients')} count={clientCount} />
        </div>

        <div style={sbStyles.section}>
          <div style={sbStyles.sectionLabel}>Configure</div>
          <SbItem icon="cloud" label="Cloud Sync" active={view === 'cloud-sync'} onClick={() => onNavigate('cloud-sync')} badge={{ text: 'Synced', color: 'var(--color-semantic-success)', bg: '#27a64418' }} />
          <SbItem icon="layers" label="Profiles" active={view === 'profiles'} onClick={() => onNavigate('profiles')} />
          <SbItem icon="settings" label="Settings" active={view === 'settings'} onClick={() => onNavigate('settings')} />
        </div>
      </div>

      <div style={sbStyles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-semantic-success)',
          }} />
          <span style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>All systems operational</span>
        </div>
        <div style={sbStyles.footerVersion}>open-mcp-manager v0.1.0</div>
      </div>
    </div>
  );
}

Object.assign(window, { AppSidebar });
