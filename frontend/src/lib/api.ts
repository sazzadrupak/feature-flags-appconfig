import axios from 'axios';
import { CountryConfig, User, UIConfig } from '@/types/config';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user headers
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId') || 'anonymous';
  const userRole = localStorage.getItem('userRole') || 'user';
  
  config.headers['x-user-id'] = userId;
  config.headers['x-user-role'] = userRole;
  
  return config;
});

export const configAPI = {
  async getConfig(country: string): Promise<CountryConfig> {
    const response = await api.get(`/config/${country}`);
    return response.data;
  },

  async updateConfig(country: string, config: UIConfig): Promise<void> {
    await api.put(`/config/${country}`, { config });
  },

  async getAllConfigs(): Promise<Record<string, UIConfig>> {
    const response = await api.get('/admin/configs');
    return response.data.configs;
  },

  async getUserInfo(): Promise<User> {
    const response = await api.get('/auth/user');
    return response.data;
  }
};

export default api;