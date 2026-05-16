import React, { useEffect, useMemo } from 'react';
import { useRegistryStore } from '../../stores/registryStore';
import { useInstalledStore } from '../../stores/installedStore';
import { SearchInput } from '../ui/SearchInput';
import { CategoryPills } from './CategoryPills';
import { ServerCard } from './ServerCard';
import { ServerCardCompact } from './ServerCardCompact';
import { EmptyState } from '../ui/EmptyState';
import { Loader2 } from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { 
    entries, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    loading, 
    fetchRegistry,
    setSelectedServer
  } = useRegistryStore();

  const { servers: installedServers } = useInstalledStore();

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry, searchQuery]);

  const installedIds = useMemo(() => new Set(installedServers.map(s => s.name.toLowerCase())), [installedServers]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (selectedCategory !== 'all' && entry.category !== selectedCategory) return false;
      return true;
    });
  }, [entries, selectedCategory]);

  // For Phase 5, we'll use a fixed grid view. 
  // Future phases might add a toggle for compact view.
  const [cardStyle, setCardStyle] = React.useState<'grid' | 'compact'>('grid');

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 24px',
        borderBottom: '1px solid var(--color-hairline)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.3px',
          flexShrink: 0,
        }}>
          Marketplace
        </span>
        <SearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search servers..." 
        />
      </div>

      <CategoryPills 
        selectedId={selectedCategory} 
        onSelect={setSelectedCategory} 
      />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: 24,
        display: 'grid',
        gridTemplateColumns: cardStyle === 'compact' ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: cardStyle === 'compact' ? 4 : 12,
        alignContent: 'start',
      }}>
        {loading && entries.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            display: 'flex', 
            justifyContent: 'center', 
            padding: 48 
          }}>
            <Loader2 className="animate-spin" size={32} color="var(--color-ink-tertiary)" />
          </div>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            cardStyle === 'compact' ? (
              <ServerCardCompact 
                key={entry.sourceId} 
                server={entry} 
                isInstalled={installedIds.has(entry.name.toLowerCase())} 
                onSelect={setSelectedServer} 
              />
            ) : (
              <ServerCard 
                key={entry.sourceId} 
                server={entry} 
                isInstalled={installedIds.has(entry.name.toLowerCase())} 
                onSelect={setSelectedServer} 
              />
            )
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState 
              icon="Search" 
              title="No servers found" 
              subtitle="Try adjusting your search or category filter" 
            />
          </div>
        )}
      </div>
    </div>
  );
};
