/* ═══════════════════════════════════════════════════════
   Open MCP Manager — Marketplace View
   ═══════════════════════════════════════════════════════ */

const mkStyles = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', minWidth: 0,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '14px 24px',
    borderBottom: '1px solid var(--color-hairline)',
    flexShrink: 0,
  },
  title: {
    fontSize: 15, fontWeight: 600, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.3px',
    flexShrink: 0,
  },
  cats: {
    display: 'flex', gap: 4, padding: '0 24px 14px',
    borderBottom: '1px solid var(--color-hairline)',
    flexShrink: 0,
  },
  cat: {
    fontSize: 12, fontWeight: 500, padding: '5px 12px',
    borderRadius: 9999, cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s',
    whiteSpace: 'nowrap',
  },
  grid: {
    flex: 1, overflowY: 'auto', overflowX: 'hidden',
    padding: 24,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 12,
    alignContent: 'start',
  },
};

function CategoryPill({ label, active, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{
        ...mkStyles.cat,
        background: active ? 'var(--color-primary)' : (hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)'),
        color: active ? '#fff' : (hovered ? 'var(--color-ink-muted)' : 'var(--color-ink-subtle)'),
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >{label}</div>
  );
}

function ServerCard({ server, isInstalled, onSelect }) {
  const [hovered, setHovered] = React.useState(false);
  const catLabel = CATEGORIES.find(c => c.id === server.category)?.label || server.category;

  return (
    <div
      onClick={() => onSelect(server)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 12, padding: '16px 18px',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        borderColor: hovered ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Top row: icon + name + version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'var(--color-surface-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i data-lucide={server.icon} style={{ width: 17, height: 17, color: 'var(--color-ink-subtle)' }}></i>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--color-ink)',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.2px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {server.name}
            {server.isDxt && (
              <Badge color="#828fff" bg="#5e6ad220">DXT</Badge>
            )}
          </div>
          <div style={{
            fontSize: 11, color: 'var(--color-ink-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}>{server.author} · v{server.version}</div>
        </div>
        {isInstalled && (
          <Badge color="var(--color-semantic-success)" bg="#27a64418">Installed</Badge>
        )}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13, color: 'var(--color-ink-subtle)',
        lineHeight: 1.45,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {server.description}
      </div>

      {/* Footer: category + downloads */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
        <Badge>{catLabel}</Badge>
        <span style={{
          fontSize: 11, color: 'var(--color-ink-tertiary)',
          fontFamily: 'var(--font-mono)',
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <i data-lucide="arrow-down-to-line" style={{ width: 11, height: 11 }}></i>
          {formatDownloads(server.downloads)}
        </span>
      </div>
    </div>
  );
}

function ServerCardCompact({ server, isInstalled, onSelect }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={() => onSelect(server)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 10, padding: '10px 14px',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        borderColor: hovered ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: 'var(--color-surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i data-lucide={server.icon} style={{ width: 14, height: 14, color: 'var(--color-ink-subtle)' }}></i>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--color-ink)',
          fontFamily: 'var(--font-display)', letterSpacing: '-0.1px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {server.name}
          {server.isDxt && <Badge color="#828fff" bg="#5e6ad220">DXT</Badge>}
        </div>
        <div style={{
          fontSize: 11, color: 'var(--color-ink-tertiary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{server.description}</div>
      </div>
      <span style={{
        fontSize: 11, color: 'var(--color-ink-tertiary)',
        fontFamily: 'var(--font-mono)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 3,
      }}>
        <i data-lucide="arrow-down-to-line" style={{ width: 10, height: 10 }}></i>
        {formatDownloads(server.downloads)}
      </span>
      {isInstalled && <Badge color="var(--color-semantic-success)" bg="#27a64418">Installed</Badge>}
    </div>
  );
}

function MarketplaceView({ search, onSearchChange, category, onCategoryChange, installedIds, onSelectServer, cardStyle }) {
  const filtered = React.useMemo(() => {
    return MCP_SERVERS.filter(s => {
      if (category !== 'all' && s.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) || (s.tags || []).some(t => t.includes(q));
      }
      return true;
    });
  }, [search, category]);

  return (
    <div style={mkStyles.root}>
      <div style={mkStyles.header}>
        <span style={mkStyles.title}>Marketplace</span>
        <SearchInput value={search} onChange={onSearchChange} placeholder="Search servers..." />
      </div>

      <div style={mkStyles.cats}>
        {CATEGORIES.map(c => (
          <CategoryPill key={c.id} label={c.label} active={category === c.id} onClick={() => onCategoryChange(c.id)} />
        ))}
      </div>

      <div style={{
        ...mkStyles.grid,
        ...(cardStyle === 'compact' ? {
          gridTemplateColumns: '1fr',
          gap: 4,
          padding: '16px 24px',
        } : {}),
      }}>
        {filtered.map(s => (
          cardStyle === 'compact' ? (
            <ServerCardCompact key={s.id} server={s} isInstalled={installedIds.has(s.id)} onSelect={onSelectServer} />
          ) : (
            <ServerCard key={s.id} server={s} isInstalled={installedIds.has(s.id)} onSelect={onSelectServer} />
          )
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState icon="search" title="No servers found" subtitle="Try adjusting your search or category filter" />
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { MarketplaceView, ServerCard, ServerCardCompact });
