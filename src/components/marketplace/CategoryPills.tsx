import React, { useState } from 'react';
import { Category } from '../../types';
import { CATEGORIES } from '../../stores/registryStore';

interface CategoryPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ label, active, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: '5px 12px',
        borderRadius: 9999,
        cursor: 'pointer',
        transition: 'background 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
        background: active 
          ? 'var(--color-primary)' 
          : (hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)'),
        color: active 
          ? '#fff' 
          : (hovered ? 'var(--color-ink-muted)' : 'var(--color-ink-subtle)'),
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </div>
  );
};

interface CategoryPillsProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ selectedId, onSelect }) => {
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: '0 24px 14px',
      borderBottom: '1px solid var(--color-hairline)',
      flexShrink: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none', // Hide scrollbar for cleaner look
    }}>
      {CATEGORIES.map(cat => (
        <CategoryPill
          key={cat.id}
          label={cat.label}
          active={selectedId === cat.id}
          onClick={() => onSelect(cat.id)}
        />
      ))}
    </div>
  );
};
