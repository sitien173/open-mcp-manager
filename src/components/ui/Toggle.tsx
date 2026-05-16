import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, size = 'md', disabled = false }) => {
  const w = size === 'sm' ? 28 : 36;
  const h = size === 'sm' ? 16 : 20;
  const dot = size === 'sm' ? 12 : 16;
  const pad = 2;

  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: w,
        height: h,
        borderRadius: 999,
        background: checked ? 'var(--color-primary)' : 'var(--color-surface-3)',
        cursor: disabled ? 'default' : 'pointer',
        position: 'relative',
        transition: 'background 0.15s ease',
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: pad,
          left: checked ? w - dot - pad : pad,
          transition: 'left 0.15s ease',
        }}
      />
    </div>
  );
};
