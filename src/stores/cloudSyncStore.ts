import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { CloudProviderView } from '../types';

interface CloudSyncState {
  providers: CloudProviderView[];
  activeProviderId: string | null;
  connected: boolean;
  syncing: 'push' | 'pull' | false;
  lastSync: string | null;
  testing: boolean;
  autoSync: boolean;
  syncInterval: string;
  conflictStrategy: string;
  encryptData: boolean;
  
  fetchProviders: () => Promise<void>;
  configureProvider: (input: { id?: string; providerType: string; config: Record<string, any>; secrets: Record<string, any> }) => Promise<void>;
  testConnection: (providerId: string) => Promise<void>;
  push: (providerId: string, profile: any) => Promise<void>;
  pull: (providerId: string) => Promise<void>;
  setAutoSync: (val: boolean) => void;
  setSyncInterval: (val: string) => void;
  setConflictStrategy: (val: string) => void;
  setEncryptData: (val: boolean) => void;
}

export const useCloudSyncStore = create<CloudSyncState>((set) => ({
  providers: [],
  activeProviderId: null,
  connected: false,
  syncing: false,
  lastSync: null,
  testing: false,
  autoSync: true,
  syncInterval: '5',
  conflictStrategy: 'local-wins',
  encryptData: true,

  fetchProviders: async () => {
    try {
      const providers = await invoke<CloudProviderView[]>('cloud_list_providers');
      set({ providers });
      if (providers.length > 0 && !useCloudSyncStore.getState().activeProviderId) {
        set({ activeProviderId: providers[0].id });
      }
    } catch (err) {
      console.error('Failed to fetch cloud providers:', err);
    }
  },

  configureProvider: async (input) => {
    try {
      await invoke('cloud_configure_provider', { input });
      await useCloudSyncStore.getState().fetchProviders();
    } catch (err) {
      console.error('Failed to configure provider:', err);
      throw err;
    }
  },

  testConnection: async (providerId) => {
    set({ testing: true });
    try {
      await invoke('cloud_test_connection', { input: { providerId } });
      set({ connected: true });
    } catch (err) {
      set({ connected: false });
      console.error('Connection test failed:', err);
      throw err;
    } finally {
      set({ testing: false });
    }
  },

  push: async (providerId, profile) => {
    set({ syncing: 'push' });
    try {
      await invoke('cloud_push', { input: { providerId, profile } });
      set({ lastSync: 'Just now', connected: true });
    } catch (err) {
      console.error('Push failed:', err);
      throw err;
    } finally {
      set({ syncing: false });
    }
  },

  pull: async (providerId) => {
    set({ syncing: 'pull' });
    try {
      await invoke('cloud_pull', { input: { providerId } });
      set({ lastSync: 'Just now', connected: true });
    } catch (err) {
      console.error('Pull failed:', err);
      throw err;
    } finally {
      set({ syncing: false });
    }
  },

  setAutoSync: (autoSync) => set({ autoSync }),
  setSyncInterval: (syncInterval) => set({ syncInterval }),
  setConflictStrategy: (conflictStrategy) => set({ conflictStrategy }),
  setEncryptData: (encryptData) => set({ encryptData }),
}));
