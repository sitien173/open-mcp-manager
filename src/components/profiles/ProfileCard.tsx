import React, { useState } from 'react';
import { Layers, Check, Download, Trash2 } from 'lucide-react';
import { ProfileInfo } from '../../types';
import { Btn } from '../ui/Btn';

interface ProfileCardProps {
  profile: ProfileInfo;
  onApply: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
}

const styles = {
  card: {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 12, padding: '16px 18px',
    display: 'flex', flexDirection: 'column' as const, gap: 10,
    transition: 'background 0.12s, border-color 0.12s',
    cursor: 'pointer',
    position: 'relative' as const,
  },
  cardTop: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 9,
    background: 'var(--color-surface-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  name: {
    fontSize: 14, fontWeight: 500, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.2px',
  },
  stats: {
    fontSize: 11, color: 'var(--color-ink-tertiary)',
    fontFamily: 'var(--font-mono)', marginTop: 2,
  },
  description: {
    fontSize: 13, color: 'var(--color-ink-subtle)', lineHeight: 1.45,
  },
  actions: {
    display: 'flex', gap: 6, marginTop: 2,
  },
};

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onApply, onExport, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        borderColor: hovered ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardTop as React.CSSProperties}>
        <div style={styles.iconBox as React.CSSProperties}>
          <Layers style={{ width: 17, height: 17, color: 'var(--color-ink-subtle)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.name as React.CSSProperties}>{profile.name}</div>
          <div style={styles.stats as React.CSSProperties}>
            {profile.serverCount} servers · {profile.clientCount} clients · {profile.createdAt}
          </div>
        </div>
      </div>
      <div style={styles.description as React.CSSProperties}>{profile.description}</div>
      
      {hovered && (
        <div style={styles.actions as React.CSSProperties}>
          <Btn variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onApply(profile.id); }}>
            <Check style={{ width: 12, height: 12 }} /> Apply
          </Btn>
          <Btn variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onExport(profile.id); }}>
            <Download style={{ width: 12, height: 12 }} /> Export
          </Btn>
          <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}>
            <Trash2 style={{ width: 12, height: 12 }} />
          </Btn>
        </div>
      )}
    </div>
  );
};
