import React, { useState } from 'react';
import { Terminal, Code, MessageSquare, Monitor, Sparkles, SquareTerminal, Plus } from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';
import { Btn } from '../ui/Btn';
import { useClientStore } from '../../stores/clientStore';

interface AddClientModalProps {
  onClose: () => void;
}

const icons = [
  { id: 'terminal', Icon: Terminal },
  { id: 'code', Icon: Code },
  { id: 'message-square', Icon: MessageSquare },
  { id: 'monitor', Icon: Monitor },
  { id: 'sparkles', Icon: Sparkles },
  { id: 'square-terminal', Icon: SquareTerminal },
];

export const AddClientModal: React.FC<AddClientModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('terminal');
  const { addClient } = useClientStore();

  const handleSubmit = () => {
    if (name && path) {
      addClient(name, path, selectedIcon);
      onClose();
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--color-ink-subtle)',
    marginBottom: '6px',
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--color-canvas)',
    border: '1px solid var(--color-hairline)',
    borderRadius: '7px',
    padding: '8px 11px',
    color: 'var(--color-ink)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
  };

  return (
    <ModalShell
      title="Add custom client"
      width={440}
      onClose={onClose}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            variant="primary"
            onClick={handleSubmit}
            disabled={!name || !path}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            Add client
          </Btn>
        </>
      }
    >
      <div style={{ padding: '0 4px' }}>
        <label style={labelStyle}>Client name</label>
        <input
          autoFocus
          style={inputStyle}
          placeholder="My Custom Client"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={labelStyle}>Config file path</label>
        <input
          style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
          placeholder="/path/to/config.json"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />

        <label style={labelStyle}>Icon</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {icons.map(({ id, Icon }) => (
            <div
              key={id}
              onClick={() => setSelectedIcon(id)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: selectedIcon === id ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: selectedIcon === id ? '#fff' : 'var(--color-ink-subtle)',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={20} />
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
};
