import React, { useState } from 'react';
import { RegistryEntry } from '../../types';
import { Badge } from '../ui/Badge';
import * as LucideIcons from 'lucide-react';
import { ArrowDownToLine } from 'lucide-react';

interface ServerCardCompactProps {
  server: RegistryEntry;
  isInstalled: boolean;
  onSelect: (server: RegistryEntry) => void;
}

const formatDownloads = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

export const ServerCardCompact: React.FC<ServerCardCompactProps> = ({ server, isInstalled, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const IconComponent = (LucideIcons as any)[server.icon || 'Package'] || LucideIcons.Package;

  return (
    <div
      onClick={() => onSelect(server)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 10,
        padding: '10px 14px',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        borderColor: hovered ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        background: 'var(--color-surface-3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconComponent size={14} color="var(--color-ink-subtle)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.1px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {server.name}
          {server.isDxt && <Badge color="#828fff" bg="#5e6ad220">DXT</Badge>}
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--color-ink-tertiary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {server.description}
        </div>
      </div>
      <span style={{
        fontSize: 11,
        color: 'var(--color-ink-tertiary)',
        fontFamily: 'var(--font-mono)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}>
        <ArrowDownToLine size={10} />
        {formatDownloads(server.downloads)}
      </span>
      {isInstalled && <Badge color="var(--color-semantic-success)" bg="#27a64418">Installed</Badge>}
    </div>
  );
};
