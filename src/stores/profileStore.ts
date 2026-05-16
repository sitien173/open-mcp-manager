import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { ProfileInfo } from '../types';

interface ProfileState {
  profiles: ProfileInfo[];
  loading: boolean;
  
  fetchProfiles: () => Promise<void>;
  saveCurrentProfile: (name: string) => Promise<void>;
  exportProfile: (id: string) => Promise<string>;
  importProfile: (json: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  loading: false,

  fetchProfiles: async () => {
    set({ loading: true });
    try {
      const profiles = await invoke<ProfileInfo[]>('list_profiles');
      set({ profiles });
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      set({ loading: false });
    }
  },

  saveCurrentProfile: async (name) => {
    set({ loading: true });
    try {
      await invoke('save_current_profile', { name });
      await useProfileStore.getState().fetchProfiles();
    } catch (err) {
      console.error('Failed to save profile:', err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  exportProfile: async (id) => {
    try {
      return await invoke<string>('export_profile', { name: id });
    } catch (err) {
      console.error('Failed to export profile:', err);
      throw err;
    }
  },

  importProfile: async (json) => {
    set({ loading: true });
    try {
      await invoke('import_profile', { json });
      await useProfileStore.getState().fetchProfiles();
    } catch (err) {
      console.error('Failed to import profile:', err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteProfile: async (id) => {
    set({ loading: true });
    try {
      await invoke('delete_profile', { id });
      await useProfileStore.getState().fetchProfiles();
    } catch (err) {
      console.error('Failed to delete profile:', err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
