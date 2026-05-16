import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  title: string;
  width?: number;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  title,
  width = 440,
  onClose,
  footer,
  children,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface-1)',
          borderRadius: '14px',
          width: `${width}px`,
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--color-hairline)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          animation: 'modalIn 0.18s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline)',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>{title}</div>
          <div
            onClick={onClose}
            style={{ cursor: 'pointer', color: 'var(--color-ink-tertiary)', display: 'flex' }}
          >
            <X style={{ width: 18, height: 18 }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--color-hairline)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
