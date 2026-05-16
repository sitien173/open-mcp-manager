import React from 'react';
import { MonitorSmartphone, Monitor, Laptop, Server } from 'lucide-react';
import { Badge } from '../ui/Badge';

const styles = {
  card: {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 12, padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  cardTitle: {
    fontSize: 13, fontWeight: 600, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.1px',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  deviceCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px',
    background: 'var(--color-surface-2)',
    borderRadius: 8,
  },
  deviceIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--color-surface-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  statusDot: (active: boolean) => ({
    width: 8, height: 8, borderRadius: '50%',
    background: active ? 'var(--color-semantic-success)' : 'var(--color-ink-tertiary)',
    flexShrink: 0,
  }),
};

const MOCK_DEVICES = [
  { id: 'd1', name: 'DESKTOP-WORK', os: 'Windows 11', lastSeen: '2 min ago', current: true, servers: 5, clients: 4 },
  { id: 'd2', name: 'MacBook-Pro', os: 'macOS 15.2', lastSeen: '1 hour ago', current: false, servers: 3, clients: 2 },
  { id: 'd3', name: 'dev-server', os: 'Ubuntu 24.04', lastSeen: '3 hours ago', current: false, servers: 2, clients: 1 },
];

export const DevicesCard: React.FC = () => {
  return (
    <div style={styles.card as React.CSSProperties}>
      <div style={styles.cardTitle as React.CSSProperties}>
        <MonitorSmartphone style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} />
        Synced devices
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-tertiary)', fontWeight: 400 }}>
          {MOCK_DEVICES.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MOCK_DEVICES.map(dev => (
          <div key={dev.id} style={styles.deviceCard}>
            <div style={styles.deviceIcon as React.CSSProperties}>
              {dev.os.includes('Windows') ? <Monitor style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} /> : 
               dev.os.includes('mac') ? <Laptop style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} /> : 
               <Server style={{ width: 15, height: 15, color: 'var(--color-ink-subtle)' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 500, color: 'var(--color-ink)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {dev.name}
                {dev.current && <Badge color="var(--color-primary)" bg="#5e6ad220">This device</Badge>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {dev.os} · {dev.servers} servers · {dev.clients} clients
              </div>
            </div>
            <div style={{
              fontSize: 11, color: 'var(--color-ink-tertiary)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <div style={styles.statusDot(dev.current || dev.lastSeen.includes('min')) as React.CSSProperties} />
              {dev.lastSeen}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
