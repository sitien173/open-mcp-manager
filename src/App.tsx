import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ViewID } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/Toast';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { DetailPanel } from './components/detail/DetailPanel';
import { useRegistryStore } from './stores/registryStore';
import { useClientStore } from './stores/clientStore';
import { useInstalledStore } from './stores/installedStore';
import { useToastStore } from './stores/toastStore';
import { CommandPalette } from './components/command-palette/CommandPalette';

// New Views
import { InstalledView } from './components/installed/InstalledView';
import { ClientsView } from './components/clients/ClientsView';
import { CloudSyncView } from './components/cloud-sync/CloudSyncView';
import { ProfilesView } from './components/profiles/ProfilesView';
import { SettingsView } from './components/settings/SettingsView';

function App() {
  const [activeView, setActiveView] = useState<ViewID>('marketplace');
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  
  const { entries, selectedServer, setSelectedServer } = useRegistryStore();
  const { fetchClients } = useClientStore();
  const { fetchInstalled } = useInstalledStore();
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    fetchClients();
    fetchInstalled();
  }, [fetchClients, fetchInstalled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'marketplace': return <MarketplaceView />;
      case 'installed': return <InstalledView />;
      case 'clients': return <ClientsView />;
      case 'cloud-sync': return <CloudSyncView />;
      case 'profiles': return <ProfilesView />;
      case 'settings': return <SettingsView onNavigate={setActiveView} />;
      default: return <MarketplaceView />;
    }
  };

  return (
    <AppLayout activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
      
      {selectedServer && (
        <DetailPanel 
          server={selectedServer} 
          onClose={() => setSelectedServer(null)} 
        />
      )}

      <CommandPalette
        open={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onNavigate={(v) => { setActiveView(v as ViewID); setCmdPaletteOpen(false); }}
        servers={entries.map(e => ({ sourceId: e.sourceId, name: e.name }))}
        onSelectServer={(sourceId) => {
          const s = entries.find(e => e.sourceId === sourceId);
          if (s) { 
            setSelectedServer(s); 
            setCmdPaletteOpen(false); 
          }
        }}
      />
      
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </AppLayout>
  );
}

export default App;
