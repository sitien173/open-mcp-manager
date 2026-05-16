import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, className = '' }) => {
  return (
    <div
      className={`search-input ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderRadius: '8px',
        padding: '7px 12px',
        flex: 1,
        maxWidth: '400px',
      }}
    >
      <Search style={{ width: 14, height: 14, color: 'var(--color-ink-tertiary)', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          outline: 'none',
          color: 'var(--color-ink)',
          fontSize: '13px',
          fontFamily: 'var(--font-text)',
        }}
      />
      {value && (
        <div
          onClick={() => onChange('')}
          style={{ cursor: 'pointer', color: 'var(--color-ink-tertiary)', display: 'flex' }}
        >
          <X style={{ width: 13, height: 13 }} />
        </div>
      )}
    </div>
  );
};
