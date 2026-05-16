import { create } from 'zustand';
import { RegistryEntry, Category } from '../types';
import { invoke } from '@tauri-apps/api/core';

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'developer-tools', label: 'Developer Tools' },
  { id: 'data-analytics', label: 'Data & Analytics' },
  { id: 'communication', label: 'Communication' },
  { id: 'cloud', label: 'Cloud & Infra' },
  { id: 'ai-ml', label: 'AI & ML' },
];

interface RegistryState {
  entries: RegistryEntry[];
  searchQuery: string;
  selectedCategory: string;
  loading: boolean;
  error: string | null;
  selectedServer: RegistryEntry | null;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedServer: (server: RegistryEntry | null) => void;
  fetchRegistry: () => Promise<void>;
}

export const useRegistryStore = create<RegistryState>((set, get) => ({
  entries: [],
  searchQuery: '',
  selectedCategory: 'all',
  loading: false,
  error: null,
  selectedServer: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedServer: (selectedServer) => set({ selectedServer }),

  fetchRegistry: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, we might pass search and category to the backend
      // for server-side filtering if the catalog is huge.
      const entries = await invoke<RegistryEntry[]>('search_registry', { 
        query: get().searchQuery || null 
      });
      set({ entries, loading: false });
    } catch (err) {
      set({ error: typeof err === 'string' ? err : 'Failed to fetch registry', loading: false });
    }
  },
}));
