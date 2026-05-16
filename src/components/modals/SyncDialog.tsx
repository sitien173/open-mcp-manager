import React, { useState } from 'react';
import { RefreshCw, Check, Loader, Terminal, Code, MessageSquare, Monitor, Sparkles, SquareTerminal, LucideIcon } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { ModalShell } from '../ui/ModalShell';
import { Btn } from '../ui/Btn';
import { ClientInfo } from '../../types';

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
  sparkles: Sparkles,
  'square-terminal': SquareTerminal,
};

export const SyncDialog: React.FC<SyncDialogProps> = ({ sourceClient, clients, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  const targets = clients.filter((c) => c.id !== sourceClient.id);

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

  const handleSync = async () => {
    setSyncing(true);
    try {
      await invoke('sync_servers_between_clients', {
        sourceClientId: sourceClient.id,
        targetClientIds: selectedIds,
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
            disabled={selectedIds.length === 0 || syncing}
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
