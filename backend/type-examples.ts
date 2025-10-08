// Example usage of the corrected dynamic country configuration types

import { 
  FeatureFlagsConfig, 
  CountryCode, 
  CountryFlags,
  FeatureFlag,
  GetFeatureFlagsResponse,
  PartialCountryFlags
} from './src/types';

// ✅ Your JSON configuration now perfectly matches our corrected type system:
const exampleConfig: FeatureFlagsConfig = {
  "FI": {
    "allow_mobile_payments": {
      "enabled": false
    },
    "default_payments_per_region": {
      "enabled": true
    }
  },
  "IN": {
    "allow_mobile_payments": {
      "enabled": false
    },
    "default_payments_per_region": {
      "enabled": true
    }
  },
  "HK": {
    "allow_mobile_payments": {
      "enabled": false
    },
    "default_payments_per_region": {
      "enabled": true
    }
  }
};

// Example of adding a new country with the correct structure:
const newCountryExample: CountryFlags = {
  allow_mobile_payments: { enabled: true },
  default_payments_per_region: { enabled: false }
};

// Partial updates using the corrected types:
const partialUpdate: PartialCountryFlags = {
  allow_mobile_payments: { enabled: true }
  // default_payments_per_region remains unchanged
};

// API Response format:
const apiResponse: GetFeatureFlagsResponse = {
  config: exampleConfig
};

// Type safety: This will work with ANY valid ISO country code
function addNewCountry(countryCode: CountryCode): CountryFlags {
  return {
    allow_mobile_payments: { enabled: false },
    default_payments_per_region: { enabled: true }
  };
}

// Examples of valid country codes (ISO 3166 Alpha-3):
const validCountries = [
  "USA", "CAN", "GBR", "DEU", "FRA", "JPN", "AUS", 
  "BRA", "RUS", "CHN", "IND", "ZAF", "MEX", "ARG"
];

export { exampleConfig, newCountryExample, partialUpdate, apiResponse };