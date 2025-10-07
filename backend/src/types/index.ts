/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  variants?: {
    [key: string]: {
      enabled: boolean;
      [key: string]: any;
    };
  };
}

export interface FeatureFlagsConfig {
  flags: {
    [country: string]: {
      [flagName: string]: FeatureFlag;
    };
  };
  values: {
    [country: string]: {
      [flagName: string]: {
        enabled: boolean;
        variant?: string;
        [key: string]: any;
      };
    };
  };
  version: string;
}

export interface CountryFlags {
  [flagName: string]: FeatureFlag;
}

export interface ApiResponse {
  statusCode: number;
  data?: any;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface UserInfo {
  userId: string;
  role: string;
  permissions: string[];
  country?: string;
}

export interface UpdateFeatureFlagsRequest {
  [flagName: string]: FeatureFlag;
}
