import React from 'react';
import { Sidebar, ViewID } from './Sidebar';

interface AppLayoutProps {
  activeView: ViewID;
  onNavigate: (view: ViewID) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeView, onNavigate, children }) => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--color-canvas)',
      }}
    >
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <main
        style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </main>
    </div>
  );
};
