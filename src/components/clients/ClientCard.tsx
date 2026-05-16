import React from 'react';
import { Terminal, Code, MessageSquare, Monitor, Sparkles, SquareTerminal, RefreshCw, FileText, LucideIcon, Server as ServerIcon } from 'lucide-react';
import { ClientInfo, McpServerConfig } from '../../types';
import { Btn } from '../ui/Btn';
import { Toggle } from '../ui/Toggle';

interface ClientCardProps {
  client: ClientInfo;
  allServers: McpServerConfig[];
  onToggleServer: (serverId: string, enabled: boolean) => void;
  onSyncFrom: (client: ClientInfo) => void;
  onViewConfig: (client: ClientInfo) => void;
}

const iconMap: Record<string, LucideIcon> = {
  terminal: Terminal,
  code: Code,
  'message-square': MessageSquare,
  monitor: Monitor,
  sparkles: Sparkles,
  'square-terminal': SquareTerminal,
};

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  allServers,
  onToggleServer,
  onSyncFrom,
  onViewConfig,
}) => {
  const Icon = iconMap[client.icon] || Terminal;
  const configuredServers = allServers.filter((s) => client.servers.includes(s.id));

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderRadius: '12px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
      }}
      className="client-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--color-surface-3)',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-ink-subtle)',
          }}
        >
          <Icon size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {client.name}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-ink-tertiary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={client.activePath || ''}
          >
            {client.activePath || 'No config path'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: client.detected ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
            }}
          />
          <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', fontWeight: 500 }}>
            {client.detected ? 'Detected' : 'Not found'}
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingTop: '4px',
        }}
      >
        {configuredServers.length > 0 ? (
          configuredServers.map((server) => (
            <div
              key={server.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--color-hairline)',
              }}
            >
              <ServerIcon size={13} color="var(--color-ink-tertiary)" />
              <span
                style={{
                  flex: 1,
                  fontSize: '12px',
                  color: 'var(--color-ink-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {server.name}
              </span>
              <Toggle
                checked={server.enabled}
                onChange={(checked) => onToggleServer(server.id, checked)}
                size="sm"
              />
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-ink-tertiary)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '8px 0',
              borderTop: '1px solid var(--color-hairline)',
            }}
          >
            No servers configured
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Btn variant="ghost" size="sm" onClick={() => onSyncFrom(client)} style={{ flex: 1 }}>
          <RefreshCw size={14} style={{ marginRight: '6px' }} />
          Sync
        </Btn>
        <Btn variant="ghost" size="sm" onClick={() => onViewConfig(client)} style={{ flex: 1 }}>
          <FileText size={14} style={{ marginRight: '6px' }} />
          View config
        </Btn>
      </div>

      <style>{`
        .client-card:hover {
          background-color: var(--color-surface-2) !important;
          border-color: var(--color-hairline-strong) !important;
        }
      `}</style>
    </div>
  );
};
