import { create } from 'zustand';
import { McpServerConfig } from '../types';
import { invoke } from '@tauri-apps/api/core';

interface InstalledState {
  servers: McpServerConfig[];
  loading: boolean;
  error: string | null;

  fetchInstalled: () => Promise<void>;
  installServer: (serverId: string, clientIds: string[]) => Promise<void>;
  uninstallServer: (serverId: string) => Promise<void>;
  toggleServer: (serverId: string, enabled: boolean) => Promise<void>;
}

export const useInstalledStore = create<InstalledState>((set) => ({
  servers: [],
  loading: false,
  error: null,

  fetchInstalled: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, this might come from a specific 'get_installed_servers' command
      // For now we'll assume it's part of the server management
      const servers = await invoke<McpServerConfig[]>('get_all_installed_servers');
      set({ servers, loading: false });
    } catch (err) {
      set({ error: typeof err === 'string' ? err : 'Failed to fetch installed servers', loading: false });
    }
  },

  installServer: async (serverId, clientIds) => {
    set({ loading: true });
    try {
      await invoke('install_server_to_clients', { serverId, clientIds });
      // Refresh list
      const servers = await invoke<McpServerConfig[]>('get_all_installed_servers');
      set({ servers, loading: false });
    } catch (err) {
      set({ error: typeof err === 'string' ? err : 'Failed to install server', loading: false });
      throw err;
    }
  },

  uninstallServer: async (serverId) => {
    set({ loading: true });
    try {
      await invoke('uninstall_server', { serverId });
      // Refresh list
      const servers = await invoke<McpServerConfig[]>('get_all_installed_servers');
      set({ servers, loading: false });
    } catch (err) {
      set({ error: typeof err === 'string' ? err : 'Failed to uninstall server', loading: false });
      throw err;
    }
  },

  toggleServer: async (serverId, enabled) => {
    try {
      await invoke('toggle_server', { serverId, enabled });
      set((state) => ({
        servers: state.servers.map((s) => 
          s.id === serverId ? { ...s, enabled } : s
        )
      }));
    } catch (err) {
      set({ error: typeof err === 'string' ? err : 'Failed to toggle server' });
      throw err;
    }
  }
}));
