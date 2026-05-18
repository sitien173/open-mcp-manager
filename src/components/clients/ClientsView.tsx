import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useClientStore } from '../../stores/clientStore';
import { invoke } from '@tauri-apps/api/core';
import { ClientCard } from './ClientCard';
import { Btn } from '../ui/Btn';
import { AddClientModal } from '../modals/AddClientModal';
import { SyncDialog } from '../modals/SyncDialog';
import { ConfigViewerModal } from '../modals/ConfigViewerModal';
import { ClientInfo } from '../../types';

export const ClientsView: React.FC = () => {
  const { clients } = useClientStore();
  const handleToggleServer = async (clientId: string, serverName: string, enabled: boolean) => {
    try {
      await invoke('toggle_server', { serverName, enabled, clientIds: [clientId] });
    } catch (err) {
      console.error('Failed to toggle server:', err);
    }
  };

  const [addClientOpen, setAddClientOpen] = useState(false);
  const [syncSource, setSyncSource] = useState<ClientInfo | null>(null);
  const [configViewClient, setConfigViewClient] = useState<ClientInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const detected = clients.filter((c) => c.detected).length;
  const total = clients.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          padding: '24px 24px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-ink)',
            margin: 0,
            flex: 1,
          }}
        >
          AI Clients
        </h1>
        <span
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-tertiary)',
          }}
        >
          {detected} detected · {total} configured
        </span>
        <Btn
          variant="secondary"
          size="sm"
          onClick={() => setAddClientOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          Add client
        </Btn>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '12px',
          alignContent: 'start',
        }}
      >
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            refreshKey={refreshKey}
            onToggleServer={handleToggleServer}
            onSyncFrom={setSyncSource}
            onViewConfig={setConfigViewClient}
          />
        ))}
      </div>

      {addClientOpen && (
        <AddClientModal onClose={() => setAddClientOpen(false)} />
      )}

      {syncSource && (
        <SyncDialog
          sourceClient={syncSource}
          clients={clients}
          onClose={() => { setSyncSource(null); setRefreshKey(k => k + 1); }}
        />
      )}

      {configViewClient && (
        <ConfigViewerModal
          client={configViewClient}
          onClose={() => setConfigViewClient(null)}
        />
      )}
    </div>
  );
};
