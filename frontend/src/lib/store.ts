import { create } from 'zustand';
import { ConfigState, UIConfig, User } from '@/types/config';
import { configAPI } from './api';

interface ConfigActions {
  setUser: (user: User) => void;
  setConfig: (config: UIConfig) => void;
  setAllConfigs: (configs: Record<string, UIConfig>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserInfo: () => Promise<void>;
  fetchConfig: (country: string) => Promise<void>;
  fetchAllConfigs: () => Promise<void>;
  updateConfig: (country: string, config: UIConfig) => Promise<void>;
}

export const useConfigStore = create<ConfigState & ConfigActions>((set, get) => ({
  config: null,
  allConfigs: {},
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setConfig: (config) => set({ config }),
  setAllConfigs: (allConfigs) => set({ allConfigs }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchUserInfo: async () => {
    try {
      set({ loading: true, error: null });
      const user = await configAPI.getUserInfo();
      set({ user });
      
      // Store user info in localStorage
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userCountry', user.country);
    } catch (error) {
      set({ error: 'Failed to fetch user info' });
    } finally {
      set({ loading: false });
    }
  },

  fetchConfig: async (country) => {
    try {
      set({ loading: true, error: null });
      const { config } = await configAPI.getConfig(country);
      set({ config });
    } catch (error) {
      set({ error: 'Failed to fetch configuration' });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllConfigs: async () => {
    try {
      set({ loading: true, error: null });
      const allConfigs = await configAPI.getAllConfigs();
      set({ allConfigs });
    } catch (error) {
      set({ error: 'Failed to fetch all configurations' });
    } finally {
      set({ loading: false });
    }
  },

  updateConfig: async (country, config) => {
    try {
      set({ loading: true, error: null });
      await configAPI.updateConfig(country, config);
      
      // Update local state
      const { allConfigs } = get();
      set({ 
        allConfigs: { ...allConfigs, [country]: config },
        config: get().user?.country === country ? config : get().config
      });
    } catch (error) {
      set({ error: 'Failed to update configuration' });
    } finally {
      set({ loading: false });
    }
  }
}));