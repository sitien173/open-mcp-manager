import React from 'react';
import * as LucideIcons from 'lucide-react';

interface EmptyStateProps {
  icon: keyof typeof LucideIcons;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => {
  const IconComponent = LucideIcons[icon] as React.ElementType;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '64px',
        color: 'var(--color-ink-tertiary)',
      }}
    >
      {IconComponent && <IconComponent style={{ width: 32, height: 32, opacity: 0.4 }} />}
      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink-subtle)' }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: '13px', maxWidth: '320px', textAlign: 'center', lineHeight: 1.5 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
