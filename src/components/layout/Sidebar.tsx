import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Badge } from '../ui/Badge';

export type ViewID = 'marketplace' | 'installed' | 'clients' | 'cloud-sync' | 'profiles' | 'settings';

interface SbItemProps {
  icon: keyof typeof LucideIcons;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  badge?: { text: string; color: string; bg: string };
}

const SbItem: React.FC<SbItemProps> = ({ icon, label, count, active, onClick, badge }) => {
  const [hovered, setHovered] = useState(false);
  const IconComponent = LucideIcons[icon] as React.ElementType;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '6px 12px',
        margin: '1px 8px',
        fontSize: '13px',
        fontWeight: 400,
        color: active ? 'var(--color-ink)' : hovered ? 'var(--color-ink-muted)' : 'var(--color-ink-subtle)',
        background: active ? 'var(--color-surface-2)' : hovered ? 'var(--color-surface-1)' : 'transparent',
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {IconComponent && (
        <IconComponent
          style={{
            width: 15,
            height: 15,
            opacity: active ? 0.9 : 0.5,
            flexShrink: 0,
          }}
        />
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <Badge color={badge.color} bg={badge.bg}>
          {badge.text}
        </Badge>
      )}
      {count !== undefined && (
        <span
          className="mono"
          style={{
            fontSize: '11px',
            color: 'var(--color-ink-tertiary)',
            marginLeft: 'auto',
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
};

interface SidebarProps {
  activeView: ViewID;
  onNavigate: (view: ViewID) => void;
  serverCounts?: {
    marketplace?: number;
    installed?: number;
    clients?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, serverCounts = {} }) => {
  return (
    <div
      style={{
        width: '220px',
        height: '100%',
        background: '#0a0b0f',
        borderRight: '1px solid var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-text)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px 16px 12px',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LucideIcons.Package style={{ width: 16, height: 16, color: '#fff' }} />
        </div>
        <div>
          <div
            className="display-font"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-ink)',
              letterSpacing: '-0.3px',
            }}
          >
            Open MCP Manager
          </div>
          <div
            className="mono"
            style={{
              fontSize: '10px',
              color: 'var(--color-ink-tertiary)',
              marginTop: '1px',
            }}
          >
            v0.1.0-beta
          </div>
        </div>
      </div>

      {/* Scrollable Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {/* Discover */}
        <div style={{ padding: '6px 0' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 500,
              color: 'var(--color-ink-tertiary)',
              padding: '10px 16px 4px',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            Discover
          </div>
          <SbItem
            icon="Package"
            label="Marketplace"
            active={activeView === 'marketplace'}
            onClick={() => onNavigate('marketplace')}
            count={serverCounts.marketplace}
          />
        </div>

        {/* Manage */}
        <div style={{ padding: '6px 0' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 500,
              color: 'var(--color-ink-tertiary)',
              padding: '10px 16px 4px',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            Manage
          </div>
          <SbItem
            icon="CheckCircle2"
            label="Installed"
            active={activeView === 'installed'}
            onClick={() => onNavigate('installed')}
            count={serverCounts.installed}
          />
          <SbItem
            icon="Monitor"
            label="Clients"
            active={activeView === 'clients'}
            onClick={() => onNavigate('clients')}
            count={serverCounts.clients}
          />
        </div>

        {/* Configure */}
        <div style={{ padding: '6px 0' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 500,
              color: 'var(--color-ink-tertiary)',
              padding: '10px 16px 4px',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            Configure
          </div>
          <SbItem
            icon="Cloud"
            label="Cloud Sync"
            active={activeView === 'cloud-sync'}
            onClick={() => onNavigate('cloud-sync')}
            badge={{
              text: 'Synced',
              color: 'var(--color-semantic-success)',
              bg: 'rgba(39, 166, 68, 0.09)',
            }}
          />
          <SbItem
            icon="Layers"
            label="Profiles"
            active={activeView === 'profiles'}
            onClick={() => onNavigate('profiles')}
          />
          <SbItem
            icon="Settings"
            label="Settings"
            active={activeView === 'settings'}
            onClick={() => onNavigate('settings')}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-hairline)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-semantic-success)',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--color-ink-subtle)' }}>
            All systems operational
          </span>
        </div>
        <div
          className="mono"
          style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)' }}
        >
          open-mcp-manager v0.1.0
        </div>
      </div>
    </div>
  );
};
