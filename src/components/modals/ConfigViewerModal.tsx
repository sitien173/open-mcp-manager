import React, { useState, useEffect } from 'react';
import { FileText, Check, Copy } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { ModalShell } from '../ui/ModalShell';
import { Btn } from '../ui/Btn';
import { ClientInfo } from '../../types';

interface ConfigViewerModalProps {
  client: ClientInfo;
  onClose: () => void;
}

export const ConfigViewerModal: React.FC<ConfigViewerModalProps> = ({ client, onClose }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await invoke('get_client_servers', { clientId: client.id });
        setConfig(data);
      } catch (err) {
        console.error('Failed to fetch config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [client.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const highlightJSON = (json: any) => {
    if (!json) return '';
    const str = escapeHtml(JSON.stringify(json, null, 2));
    return str.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }

        const colorMap: Record<string, string> = {
          key: '#828fff',
          string: '#27ae60',
          number: '#f2c94c',
          boolean: '#f2994a',
          null: '#eb5757',
        };

        return `<span style="color: ${colorMap[cls]}">${match}</span>`;
      }
    );
  };

  return (
    <ModalShell
      title={`${client.name} — config`}
      width={560}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={copyToClipboard} style={{ marginRight: 'auto' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span style={{ marginLeft: '6px' }}>{copied ? 'Copied' : 'Copy JSON'}</span>
          </Btn>
          <Btn variant="secondary" onClick={onClose}>
            Close
          </Btn>
        </>
      }
    >
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FileText size={14} color="var(--color-ink-tertiary)" />
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {client.activePath || 'No active path'}
        </span>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: '8px',
          padding: '14px 16px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {loading ? (
          <div style={{ color: 'var(--color-ink-subtle)', fontStyle: 'italic' }}>Loading config...</div>
        ) : !config || Object.keys(config).length === 0 ? (
          <div style={{ color: 'var(--color-ink-subtle)', fontStyle: 'italic', textAlign: 'center' }}>
            No servers configured
          </div>
        ) : (
          <pre
            style={{
              margin: 0,
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.65,
              color: 'var(--color-ink)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
            dangerouslySetInnerHTML={{ __html: highlightJSON(config) }}
          />
        )}
      </div>
    </ModalShell>
  );
};
