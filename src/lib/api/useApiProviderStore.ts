import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiProvider } from './config';

interface ApiProviderStore {
  provider: ApiProvider;
  setProvider: (provider: ApiProvider) => void;
}

export const useApiProviderStore = create<ApiProviderStore>()(
  persist(
    (set) => ({
      provider: 'deepseek',
      setProvider: (provider) => set({ provider }),
    }),
    {
      name: 'api-provider-storage',
    }
  )
);
