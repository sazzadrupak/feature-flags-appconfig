export interface UIConfig {
  showTabs: boolean;
  showNavBar: boolean;
  showInputField: boolean;
  showButton: boolean;
  tabs: string[];
  navItems: string[];
  theme: 'light' | 'dark';
  features: {
    [key: string]: boolean;
  };
}

export interface CountryConfig {
  country: string;
  config: UIConfig;
}

export interface User {
  userId: string;
  role: 'admin' | 'user';
  country: string;
}

export interface ConfigState {
  config: UIConfig | null;
  allConfigs: Record<string, UIConfig>;
  user: User | null;
  loading: boolean;
  error: string | null;
}