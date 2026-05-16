import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Package, 
  CheckCircle2, 
  Monitor, 
  Cloud, 
  Layers, 
  Settings, 
  Plug 
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  servers: Array<{ sourceId: string; name: string }>;
  onSelectServer: (sourceId: string) => void;
}

interface ResultItem {
  id: string;
  label: string;
  icon: React.ElementType;
  type: 'nav' | 'server';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onNavigate,
  servers,
  onSelectServer,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigationItems: ResultItem[] = [
    { id: 'marketplace', label: 'Marketplace', icon: Package, type: 'nav' },
    { id: 'installed', label: 'Installed', icon: CheckCircle2, type: 'nav' },
    { id: 'clients', label: 'Clients', icon: Monitor, type: 'nav' },
    { id: 'cloud-sync', label: 'Cloud Sync', icon: Cloud, type: 'nav' },
    { id: 'profiles', label: 'Profiles', icon: Layers, type: 'nav' },
    { id: 'settings', label: 'Settings', icon: Settings, type: 'nav' },
  ];

  const serverItems: ResultItem[] = servers.map(s => ({
    id: s.sourceId,
    label: s.name,
    icon: Plug,
    type: 'server',
  }));

  const filteredNav = navigationItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredServers = serverItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const results = [...filteredNav, ...filteredServers];

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (results.length > 0) setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (results.length > 0) setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex]);

  const handleSelect = (item: ResultItem) => {
    if (item.type === 'nav') {
      onNavigate(item.id);
    } else {
      onSelectServer(item.id);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '520px',
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          borderRadius: '12px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          marginTop: '-80px',
          overflow: 'hidden',
          animation: 'modalIn 0.18s ease forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '12px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search style={{ width: 14, height: 14, color: 'var(--color-ink-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search navigation or servers..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-ink)',
              fontSize: '14px',
              fontFamily: 'var(--font-text)',
            }}
          />
          <div style={{
            fontSize: '11px',
            color: 'var(--color-ink-subtle)',
            backgroundColor: 'var(--color-surface-3)',
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            ESC
          </div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontSize: '13px' }}>
              No results found for "{query}"
            </div>
          ) : (
            <>
              {filteredNav.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-ink-tertiary)', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Navigation
                  </div>
                  {filteredNav.map((item, i) => {
                    const globalIndex = i;
                    return (
                      <ResultRow 
                        key={item.id} 
                        item={item} 
                        selected={selectedIndex === globalIndex} 
                        onClick={() => handleSelect(item)}
                      />
                    );
                  })}
                </div>
              )}

              {filteredServers.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-ink-tertiary)', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Servers
                  </div>
                  {filteredServers.map((item, i) => {
                    const globalIndex = filteredNav.length + i;
                    return (
                      <ResultRow 
                        key={item.id} 
                        item={item} 
                        selected={selectedIndex === globalIndex} 
                        onClick={() => handleSelect(item)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { transform: translateY(8px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const ResultRow: React.FC<{ item: ResultItem, selected: boolean, onClick: () => void }> = ({ item, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '7px',
        cursor: 'pointer',
        backgroundColor: selected ? 'var(--color-surface-2)' : 'transparent',
        transition: 'background-color 0.1s ease',
      }}
    >
      <item.icon style={{ 
        width: 14, 
        height: 14, 
        color: selected ? 'var(--color-ink)' : 'var(--color-ink-subtle)' 
      }} />
      <span style={{ 
        fontSize: '13px', 
        color: selected ? 'var(--color-ink)' : 'var(--color-ink-subtle)',
        fontWeight: selected ? 500 : 400,
      }}>
        {item.label}
      </span>
    </div>
  );
};
