import React from 'react';
import { Settings, Trash2, Server } from 'lucide-react';
import { McpServerConfig, ClientInfo } from '../../types';
import { Toggle } from '../ui/Toggle';
import { Btn } from '../ui/Btn';

interface InstalledRowProps {
  server: McpServerConfig;
  clients: ClientInfo[];
  onToggle: (id: string, enabled: boolean) => void;
  onSelect?: (server: McpServerConfig) => void;
  onRemove: (id: string) => void;
}

export const InstalledRow: React.FC<InstalledRowProps> = ({
  server,
  clients,
  onToggle,
  onSelect,
  onRemove,
}) => {
  const isEnabled = server.enabled;

  return (
    <div
      onClick={() => onSelect?.(server)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 24px',
        borderBottom: '1px solid var(--color-hairline)',
        cursor: 'pointer',
        opacity: isEnabled ? 1 : 0.5,
        transition: 'opacity 0.2s ease',
        position: 'relative',
        backgroundColor: 'transparent',
      }}
      className="installed-row-hover"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Toggle
          checked={isEnabled}
          onChange={(checked) => onToggle(server.id, checked)}
          size="sm"
        />
      </div>

      <div
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--color-surface-2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Server size={18} color="var(--color-ink-subtle)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {server.name}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-tertiary)',
            marginTop: '1px',
          }}
        >
          v{server.version || '0.0.0'} · {server.transport}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {clients.slice(0, 4).map((client) => (
          <div
            key={client.id}
            title={client.name}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 600,
              color: 'var(--color-ink-muted)',
              textTransform: 'uppercase',
            }}
          >
            {client.name.substring(0, 2)}
          </div>
        ))}
        {clients.length > 4 && (
          <div
            style={{
              fontSize: '9px',
              fontWeight: 600,
              color: 'var(--color-ink-tertiary)',
              marginLeft: '2px',
            }}
          >
            +{clients.length - 4}
          </div>
        )}
      </div>

      <div
        className="row-actions"
        style={{
          display: 'flex',
          gap: '4px',
          marginLeft: '8px',
          opacity: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Btn variant="ghost" size="sm" onClick={() => onSelect?.(server)}>
          <Settings size={14} />
        </Btn>
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => onRemove(server.id)}
          style={{ color: '#eb5757' }}
        >
          <Trash2 size={14} />
        </Btn>
      </div>

      <style>{`
        .installed-row-hover:hover {
          background-color: var(--color-surface-1) !important;
        }
        .installed-row-hover:hover .row-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
