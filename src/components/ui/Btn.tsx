import React, { useState } from 'react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Btn: React.FC<BtnProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  style: sx = {},
  disabled,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-text)',
    fontWeight: 500,
    borderRadius: '8px',
    transition: 'background 0.12s, color 0.12s, border-color 0.12s',
    opacity: disabled ? 0.4 : 1,
    whiteSpace: 'nowrap',
    outline: 'none',
    ...(size === 'sm' ? { fontSize: '12px', padding: '5px 10px' } : { fontSize: '13px', padding: '7px 14px' }),
    ...sx,
  };

  const variants = {
    primary: {
      background: hovered && !disabled ? 'var(--color-primary-hover)' : 'var(--color-primary)',
      color: '#fff',
    },
    secondary: {
      background: hovered && !disabled ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
      color: 'var(--color-ink-muted)',
    },
    ghost: {
      background: hovered && !disabled ? 'var(--color-surface-2)' : 'transparent',
      color: 'var(--color-ink-subtle)',
    },
    danger: {
      background: hovered && !disabled ? 'rgba(235, 87, 87, 0.2)' : 'rgba(235, 87, 87, 0.1)',
      color: '#eb5757',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-ink-muted)',
      border: `1px solid ${hovered && !disabled ? 'var(--color-hairline-strong)' : 'var(--color-hairline)'}`,
    },
  };

  return (
    <button
      style={{ ...baseStyle, ...variants[variant] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
