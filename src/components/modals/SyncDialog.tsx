import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, Loader, Terminal, Code, MessageSquare, Monitor, Sparkle, Sparkles, SquareTerminal, Server as ServerIcon, LucideIcon } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { ModalShell } from '../ui/ModalShell';
import { Btn } from '../ui/Btn';
import { ClientInfo, McpServerConfig } from '../../types';

interface SyncDialogProps {
  sourceClient: ClientInfo;
  clients: ClientInfo[];
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  terminal: Terminal,
  code: Code,
  'message-square': MessageSquare,
  monitor: Monitor,
  sparkle: Sparkle,
  sparkles: Sparkles,
  'square-terminal': SquareTerminal,
};

export const SyncDialog: React.FC<SyncDialogProps> = ({ sourceClient, clients, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedServerNames, setSelectedServerNames] = useState<string[]>([]);
  const [sourceServers, setSourceServers] = useState<McpServerConfig[]>([]);
  const [syncing, setSyncing] = useState(false);

  const targets = clients.filter((c) => c.id !== sourceClient.id);

  useEffect(() => {
    invoke<McpServerConfig[]>('get_client_servers', { clientId: sourceClient.id })
      .then((servers) => {
        setSourceServers(servers);
        setSelectedServerNames(servers.map((s) => s.name));
      })
      .catch(() => setSourceServers([]));
  }, [sourceClient.id]);

  const toggleSelectAll = () => {
    if (selectedIds.length === targets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(targets.map((t) => t.id));
    }
  };

  const toggleClient = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleServer = (name: string) => {
    setSelectedServerNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleSelectAllServers = () => {
    if (selectedServerNames.length === sourceServers.length) {
      setSelectedServerNames([]);
    } else {
      setSelectedServerNames(sourceServers.map((s) => s.name));
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await invoke('sync_servers_between_clients', {
        sourceId: sourceClient.id,
        targetIds: selectedIds,
        serverNames: selectedServerNames.length === sourceServers.length ? null : selectedServerNames,
      });
      onClose();
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncing(false);
    }
  };

  return (
    <ModalShell
      title="Sync configuration"
      width={440}
      onClose={onClose}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose} disabled={syncing}>
            Cancel
          </Btn>
          <Btn
            variant="primary"
            onClick={handleSync}
            disabled={selectedIds.length === 0 || selectedServerNames.length === 0 || syncing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {syncing ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {syncing ? 'Syncing...' : `Sync to ${selectedIds.length} clients`}
          </Btn>
        </>
      }
    >
      <div style={{ marginBottom: '20px', fontSize: '13px', lineHeight: 1.5, color: 'var(--color-ink-muted)' }}>
        Copy the MCP server configuration from <strong>{sourceClient.name}</strong> to the selected target clients.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink-subtle)' }}>Servers to sync</span>
        <Btn variant="ghost" size="sm" onClick={toggleSelectAllServers}>
          {selectedServerNames.length === sourceServers.length ? 'Deselect all' : 'Select all'}
        </Btn>
      </div>

      {sourceServers.length > 0 ? (
        <div
          style={{
            maxHeight: '160px',
            overflowY: 'auto',
            border: '1px solid var(--color-hairline)',
            borderRadius: '8px',
            backgroundColor: 'var(--color-surface-1)',
            marginBottom: '20px',
          }}
        >
          {sourceServers.map((server) => {
            const isSelected = selectedServerNames.includes(server.name);
            return (
              <div
                key={server.name}
                onClick={() => toggleServer(server.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--color-hairline)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: isSelected ? 'none' : '1px solid var(--color-hairline-strong)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Check size={12} color="#fff" />}
                </div>
                <ServerIcon size={13} color="var(--color-ink-tertiary)" />
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--color-ink-muted)' }}>
                  {server.name}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '12px 0', marginBottom: '20px' }}>
          No servers found in source client
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink-subtle)' }}>Target clients</span>
        <Btn variant="ghost" size="sm" onClick={toggleSelectAll}>
          {selectedIds.length === targets.length ? 'Deselect all' : 'Select all'}
        </Btn>
      </div>

      <div
        style={{
          maxHeight: '240px',
          overflowY: 'auto',
          border: '1px solid var(--color-hairline)',
          borderRadius: '8px',
          backgroundColor: 'var(--color-surface-1)',
        }}
      >
        {targets.map((client) => {
          const isSelected = selectedIds.includes(client.id);
          const Icon = iconMap[client.icon] || Terminal;

          return (
            <div
              key={client.id}
              onClick={() => toggleClient(client.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderBottom: '1px solid var(--color-hairline)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: isSelected ? 'none' : '1px solid var(--color-hairline-strong)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && <Check size={12} color="#fff" />}
              </div>

              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-surface-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-ink-subtle)',
                }}
              >
                <Icon size={14} />
              </div>

              <div style={{ flex: 1, fontSize: '13px', color: 'var(--color-ink-muted)' }}>
                {client.name}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: client.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
                }}
              >
                {client.detected ? 'Ready' : 'N/A'}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ModalShell>
  );
};
