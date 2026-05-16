import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { ToastType, ToastItem } from '../../types';

export type { ToastType, ToastItem };

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onDismiss }) => {
  const colors = {
    success: { bg: '#27a64418', border: '#27a64440', icon: CheckCircle2, color: '#27a644' },
    info: { bg: '#5e6ad218', border: '#5e6ad240', icon: Info, color: '#828fff' },
    error: { bg: '#eb575718', border: '#eb575740', icon: AlertCircle, color: '#eb5757' },
  };

  const config = colors[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: '10px',
        background: 'var(--color-surface-2)',
        border: `1px solid ${config.border}`,
        fontSize: '13px',
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-text)',
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        animation: 'toastIn 0.25s ease',
      }}
    >
      <Icon style={{ width: 16, height: 16, color: config.color, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <div
        onClick={onDismiss}
        style={{ cursor: 'pointer', color: 'var(--color-ink-tertiary)', display: 'flex' }}
      >
        <X style={{ width: 14, height: 14 }} />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100,
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
};
