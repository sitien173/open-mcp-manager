import React, { useState } from 'react';
import { RegistryEntry } from '../../types';
import { Badge } from '../ui/Badge';
import { CATEGORIES } from '../../stores/registryStore';
import * as LucideIcons from 'lucide-react';
import { ArrowDownToLine } from 'lucide-react';

interface ServerCardProps {
  server: RegistryEntry;
  isInstalled: boolean;
  onSelect: (server: RegistryEntry) => void;
}

const formatDownloads = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

export const ServerCard: React.FC<ServerCardProps> = ({ server, isInstalled, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const catLabel = CATEGORIES.find(c => c.id === server.category)?.label || server.category;

  // Dynamically resolve icon
  const IconComponent = (LucideIcons as any)[server.icon || 'Package'] || LucideIcons.Package;

  return (
    <div
      onClick={() => onSelect(server)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        borderColor: hovered ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
      }}
    >
      {/* Top row: icon + name + version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: 'var(--color-surface-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconComponent size={17} color="var(--color-ink-subtle)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.2px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {server.name}
            </span>
            {server.isDxt && (
              <Badge color="#828fff" bg="#5e6ad220">DXT</Badge>
            )}
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--color-ink-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}>
            {server.author} · v{server.version}
          </div>
        </div>
        {isInstalled && (
          <Badge color="var(--color-semantic-success)" bg="#27a64418">Installed</Badge>
        )}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: 'var(--color-ink-subtle)',
        lineHeight: 1.45,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {server.description}
      </div>

      {/* Footer: category + downloads */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
        <Badge>{catLabel}</Badge>
        <span style={{
          fontSize: 11,
          color: 'var(--color-ink-tertiary)',
          fontFamily: 'var(--font-mono)',
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <ArrowDownToLine size={11} />
          {formatDownloads(server.downloads)}
        </span>
      </div>
    </div>
  );
};
