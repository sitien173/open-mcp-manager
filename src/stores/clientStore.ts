import { create } from 'zustand';
import { ClientInfo } from '../types';
import { invoke } from '@tauri-apps/api/core';

interface ClientState {
  clients: ClientInfo[];
  loading: boolean;
  error: string | null;

  fetchClients: () => Promise<void>;
  addClient: (name: string, path: string, icon: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const clients = await invoke<ClientInfo[]>('detect_clients');
      set({ clients, loading: false });
    } catch (err) {
      set({ error: typeof err === 'string' ? err : 'Failed to fetch clients', loading: false });
    }
  },

  addClient: async (name, path, icon) => {
    // This will be implemented in Phase 6, but we can scaffold the store action
    set({ loading: true });
    try {
      // await invoke('add_client', { name, path, icon });
      const clients = await invoke<ClientInfo[]>('detect_clients');
      set({ clients, loading: false });
    } catch (err) {
      set({ error: typeof err === 'string' ? err : 'Failed to add client', loading: false });
    }
  }
}));
