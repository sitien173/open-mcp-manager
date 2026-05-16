/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Server Detail Panel
   ═══════════════════════════════════════════════════════ */

const dtStyles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'relative', width: 480, maxWidth: '85%',
    height: '100%', background: 'var(--color-surface-1)',
    borderLeft: '1px solid var(--color-hairline)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', zIndex: 1,
    animation: 'slideIn 0.2s ease',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-hairline)',
    flexShrink: 0,
  },
  closeBtn: {
    width: 28, height: 28, borderRadius: 6,
    background: 'transparent', border: 'none',
    color: 'var(--color-ink-subtle)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, overflowY: 'auto', padding: '20px' },
  icon: {
    width: 44, height: 44, borderRadius: 11,
    background: 'var(--color-surface-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: 600, color: 'var(--color-ink-subtle)',
    textTransform: 'uppercase', letterSpacing: '0.3px',
    marginBottom: 10, fontFamily: 'var(--font-display)',
  },
  metaRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '7px 0', fontSize: 13,
    borderBottom: '1px solid var(--color-hairline)',
  },
  metaLabel: {
    color: 'var(--color-ink-tertiary)', fontWeight: 500,
  },
  metaValue: {
    color: 'var(--color-ink-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 12,
  },
  configBlock: {
    background: 'var(--color-canvas)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 8, padding: '12px 14px',
    fontFamily: 'var(--font-mono)',
    fontSize: 12, lineHeight: 1.6,
    color: 'var(--color-ink-muted)',
    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    maxHeight: 200, overflowY: 'auto',
  },
  clientCheck: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid var(--color-hairline)',
    fontSize: 13,
  },
  checkbox: {
    width: 16, height: 16, borderRadius: 4,
    border: '1.5px solid var(--color-hairline-strong)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    transition: 'background 0.12s, border-color 0.12s',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--color-hairline)',
    display: 'flex', gap: 8, justifyContent: 'flex-end',
    flexShrink: 0,
  },
};

function DetailPanel({ server, isInstalled, installedEntry, clients, onClose, onInstall, onUninstall }) {
  const [selectedClients, setSelectedClients] = React.useState(() => {
    if (installedEntry) return new Set(installedEntry.clientIds);
    // Default: select detected clients
    return new Set(clients.filter(c => c.detected).map(c => c.id));
  });
  const [installing, setInstalling] = React.useState(false);

  const toggleClient = (cid) => {
    setSelectedClients(prev => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid); else next.add(cid);
      return next;
    });
  };

  const handleInstall = () => {
    setInstalling(true);
    setTimeout(() => {
      onInstall(server.id, Array.from(selectedClients));
      setInstalling(false);
    }, 600);
  };

  const catLabel = CATEGORIES.find(c => c.id === server.category)?.label || server.category;
  const configJson = JSON.stringify(server.config, null, 2);

  return (
    <div style={dtStyles.overlay}>
      <div style={dtStyles.backdrop} onClick={onClose}></div>
      <div style={dtStyles.panel}>
        <div style={dtStyles.header}>
          <button style={dtStyles.closeBtn} onClick={onClose}>
            <i data-lucide="x" style={{ width: 16, height: 16 }}></i>
          </button>
          <div style={dtStyles.icon}>
            <i data-lucide={server.icon} style={{ width: 22, height: 22, color: 'var(--color-ink-subtle)' }}></i>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 17, fontWeight: 600, color: 'var(--color-ink)',
              fontFamily: 'var(--font-display)', letterSpacing: '-0.3px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {server.name}
              {server.isDxt && <Badge color="#828fff" bg="#5e6ad220">DXT</Badge>}
              {isInstalled && <Badge color="var(--color-semantic-success)" bg="#27a64418">Installed</Badge>}
            </div>
            <div style={{
              fontSize: 12, color: 'var(--color-ink-tertiary)',
              fontFamily: 'var(--font-mono)', marginTop: 2,
            }}>{server.author} · v{server.version}</div>
          </div>
        </div>

        <div style={dtStyles.body}>
          {/* Description */}
          <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.55 }}>
            {server.description}
          </div>

          {/* Metadata */}
          <div style={dtStyles.section}>
            <div style={dtStyles.sectionTitle}>Details</div>
            <div style={dtStyles.metaRow}>
              <span style={dtStyles.metaLabel}>Category</span>
              <Badge>{catLabel}</Badge>
            </div>
            <div style={dtStyles.metaRow}>
              <span style={dtStyles.metaLabel}>Transport</span>
              <span style={dtStyles.metaValue}>{server.transport}</span>
            </div>
            <div style={dtStyles.metaRow}>
              <span style={dtStyles.metaLabel}>Downloads</span>
              <span style={dtStyles.metaValue}>{server.downloads.toLocaleString()}</span>
            </div>
            <div style={dtStyles.metaRow}>
              <span style={dtStyles.metaLabel}>Version</span>
              <span style={dtStyles.metaValue}>{server.version}</span>
            </div>
          </div>

          {/* Config preview */}
          <div style={dtStyles.section}>
            <div style={dtStyles.sectionTitle}>Configuration</div>
            <div style={dtStyles.configBlock}>
              <span style={{ color: 'var(--color-ink-tertiary)' }}>{'{\n'}</span>
              <span style={{ color: 'var(--color-ink-subtle)' }}>  "{server.name.toLowerCase()}"</span>
              <span style={{ color: 'var(--color-ink-tertiary)' }}>: </span>
              {configJson.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && '  '}{line.includes(':') ? (
                    <><span style={{ color: '#828fff' }}>{line.split(':')[0]}</span>:{line.split(':').slice(1).join(':')}</>
                  ) : line}
                  {i < configJson.split('\n').length - 1 && '\n'}
                </span>
              ))}
              {'\n'}
              <span style={{ color: 'var(--color-ink-tertiary)' }}>{'}'}</span>
            </div>
          </div>

          {/* Client selection for install */}
          <div style={dtStyles.section}>
            <div style={dtStyles.sectionTitle}>
              {isInstalled ? 'Configured clients' : 'Install to clients'}
            </div>
            {clients.map(cl => {
              const checked = selectedClients.has(cl.id);
              return (
                <div key={cl.id} style={dtStyles.clientCheck}>
                  <div
                    style={{
                      ...dtStyles.checkbox,
                      background: checked ? 'var(--color-primary)' : 'transparent',
                      borderColor: checked ? 'var(--color-primary)' : 'var(--color-hairline-strong)',
                    }}
                    onClick={() => toggleClient(cl.id)}
                  >
                    {checked && (
                      <i data-lucide="check" style={{ width: 11, height: 11, color: '#fff' }}></i>
                    )}
                  </div>
                  <i data-lucide={cl.icon} style={{ width: 14, height: 14, color: 'var(--color-ink-subtle)', flexShrink: 0 }}></i>
                  <span style={{ flex: 1, color: 'var(--color-ink-muted)' }}>{cl.name}</span>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    color: cl.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: cl.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
                    }} />
                    {cl.detected ? 'Ready' : 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={dtStyles.footer}>
          {isInstalled && (
            <Btn variant="danger" onClick={() => { onUninstall(server.id); onClose(); }}>
              <i data-lucide="trash-2" style={{ width: 13, height: 13 }}></i>
              Uninstall
            </Btn>
          )}
          <div style={{ flex: 1 }}></div>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn
            variant="primary"
            onClick={handleInstall}
            disabled={selectedClients.size === 0 || installing}
          >
            {installing ? (
              <><i data-lucide="loader" style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }}></i> Installing...</>
            ) : isInstalled ? (
              <><i data-lucide="refresh-cw" style={{ width: 13, height: 13 }}></i> Update clients</>
            ) : (
              <><i data-lucide="arrow-down-to-line" style={{ width: 13, height: 13 }}></i> Install to {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''}</>
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailPanel });
