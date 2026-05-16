import React, { useState, useMemo } from 'react';
import { RegistryEntry } from '../../types';
import { Badge } from '../ui/Badge';
import { Btn } from '../ui/Btn';
import { CATEGORIES } from '../../stores/registryStore';
import { useClientStore } from '../../stores/clientStore';
import { useInstalledStore } from '../../stores/installedStore';
import * as LucideIcons from 'lucide-react';
import { X, Check, Trash2, RefreshCw, Loader2, ArrowDownToLine } from 'lucide-react';

interface DetailPanelProps {
  server: RegistryEntry;
  onClose: () => void;
}

const dtStyles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'relative' as const,
    width: 480,
    maxWidth: '85%',
    height: '100%',
    background: 'var(--color-surface-1)',
    borderLeft: '1px solid var(--color-hairline)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    zIndex: 1,
    animation: 'slideIn 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-hairline)',
    flexShrink: 0,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'transparent',
    border: 'none',
    color: 'var(--color-ink-subtle)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, overflowY: 'auto' as const, padding: '20px' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    background: 'var(--color-surface-3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-ink-subtle)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
    marginBottom: 10,
    fontFamily: 'var(--font-display)',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 0',
    fontSize: 13,
    borderBottom: '1px solid var(--color-hairline)',
  },
  metaLabel: {
    color: 'var(--color-ink-tertiary)',
    fontWeight: 500,
  },
  metaValue: {
    color: 'var(--color-ink-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
  },
  configBlock: {
    background: 'var(--color-canvas)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 8,
    padding: '12px 14px',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    lineHeight: 1.6,
    color: 'var(--color-ink-muted)',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    maxHeight: 200,
    overflowY: 'auto' as const,
  },
  clientCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid var(--color-hairline)',
    fontSize: 13,
    cursor: 'pointer',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: '1.5px solid var(--color-hairline-strong)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.12s, border-color 0.12s',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--color-hairline)',
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
};

export const DetailPanel: React.FC<DetailPanelProps> = ({ server, onClose }) => {
  const { clients } = useClientStore();
  const { servers: installedServers, installServer, uninstallServer } = useInstalledStore();
  
  const installedEntry = useMemo(() => 
    installedServers.find(s => s.name.toLowerCase() === server.name.toLowerCase()),
    [installedServers, server.name]
  );
  
  const isInstalled = !!installedEntry;

  const [selectedClients, setSelectedClients] = useState<Set<string>>(() => {
    // If installed, we don't have per-client state in the canonical model easily yet
    // Default: select detected clients for new installs
    return new Set(clients.filter(c => c.detected).map(c => c.id));
  });

  const [busy, setBusy] = useState(false);

  const toggleClient = (cid: string) => {
    setSelectedClients(prev => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid); else next.add(cid);
      return next;
    });
  };

  const handleInstall = async () => {
    setBusy(true);
    try {
      await installServer(server.name, Array.from(selectedClients));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleUninstall = async () => {
    if (!installedEntry) return;
    setBusy(true);
    try {
      await uninstallServer(installedEntry.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const catLabel = CATEGORIES.find(c => c.id === server.category)?.label || server.category;
  
  // Mock config JSON for display (based on prototype)
  const configJson = {
    command: server.install.command,
    args: server.install.args,
    env: server.install.requiredEnv.reduce((acc, req) => ({ ...acc, [req.key]: `<your-${req.key.toLowerCase()}>` }), {})
  };

  const IconComponent = (LucideIcons as any)[server.icon || 'Package'] || LucideIcons.Package;

  return (
    <div style={dtStyles.overlay}>
      <div style={dtStyles.backdrop} onClick={onClose}></div>
      <div style={dtStyles.panel}>
        <div style={dtStyles.header}>
          <button style={dtStyles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
          <div style={dtStyles.icon}>
            <IconComponent size={22} color="var(--color-ink-subtle)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {server.name}
              </span>
              {server.isDxt && <Badge color="#828fff" bg="#5e6ad220">DXT</Badge>}
              {isInstalled && <Badge color="var(--color-semantic-success)" bg="#27a64418">Installed</Badge>}
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--color-ink-tertiary)',
              fontFamily: 'var(--font-mono)',
              marginTop: 2,
            }}>
              {server.author} · v{server.version}
            </div>
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
              <span style={{ color: 'var(--color-ink-tertiary)' }}>{'{'}{'\n'}</span>
              <span style={{ color: 'var(--color-ink-subtle)' }}>  "{server.name.toLowerCase()}"</span>
              <span style={{ color: 'var(--color-ink-tertiary)' }}>: </span>
              {JSON.stringify(configJson, null, 2).split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && '  '}
                  {line.includes(':') ? (
                    <>
                      <span style={{ color: '#828fff' }}>{line.split(':')[0]}</span>
                      :
                      <span style={{ color: line.includes('"') ? '#27ae60' : '#f2c94c' }}>
                        {line.split(':').slice(1).join(':')}
                      </span>
                    </>
                  ) : line}
                  {i < JSON.stringify(configJson, null, 2).split('\n').length - 1 && '\n'}
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
              const ClientIcon = (LucideIcons as any)[cl.icon] || LucideIcons.Monitor;
              return (
                <div key={cl.id} style={dtStyles.clientCheck} onClick={() => toggleClient(cl.id)}>
                  <div
                    style={{
                      ...dtStyles.checkbox,
                      background: checked ? 'var(--color-primary)' : 'transparent',
                      borderColor: checked ? 'var(--color-primary)' : 'var(--color-hairline-strong)',
                    }}
                  >
                    {checked && (
                      <Check size={11} color="#fff" />
                    )}
                  </div>
                  <ClientIcon size={14} color="var(--color-ink-subtle)" style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--color-ink-muted)' }}>{cl.name}</span>
                  <div style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: cl.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
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
            <Btn variant="danger" onClick={handleUninstall} disabled={busy}>
              <Trash2 size={13} />
              Uninstall
            </Btn>
          )}
          <div style={{ flex: 1 }}></div>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn
            variant="primary"
            onClick={handleInstall}
            disabled={selectedClients.size === 0 || busy}
          >
            {busy ? (
              <>
                <Loader2 size={13} className="animate-spin" /> 
                {isInstalled ? 'Updating...' : 'Installing...'}
              </>
            ) : isInstalled ? (
              <>
                <RefreshCw size={13} /> 
                Update clients
              </>
            ) : (
              <>
                <ArrowDownToLine size={13} /> 
                Install to {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''}
              </>
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
};
