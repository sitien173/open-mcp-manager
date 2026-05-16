import React, { useEffect } from 'react';
import { Upload, Plus } from 'lucide-react';
import { useProfileStore } from '../../stores/profileStore';
import { Btn } from '../ui/Btn';
import { EmptyState } from '../ui/EmptyState';
import { ProfileCard } from './ProfileCard';

const styles = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', minWidth: 0,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 24px',
    borderBottom: '1px solid var(--color-hairline)',
    flexShrink: 0,
  },
  title: {
    fontSize: 15, fontWeight: 600, color: 'var(--color-ink)',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.3px',
    flex: 1,
  },
  content: {
    flex: 1, overflowY: 'auto' as const, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  description: {
    fontSize: 13, color: 'var(--color-ink-subtle)', lineHeight: 1.5,
    padding: '8px 0 4px',
  },
};

export const ProfilesView: React.FC = () => {
  const { profiles, fetchProfiles, saveCurrentProfile, exportProfile, deleteProfile, importProfile } = useProfileStore();

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleApply = (id: string) => {
    console.log('Applying profile:', id);
    // Backend apply command not explicitly listed in store actions but implied by Apply button
  };

  const handleExport = async (id: string) => {
    try {
      const json = await exportProfile(id);
      console.log('Exported profile JSON:', json);
      // In a real app, we'd trigger a download or save to file
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleSaveCurrent = async () => {
    const name = prompt('Enter a name for the new profile:');
    if (name) {
      await saveCurrentProfile(name);
    }
  };

  const handleImport = async () => {
    const json = prompt('Paste profile JSON:');
    if (json) {
      await importProfile(json);
    }
  };

  return (
    <div style={styles.root as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <span style={styles.title as React.CSSProperties}>Profiles</span>
        <Btn variant="secondary" size="sm" onClick={handleImport}>
          <Upload style={{ width: 13, height: 13 }} /> Import
        </Btn>
        <Btn variant="primary" size="sm" onClick={handleSaveCurrent}>
          <Plus style={{ width: 13, height: 13 }} /> Save current
        </Btn>
      </div>
      <div style={styles.content as React.CSSProperties}>
        <div style={styles.description as React.CSSProperties}>
          Profiles capture your current server and client configuration as a snapshot.
          Export profiles to share between machines, or import to restore a previous setup.
        </div>
        
        {profiles.map(p => (
          <ProfileCard 
            key={p.id} 
            profile={p} 
            onApply={handleApply} 
            onExport={handleExport} 
            onDelete={deleteProfile} 
          />
        ))}

        {profiles.length === 0 && (
          <EmptyState 
            icon="Layers" 
            title="No profiles saved" 
            subtitle="Save your current configuration as a profile to back up or share it" 
          />
        )}
      </div>
    </div>
  );
};
