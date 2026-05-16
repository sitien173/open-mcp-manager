/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Installed Servers & Clients Views
   ═══════════════════════════════════════════════════════ */

// ── Installed Servers View ───────────────────────────

const instStyles = {
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
  count: {
    fontSize: 12, color: 'var(--color-ink-tertiary)',
    fontFamily: 'var(--font-mono)',
  },
  list: { flex: 1, overflowY: 'auto', padding: '0' },
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 24px',
    borderBottom: '1px solid var(--color-hairline)',
    transition: 'background 0.1s',
    cursor: 'pointer',
  },
  icon: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--color-surface-2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  name: {
    fontSize: 13, fontWeight: 500, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.1px',
  },
  meta: {
    fontSize: 11, color: 'var(--color-ink-tertiary)',
    fontFamily: 'var(--font-mono)', marginTop: 2,
  },
  clients: {
    display: 'flex', gap: 4, alignItems: 'center',
  },
  clientDot: {
    width: 22, height: 22, borderRadius: 6,
    background: 'var(--color-surface-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 600, color: 'var(--color-ink-subtle)',
  },
};

function InstalledRow({ entry, server, clients, onToggle, onSelect, onRemove }) {
  const [hovered, setHovered] = React.useState(false);
  if (!server) return null;
  const clientNames = entry.clientIds.map(cid => {
    const cl = clients.find(c => c.id === cid);
    return cl ? cl.name : cid;
  });

  return (
    <div
      style={{ ...instStyles.row, background: hovered ? 'var(--color-surface-1)' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(server)}
    >
      <Toggle checked={entry.enabled} onChange={() => onToggle(entry.serverId)} size="sm" />
      <div style={instStyles.icon}>
        <i data-lucide={server.icon} style={{ width: 15, height: 15, color: entry.enabled ? 'var(--color-ink-subtle)' : 'var(--color-ink-tertiary)' }}></i>
      </div>
      <div style={{ flex: 1, minWidth: 0, opacity: entry.enabled ? 1 : 0.5 }}>
        <div style={instStyles.name}>{server.name}</div>
        <div style={instStyles.meta}>v{entry.version} · {server.transport}</div>
      </div>
      <div style={instStyles.clients}>
        {clientNames.slice(0, 4).map((n, i) => (
          <div key={i} style={instStyles.clientDot} title={n}>
            {n.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
        ))}
        {clientNames.length > 4 && (
          <span style={{ fontSize: 11, color: 'var(--color-ink-tertiary)' }}>+{clientNames.length - 4}</span>
        )}
      </div>
      {hovered && (
        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          <Btn variant="ghost" size="sm" onClick={() => onSelect(server)}>
            <i data-lucide="settings" style={{ width: 13, height: 13 }}></i>
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => onRemove(entry.serverId)}>
            <i data-lucide="trash-2" style={{ width: 13, height: 13, color: '#eb5757' }}></i>
          </Btn>
        </div>
      )}
    </div>
  );
}

function InstalledView({ installed, clients, onToggle, onSelectServer, onRemove }) {
  const enabledCount = installed.filter(i => i.enabled).length;

  return (
    <div style={instStyles.root}>
      <div style={instStyles.header}>
        <span style={instStyles.title}>Installed servers</span>
        <span style={instStyles.count}>{enabledCount} enabled · {installed.length} total</span>
      </div>
      <div style={instStyles.list}>
        {installed.length === 0 ? (
          <EmptyState icon="package" title="No servers installed" subtitle="Browse the Marketplace to discover and install MCP servers" />
        ) : (
          installed.map(entry => {
            const server = MCP_SERVERS.find(s => s.id === entry.serverId);
            return (
              <InstalledRow
                key={entry.serverId}
                entry={entry}
                server={server}
                clients={clients}
                onToggle={onToggle}
                onSelect={onSelectServer}
                onRemove={onRemove}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Clients View ─────────────────────────────────────

const clStyles = {
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
  grid: {
    flex: 1, overflowY: 'auto', padding: 24,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 12, alignContent: 'start',
  },
  card: {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 12, padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: 12,
    transition: 'background 0.12s, border-color 0.12s',
  },
  cardTop: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  clientIcon: {
    width: 36, height: 36, borderRadius: 9,
    background: 'var(--color-surface-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  detected: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontFamily: 'var(--font-mono)',
  },
  path: {
    fontSize: 11, color: 'var(--color-ink-tertiary)',
    fontFamily: 'var(--font-mono)',
    overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  serverList: {
    display: 'flex', flexDirection: 'column', gap: 0,
  },
  serverRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 0',
    borderTop: '1px solid var(--color-hairline)',
    fontSize: 13,
  },
};

function ClientCard({ client, installed, onToggleClientServer, onSyncFrom, onViewConfig }) {
  const [hovered, setHovered] = React.useState(false);
  const clientServers = installed.filter(i => i.clientIds.includes(client.id) && i.enabled);

  return (
    <div
      style={{
        ...clStyles.card,
        borderColor: hovered ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={clStyles.cardTop}>
        <div style={clStyles.clientIcon}>
          <i data-lucide={client.icon} style={{ width: 18, height: 18, color: 'var(--color-ink-subtle)' }}></i>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--color-ink)',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.2px',
          }}>{client.name}</div>
          <div style={clStyles.path}>{client.configPath}</div>
        </div>
        <div style={{
          ...clStyles.detected,
          color: client.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: client.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
          }} />
          {client.detected ? 'Detected' : 'Not found'}
        </div>
      </div>

      {/* Servers for this client */}
      <div style={clStyles.serverList}>
        {clientServers.length > 0 ? clientServers.map(entry => {
          const srv = MCP_SERVERS.find(s => s.id === entry.serverId);
          if (!srv) return null;
          return (
            <div key={entry.serverId} style={clStyles.serverRow}>
              <i data-lucide={srv.icon} style={{ width: 13, height: 13, color: 'var(--color-ink-subtle)', flexShrink: 0 }}></i>
              <span style={{ flex: 1, color: 'var(--color-ink-muted)' }}>{srv.name}</span>
              <Toggle checked={true} onChange={() => onToggleClientServer(client.id, entry.serverId)} size="sm" />
            </div>
          );
        }) : (
          <div style={{
            ...clStyles.serverRow,
            color: 'var(--color-ink-tertiary)', fontSize: 12,
            fontStyle: 'italic', justifyContent: 'center', padding: '12px 0',
          }}>
            No servers configured
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
        <Btn variant="ghost" size="sm" onClick={() => onSyncFrom(client.id)}>
          <i data-lucide="refresh-cw" style={{ width: 12, height: 12 }}></i>
          Sync
        </Btn>
        <Btn variant="ghost" size="sm" onClick={() => onViewConfig(client)}>
          <i data-lucide="file-text" style={{ width: 12, height: 12 }}></i>
          View config
        </Btn>
      </div>
    </div>
  );
}

function ClientsView({ clients, installed, onToggleClientServer, onSyncFrom, onAddClient, onViewConfig }) {
  const detectedCount = clients.filter(c => c.detected).length;

  return (
    <div style={clStyles.root}>
      <div style={clStyles.header}>
        <span style={clStyles.title}>AI Clients</span>
        <span style={{ fontSize: 12, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {detectedCount} detected · {clients.length} configured
        </span>
        <Btn variant="secondary" size="sm" onClick={onAddClient}>
          <i data-lucide="plus" style={{ width: 13, height: 13 }}></i>
          Add client
        </Btn>
      </div>
      <div style={clStyles.grid}>
        {clients.map(cl => (
          <ClientCard
            key={cl.id}
            client={cl}
            installed={installed}
            onToggleClientServer={onToggleClientServer}
            onSyncFrom={onSyncFrom}
            onViewConfig={onViewConfig}
          />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { InstalledView, ClientsView });
