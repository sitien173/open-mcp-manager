/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Data & Shared Components
   ═══════════════════════════════════════════════════════ */

// ── MCP Server Registry ──────────────────────────────
const MCP_SERVERS = [
  { id: 'filesystem', name: 'Filesystem', description: 'Secure file operations with configurable access controls', author: 'Anthropic', category: 'developer-tools', icon: 'folder', version: '1.4.1', downloads: 28450, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/user'] } },
  { id: 'github', name: 'GitHub', description: 'Repository management, file operations, and GitHub API integration', author: 'Anthropic', category: 'developer-tools', icon: 'git-branch', version: '2.1.0', downloads: 22100, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_TOKEN: '<your-token>' } } },
  { id: 'postgres', name: 'PostgreSQL', description: 'Read-only database access with schema inspection', author: 'Anthropic', category: 'data-analytics', icon: 'database', version: '1.0.3', downloads: 14200, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost/mydb'] } },
  { id: 'slack', name: 'Slack', description: 'Channel management and messaging for Slack workspaces', author: 'Anthropic', category: 'communication', icon: 'message-square', version: '1.2.0', downloads: 11800, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-slack'], env: { SLACK_BOT_TOKEN: '<your-token>' } } },
  { id: 'brave-search', name: 'Brave Search', description: 'Web and local search using the Brave Search API', author: 'Anthropic', category: 'cloud', icon: 'globe', version: '1.1.0', downloads: 19300, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-brave-search'], env: { BRAVE_API_KEY: '<your-key>' } } },
  { id: 'puppeteer', name: 'Puppeteer', description: 'Browser automation for web scraping and testing', author: 'Anthropic', category: 'developer-tools', icon: 'monitor', version: '1.0.4', downloads: 16700, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-puppeteer'] } },
  { id: 'sqlite', name: 'SQLite', description: 'Local database access with business intelligence capabilities', author: 'Anthropic', category: 'data-analytics', icon: 'database', version: '1.0.5', downloads: 12400, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-sqlite', './data.db'] } },
  { id: 'memory', name: 'Memory', description: 'Knowledge graph-based persistent memory for conversations', author: 'Anthropic', category: 'ai-ml', icon: 'brain', version: '1.1.0', downloads: 21500, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-memory'] } },
  { id: 'fetch', name: 'Fetch', description: 'HTTP request capabilities for retrieving web content', author: 'Anthropic', category: 'cloud', icon: 'arrow-down-to-line', version: '1.0.2', downloads: 18900, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-fetch'] } },
  { id: 'sequential-thinking', name: 'Sequential Thinking', description: 'Dynamic problem-solving through thought sequences', author: 'Anthropic', category: 'ai-ml', icon: 'workflow', version: '1.0.0', downloads: 9800, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-sequential-thinking'] } },
  { id: 'sentry', name: 'Sentry', description: 'Error tracking and performance monitoring integration', author: 'Sentry', category: 'developer-tools', icon: 'shield-alert', version: '0.7.1', downloads: 8200, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@sentry/mcp-server'], env: { SENTRY_AUTH_TOKEN: '<your-token>' } } },
  { id: 'linear', name: 'Linear', description: 'Project management with issues, projects, and cycles', author: 'Linear', category: 'communication', icon: 'hexagon', version: '1.0.2', downloads: 7600, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@linear/mcp-server'], env: { LINEAR_API_KEY: '<your-key>' } } },
  { id: 'notion', name: 'Notion', description: 'Workspace search, page management, and database queries', author: 'Community', category: 'communication', icon: 'file-text', version: '0.5.3', downloads: 6900, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', 'mcp-server-notion'], env: { NOTION_TOKEN: '<your-token>' } } },
  { id: 'docker', name: 'Docker', description: 'Container management, image builds, and compose operations', author: 'Community', category: 'cloud', icon: 'container', version: '0.4.0', downloads: 5400, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', 'mcp-server-docker'] } },
  { id: 'stripe', name: 'Stripe', description: 'Payment processing, customer management, and invoice APIs', author: 'Stripe', category: 'cloud', icon: 'credit-card', version: '0.3.1', downloads: 4800, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@stripe/mcp-server'], env: { STRIPE_SECRET_KEY: '<your-key>' } } },
  { id: 'figma', name: 'Figma', description: 'Design file access, component inspection, and export', author: 'Community', category: 'developer-tools', icon: 'pen-tool', version: '0.6.2', downloads: 7100, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', 'mcp-server-figma'], env: { FIGMA_TOKEN: '<your-token>' } } },
  { id: 'google-drive', name: 'Google Drive', description: 'File management, search, and document access for Google Drive', author: 'Anthropic', category: 'cloud', icon: 'hard-drive', version: '1.0.1', downloads: 10200, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-google-drive'] } },
  { id: 'cloudflare', name: 'Cloudflare', description: 'Workers, KV, D1, and R2 management via Cloudflare API', author: 'Cloudflare', category: 'cloud', icon: 'cloud', version: '0.8.0', downloads: 5100, transport: 'stdio', isDxt: true, config: { command: 'npx', args: ['-y', '@cloudflare/mcp-server'] } },
  { id: 'redis', name: 'Redis', description: 'Key-value store operations, pub/sub, and data management', author: 'Community', category: 'data-analytics', icon: 'layers', version: '0.3.0', downloads: 4200, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', 'mcp-server-redis', 'redis://localhost:6379'] } },
  { id: 'aws', name: 'AWS', description: 'S3, Lambda, DynamoDB, and core AWS service management', author: 'Community', category: 'cloud', icon: 'cloud-cog', version: '0.5.2', downloads: 6300, transport: 'stdio', isDxt: false, config: { command: 'npx', args: ['-y', 'mcp-server-aws'], env: { AWS_PROFILE: 'default' } } },
];

// ── Categories ───────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'developer-tools', label: 'Developer Tools' },
  { id: 'data-analytics', label: 'Data & Analytics' },
  { id: 'communication', label: 'Communication' },
  { id: 'cloud', label: 'Cloud & Infra' },
  { id: 'ai-ml', label: 'AI & ML' },
];

// ── AI Client Definitions ────────────────────────────
const AI_CLIENTS_INITIAL = [
  { id: 'claude-desktop', name: 'Claude Desktop', icon: 'message-square', configPath: '%APPDATA%\\Claude\\claude_desktop_config.json', detected: true, servers: ['filesystem', 'github', 'memory', 'brave-search'] },
  { id: 'claude-code', name: 'Claude Code', icon: 'terminal', configPath: '~/.claude/settings.json', detected: true, servers: ['filesystem', 'github'] },
  { id: 'cursor', name: 'Cursor', icon: 'mouse-pointer-2', configPath: '%APPDATA%\\Cursor\\mcp.json', detected: true, servers: ['filesystem', 'github', 'postgres'] },
  { id: 'windsurf', name: 'Windsurf', icon: 'wind', configPath: '%APPDATA%\\Windsurf\\mcp_config.json', detected: true, servers: ['filesystem'] },
  { id: 'cline', name: 'Cline', icon: 'square-terminal', configPath: '~/.cline/mcp_settings.json', detected: false, servers: [] },
  { id: 'roo-code', name: 'Roo Code', icon: 'code', configPath: '~/.roo-code/mcp.json', detected: false, servers: [] },
  { id: 'copilot', name: 'GitHub Copilot', icon: 'sparkles', configPath: '%APPDATA%\\Code\\User\\settings.json', detected: true, servers: ['github', 'filesystem'] },
  { id: 'codex-cli', name: 'Codex CLI', icon: 'square-chevron-right', configPath: '~/.codex/config.json', detected: false, servers: [] },
  { id: 'mcphub', name: 'MCPHub', icon: 'hub', configPath: '~/.mcphub/config.json', detected: false, servers: [] },
];

// ── Initial Installed Servers ────────────────────────
const INSTALLED_INITIAL = [
  { serverId: 'filesystem', enabled: true, version: '1.4.1', clientIds: ['claude-desktop', 'claude-code', 'cursor', 'windsurf', 'copilot'] },
  { serverId: 'github', enabled: true, version: '2.1.0', clientIds: ['claude-desktop', 'claude-code', 'cursor', 'copilot'] },
  { serverId: 'memory', enabled: true, version: '1.1.0', clientIds: ['claude-desktop'] },
  { serverId: 'brave-search', enabled: true, version: '1.1.0', clientIds: ['claude-desktop'] },
  { serverId: 'postgres', enabled: false, version: '1.0.3', clientIds: ['cursor'] },
];

// ── Initial Profiles ─────────────────────────────────
const PROFILES_INITIAL = [
  { id: 'p1', name: 'Development', serverCount: 5, clientCount: 3, createdAt: '2025-12-15', description: 'Full dev environment with filesystem, GitHub, and DB access' },
  { id: 'p2', name: 'Minimal', serverCount: 2, clientCount: 1, createdAt: '2026-01-10', description: 'Lightweight setup with filesystem and memory only' },
];

// ── Format helpers ───────────────────────────────────
function formatDownloads(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

// ── Shared UI Components ─────────────────────────────

function Toggle({ checked, onChange, size = 'md' }) {
  const w = size === 'sm' ? 28 : 36;
  const h = size === 'sm' ? 16 : 20;
  const dot = size === 'sm' ? 12 : 16;
  const pad = 2;

  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: w, height: h, borderRadius: 999,
        background: checked ? 'var(--color-primary)' : 'var(--color-surface-3)',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.15s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: dot, height: dot, borderRadius: '50%',
        background: '#fff', position: 'absolute',
        top: pad, left: checked ? w - dot - pad : pad,
        transition: 'left 0.15s ease',
      }} />
    </div>
  );
}

function Badge({ children, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 500, padding: '2px 7px',
      borderRadius: 9999,
      background: bg || 'var(--color-surface-2)',
      color: color || 'var(--color-ink-subtle)',
      whiteSpace: 'nowrap', lineHeight: 1.4,
    }}>{children}</span>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--color-surface-1)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 8, padding: '7px 12px', flex: 1, maxWidth: 400,
    }}>
      <i data-lucide="search" style={{ width: 14, height: 14, color: 'var(--color-ink-tertiary)', flexShrink: 0 }}></i>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--color-ink)', fontSize: 13,
          fontFamily: 'var(--font-text)',
        }}
      />
      {value && (
        <div onClick={() => onChange('')} style={{ cursor: 'pointer', color: 'var(--color-ink-tertiary)', display: 'flex' }}>
          <i data-lucide="x" style={{ width: 13, height: 13 }}></i>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: 64,
      color: 'var(--color-ink-tertiary)',
    }}>
      <i data-lucide={icon} style={{ width: 32, height: 32, opacity: 0.4 }}></i>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-ink-subtle)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, maxWidth: 320, textAlign: 'center', lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

function Toast({ message, type = 'success', onDismiss }) {
  const colors = {
    success: { bg: '#27a64418', border: '#27a64440', icon: 'check-circle-2', color: '#27a644' },
    info: { bg: '#5e6ad218', border: '#5e6ad240', icon: 'info', color: '#828fff' },
    error: { bg: '#eb575718', border: '#eb575740', icon: 'alert-circle', color: '#eb5757' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', borderRadius: 10,
      background: 'var(--color-surface-2)',
      border: `1px solid ${c.border}`,
      fontSize: 13, color: 'var(--color-ink)',
      fontFamily: 'var(--font-text)',
      minWidth: 280, maxWidth: 400,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'toastIn 0.25s ease',
    }}>
      <i data-lucide={c.icon} style={{ width: 16, height: 16, color: c.color, flexShrink: 0 }}></i>
      <span style={{ flex: 1 }}>{message}</span>
      <div onClick={onDismiss} style={{ cursor: 'pointer', color: 'var(--color-ink-tertiary)', display: 'flex' }}>
        <i data-lucide="x" style={{ width: 14, height: 14 }}></i>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 100,
    }}>
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function Btn({ children, variant = 'secondary', size = 'md', onClick, style: sx = {}, disabled }) {
  const [hovered, setHovered] = React.useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: 'none', cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-text)', fontWeight: 500,
    borderRadius: 8, transition: 'background 0.12s, color 0.12s',
    opacity: disabled ? 0.4 : 1,
    whiteSpace: 'nowrap',
    ...(size === 'sm' ? { fontSize: 12, padding: '5px 10px' } : { fontSize: 13, padding: '7px 14px' }),
  };
  const variants = {
    primary: {
      background: hovered ? 'var(--color-primary-hover)' : 'var(--color-primary)',
      color: '#fff',
    },
    secondary: {
      background: hovered ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
      color: 'var(--color-ink-muted)',
    },
    ghost: {
      background: hovered ? 'var(--color-surface-2)' : 'transparent',
      color: 'var(--color-ink-subtle)',
    },
    danger: {
      background: hovered ? '#eb575730' : '#eb575718',
      color: '#eb5757',
    },
  };
  return (
    <button
      style={{ ...base, ...variants[variant], ...sx }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >{children}</button>
  );
}

Object.assign(window, {
  MCP_SERVERS, CATEGORIES, AI_CLIENTS_INITIAL, INSTALLED_INITIAL, PROFILES_INITIAL,
  formatDownloads, Toggle, Badge, SearchInput, EmptyState,
  Toast, ToastContainer, Btn,
});
