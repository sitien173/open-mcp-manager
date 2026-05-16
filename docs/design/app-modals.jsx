/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Modals (Add Client, Config Viewer,
   Sync Dialog, Command Palette)
   ═══════════════════════════════════════════════════════ */

// ── Shared Modal Shell ───────────────────────────────

const modalShellStyles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 60,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.55)',
  },
  box: {
    position: 'relative', zIndex: 1,
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 14,
    display: 'flex', flexDirection: 'column',
    maxHeight: '80vh',
    animation: 'modalIn 0.18s ease',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-hairline)',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 14, fontWeight: 600, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.2px',
    flex: 1,
  },
  closeBtn: {
    width: 26, height: 26, borderRadius: 6,
    background: 'transparent', border: 'none',
    color: 'var(--color-ink-subtle)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: {
    flex: 1, overflowY: 'auto', padding: '16px 18px',
  },
  footer: {
    padding: '12px 18px',
    borderTop: '1px solid var(--color-hairline)',
    display: 'flex', gap: 8, justifyContent: 'flex-end',
    flexShrink: 0,
  },
};

function ModalShell({ title, width = 480, onClose, footer, children }) {
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={modalShellStyles.overlay}>
      <div style={modalShellStyles.backdrop} onClick={onClose}></div>
      <div style={{ ...modalShellStyles.box, width }}>
        <div style={modalShellStyles.header}>
          <span style={modalShellStyles.headerTitle}>{title}</span>
          <button style={modalShellStyles.closeBtn} onClick={onClose}>
            <i data-lucide="x" style={{ width: 15, height: 15 }}></i>
          </button>
        </div>
        <div style={modalShellStyles.body}>{children}</div>
        {footer && <div style={modalShellStyles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

// ── Form field helper ────────────────────────────────
const fieldStyle = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--color-ink-subtle)' },
  input: {
    background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
    borderRadius: 7, padding: '8px 11px', color: 'var(--color-ink)',
    fontSize: 13, fontFamily: 'var(--font-text)', outline: 'none',
    transition: 'border-color 0.12s',
  },
  hint: { fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 2 },
};

function Field({ label, hint, children }) {
  return (
    <div style={fieldStyle.wrapper}>
      <label style={fieldStyle.label}>{label}</label>
      {children}
      {hint && <span style={fieldStyle.hint}>{hint}</span>}
    </div>
  );
}

// ── Add Client Modal ─────────────────────────────────

function AddClientModal({ onClose, onAdd }) {
  const [name, setName] = React.useState('');
  const [configPath, setConfigPath] = React.useState('');
  const [icon, setIcon] = React.useState('terminal');

  const iconOptions = [
    { value: 'terminal', label: 'Terminal' },
    { value: 'code', label: 'Code' },
    { value: 'message-square', label: 'Chat' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'sparkles', label: 'AI' },
    { value: 'square-terminal', label: 'Console' },
  ];

  const handleSubmit = () => {
    if (!name.trim() || !configPath.trim()) return;
    onAdd({
      id: 'custom-' + Date.now(),
      name: name.trim(),
      icon,
      configPath: configPath.trim(),
      detected: false,
      servers: [],
    });
    onClose();
  };

  return (
    <ModalShell
      title="Add custom client"
      width={440}
      onClose={onClose}
      footer={<>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit} disabled={!name.trim() || !configPath.trim()}>
          <i data-lucide="plus" style={{ width: 13, height: 13 }}></i> Add client
        </Btn>
      </>}
    >
      <Field label="Client name" hint="A display name for this AI client">
        <input
          style={fieldStyle.input}
          value={name} onChange={e => setName(e.target.value)}
          placeholder="My Custom Client"
          autoFocus
        />
      </Field>
      <Field label="Config file path" hint="Absolute path to the client's MCP config JSON file">
        <input
          style={{ ...fieldStyle.input, fontFamily: 'var(--font-mono)', fontSize: 12 }}
          value={configPath} onChange={e => setConfigPath(e.target.value)}
          placeholder="C:\Users\me\.myapp\mcp_config.json"
        />
      </Field>
      <Field label="Icon">
        <div style={{ display: 'flex', gap: 6 }}>
          {iconOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => setIcon(opt.value)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: icon === opt.value ? 'var(--color-primary)' : 'var(--color-surface-2)',
                border: `1px solid ${icon === opt.value ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.12s',
              }}
              title={opt.label}
            >
              <i data-lucide={opt.value} style={{
                width: 16, height: 16,
                color: icon === opt.value ? '#fff' : 'var(--color-ink-subtle)',
              }}></i>
            </div>
          ))}
        </div>
      </Field>
    </ModalShell>
  );
}

// ── Config Viewer Modal ──────────────────────────────

function ConfigViewerModal({ client, installed, onClose }) {
  const clientServers = installed.filter(i => i.clientIds.includes(client.id) && i.enabled);

  const configObj = { mcpServers: {} };
  clientServers.forEach(entry => {
    const srv = MCP_SERVERS.find(s => s.id === entry.serverId);
    if (srv) {
      configObj.mcpServers[srv.id] = { ...srv.config };
    }
  });

  const jsonStr = JSON.stringify(configObj, null, 2);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax-highlight the JSON
  const highlighted = jsonStr
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/"([^"]+)"(?=\s*:)/g, '<span style="color:#828fff">"$1"</span>')
    .replace(/: "([^"]+)"/g, ': <span style="color:#27ae60">"$1"</span>')
    .replace(/: (\d+)/g, ': <span style="color:#f2c94c">$1</span>');

  return (
    <ModalShell
      title={`${client.name} — config`}
      width={560}
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" size="sm" onClick={handleCopy}>
          <i data-lucide={copied ? "check" : "copy"} style={{ width: 13, height: 13 }}></i>
          {copied ? 'Copied' : 'Copy'}
        </Btn>
        <div style={{ flex: 1 }}></div>
        <Btn variant="secondary" onClick={onClose}>Close</Btn>
      </>}
    >
      <div style={{
        fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <i data-lucide="file-text" style={{ width: 13, height: 13 }}></i>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{client.configPath}</span>
      </div>
      <pre
        style={{
          background: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 8, padding: '14px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12, lineHeight: 1.65,
          color: 'var(--color-ink-muted)',
          overflowX: 'auto', whiteSpace: 'pre',
          maxHeight: 380,
        }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      {clientServers.length === 0 && (
        <div style={{
          fontSize: 12, color: 'var(--color-ink-tertiary)', marginTop: 10,
          fontStyle: 'italic', textAlign: 'center',
        }}>No servers configured for this client</div>
      )}
    </ModalShell>
  );
}

// ── Sync Dialog ──────────────────────────────────────

function SyncDialog({ sourceClient, clients, onClose, onSync }) {
  const [targets, setTargets] = React.useState(new Set());
  const [syncing, setSyncing] = React.useState(false);

  const otherClients = clients.filter(c => c.id !== sourceClient.id);

  const toggleTarget = (cid) => {
    setTargets(prev => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid); else next.add(cid);
      return next;
    });
  };

  const selectAll = () => {
    if (targets.size === otherClients.length) {
      setTargets(new Set());
    } else {
      setTargets(new Set(otherClients.map(c => c.id)));
    }
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      onSync(sourceClient.id, Array.from(targets));
      setSyncing(false);
      onClose();
    }, 800);
  };

  return (
    <ModalShell
      title="Sync configuration"
      width={440}
      onClose={onClose}
      footer={<>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSync} disabled={targets.size === 0 || syncing}>
          {syncing ? (
            <><i data-lucide="loader" style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }}></i> Syncing...</>
          ) : (
            <><i data-lucide="refresh-cw" style={{ width: 13, height: 13 }}></i> Sync to {targets.size} client{targets.size !== 1 ? 's' : ''}</>
          )}
        </Btn>
      </>}
    >
      <div style={{
        fontSize: 13, color: 'var(--color-ink-subtle)', lineHeight: 1.5, marginBottom: 14,
      }}>
        Copy the MCP server configuration from <strong style={{ color: 'var(--color-ink)' }}>{sourceClient.name}</strong> to the selected target clients.
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-subtle)' }}>Target clients</span>
        <Btn variant="ghost" size="sm" onClick={selectAll}>
          {targets.size === otherClients.length ? 'Deselect all' : 'Select all'}
        </Btn>
      </div>

      {otherClients.map(cl => {
        const checked = targets.has(cl.id);
        return (
          <div
            key={cl.id}
            onClick={() => toggleTarget(cl.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0',
              borderBottom: '1px solid var(--color-hairline)',
              cursor: 'pointer', fontSize: 13,
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--color-hairline-strong)'}`,
              background: checked ? 'var(--color-primary)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s', flexShrink: 0,
            }}>
              {checked && <i data-lucide="check" style={{ width: 11, height: 11, color: '#fff' }}></i>}
            </div>
            <i data-lucide={cl.icon} style={{ width: 14, height: 14, color: 'var(--color-ink-subtle)', flexShrink: 0 }}></i>
            <span style={{ flex: 1, color: 'var(--color-ink-muted)' }}>{cl.name}</span>
            <div style={{
              fontSize: 11, fontFamily: 'var(--font-mono)',
              color: cl.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
            }}>
              {cl.detected ? 'Ready' : 'N/A'}
            </div>
          </div>
        );
      })}
    </ModalShell>
  );
}

// ── Command Palette ──────────────────────────────────

function CommandPalette({ onClose, onNavigate, onSelectServer, installed }) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = React.useMemo(() => {
    const items = [
      { type: 'nav', id: 'marketplace', label: 'Go to Marketplace', icon: 'package', section: 'Navigation' },
      { type: 'nav', id: 'installed', label: 'Go to Installed', icon: 'check-circle-2', section: 'Navigation' },
      { type: 'nav', id: 'clients', label: 'Go to Clients', icon: 'monitor', section: 'Navigation' },
      { type: 'nav', id: 'profiles', label: 'Go to Profiles', icon: 'layers', section: 'Navigation' },
      { type: 'nav', id: 'cloud-sync', label: 'Go to Cloud Sync', icon: 'cloud', section: 'Navigation' },
      { type: 'nav', id: 'settings', label: 'Go to Settings', icon: 'settings', section: 'Navigation' },
    ];
    MCP_SERVERS.forEach(s => {
      const isInst = installed.some(i => i.serverId === s.id);
      items.push({
        type: 'server', id: s.id, label: s.name,
        icon: s.icon, section: 'Servers',
        subtitle: `${s.author} · v${s.version}${isInst ? ' · Installed' : ''}`,
        server: s,
      });
    });
    return items;
  }, [installed]);

  const filtered = React.useMemo(() => {
    if (!query) return commands.slice(0, 12);
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) || (c.subtitle || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query, commands]);

  React.useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && filtered[selectedIndex]) { executeCommand(filtered[selectedIndex]); }
    else if (e.key === 'Escape') { onClose(); }
  };

  const executeCommand = (cmd) => {
    if (cmd.type === 'nav') { onNavigate(cmd.id); }
    else if (cmd.type === 'server') { onSelectServer(cmd.server); }
    onClose();
  };

  // Group filtered by section
  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.section]) grouped[item.section] = [];
    grouped[item.section].push(item);
  });

  let flatIdx = -1;

  return (
    <div style={modalShellStyles.overlay} onClick={onClose}>
      <div style={modalShellStyles.backdrop}></div>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...modalShellStyles.box,
          width: 520, maxHeight: 420,
          marginTop: -80,
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-hairline)',
        }}>
          <i data-lucide="search" style={{ width: 16, height: 16, color: 'var(--color-ink-tertiary)', flexShrink: 0 }}></i>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, servers..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--color-ink)', fontSize: 14,
              fontFamily: 'var(--font-text)',
            }}
          />
          <span style={{
            fontSize: 10, color: 'var(--color-ink-tertiary)',
            padding: '2px 5px', borderRadius: 4,
            background: 'var(--color-surface-3)',
            fontFamily: 'var(--font-mono)',
          }}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <div style={{
                fontSize: 10.5, fontWeight: 500, color: 'var(--color-ink-tertiary)',
                padding: '8px 16px 4px', letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>{section}</div>
              {items.map(item => {
                flatIdx++;
                const idx = flatIdx;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.type + item.id}
                    onClick={() => executeCommand(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 16px', margin: '0 6px',
                      borderRadius: 7, cursor: 'pointer',
                      background: isSelected ? 'var(--color-surface-2)' : 'transparent',
                      transition: 'background 0.08s',
                    }}
                  >
                    <i data-lucide={item.icon} style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)', flexShrink: 0 }}></i>
                    <span style={{
                      flex: 1, fontSize: 13, color: 'var(--color-ink)',
                      fontWeight: item.type === 'nav' ? 500 : 400,
                    }}>{item.label}</span>
                    {item.subtitle && (
                      <span style={{
                        fontSize: 11, color: 'var(--color-ink-tertiary)',
                        fontFamily: 'var(--font-mono)',
                      }}>{item.subtitle}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{
              padding: '24px 16px', textAlign: 'center',
              fontSize: 13, color: 'var(--color-ink-tertiary)',
            }}>No results</div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ModalShell, AddClientModal, ConfigViewerModal, SyncDialog, CommandPalette });
