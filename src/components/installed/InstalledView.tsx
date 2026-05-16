import React from 'react';
import { useInstalledStore } from '../../stores/installedStore';
import { useClientStore } from '../../stores/clientStore';
import { InstalledRow } from './InstalledRow';
import { EmptyState } from '../ui/EmptyState';

export const InstalledView: React.FC = () => {
  const { servers, toggleServer, uninstallServer } = useInstalledStore();
  const { clients } = useClientStore();

  const total = servers.length;
  const enabled = servers.filter((s) => s.enabled).length;

  const getClientsForServer = (serverId: string) => {
    return clients.filter((c) => c.servers.includes(serverId));
  };

  if (total === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon="Package"
          title="No servers installed"
          subtitle="Explore the marketplace to find and install MCP servers."
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          padding: '24px 24px 16px',
          display: 'flex',
          alignItems: 'baseline',
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
          }}
        >
          Installed servers
        </h1>
        <span
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-tertiary)',
          }}
        >
          {enabled} enabled · {total} total
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {servers.map((server) => (
          <InstalledRow
            key={server.id}
            server={server}
            clients={getClientsForServer(server.id)}
            onToggle={toggleServer}
            onRemove={uninstallServer}
          />
        ))}
      </div>
    </div>
  );
};
