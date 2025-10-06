import { render, screen } from '@testing-library/react';
import DynamicUI from '../DynamicUI';
import { useConfigStore } from '@/lib/store';

// Mock the store
jest.mock('@/lib/store');

const mockUseConfigStore = useConfigStore as jest.MockedFunction<typeof useConfigStore>;

describe('DynamicUI', () => {
  const mockConfig = {
    showTabs: true,
    showNavBar: true,
    showInputField: true,
    showButton: true,
    tabs: ['Home', 'About', 'Contact'],
    navItems: ['Dashboard', 'Profile', 'Settings'],
    theme: 'light' as const,
    features: {
      'Feature A': true,
      'Feature B': false
    }
  };

  const mockUser = {
    userId: 'test-user',
    role: 'user' as const,
    country: 'US'
  };

  beforeEach(() => {
    mockUseConfigStore.mockReturnValue({
      config: mockConfig,
      user: mockUser,
      fetchConfig: jest.fn(),
      fetchUserInfo: jest.fn(),
      allConfigs: {},
      loading: false,
      error: null,
      setUser: jest.fn(),
      setConfig: jest.fn(),
      setAllConfigs: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      fetchAllConfigs: jest.fn(),
      updateConfig: jest.fn()
    });
  });

  it('renders navigation bar when showNavBar is true', () => {
    render(<DynamicUI />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders tabs when showTabs is true', () => {
    render(<DynamicUI />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders input field when showInputField is true', () => {
    render(<DynamicUI />);
    
    expect(screen.getByPlaceholderText('Enter text here...')).toBeInTheDocument();
  });

  it('renders button when showButton is true', () => {
    render(<DynamicUI />);
    
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('displays country in welcome message', () => {
    render(<DynamicUI />);
    
    expect(screen.getByText('Welcome to US Dashboard')).toBeInTheDocument();
  });

  it('shows loading when config is null', () => {
    mockUseConfigStore.mockReturnValue({
      config: null,
      user: mockUser,
      fetchConfig: jest.fn(),
      fetchUserInfo: jest.fn(),
      allConfigs: {},
      loading: false,
      error: null,
      setUser: jest.fn(),
      setConfig: jest.fn(),
      setAllConfigs: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      fetchAllConfigs: jest.fn(),
      updateConfig: jest.fn()
    });

    render(<DynamicUI />);
    
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
  });
});