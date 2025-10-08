/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Individual feature flag configuration
 */
export interface FeatureFlag {
  enabled: boolean;
}

/**
 * Country-specific feature flags configuration
 */
export interface CountryFlags {
  allow_mobile_payments: FeatureFlag;
  default_payments_per_region: FeatureFlag;
}

/**
 * ISO 3166 Alpha-3 country code type
 * Represents any valid 3-letter country code
 */
export type CountryCode = string;

/**
 * Complete AppConfig feature flags structure
 * Maps any ISO 3166 country codes to their feature flag configurations
 */
export interface FeatureFlagsConfig {
  [countryCode: CountryCode]: CountryFlags;
}

/**
 * Response structure for getting feature flags
 * Includes the configuration and available countries
 */
export interface GetFeatureFlagsResponse {
  config: FeatureFlagsConfig;
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
  allow_mobile_payments?: FeatureFlag;
  default_payments_per_region?: FeatureFlag;
}

/**
 * Utility type for partial country flag updates
 */
export type PartialCountryFlags = Partial<CountryFlags>;
