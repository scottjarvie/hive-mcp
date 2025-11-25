// Global setup for Jest tests
import 'dotenv/config';

// Define the environment requirements interface
interface EnvRequirements {
  required: string[];
  recommended: string[];
}

// Default requirements
const defaultRequirements: EnvRequirements = {
  required: ['HIVE_USERNAME'],
  recommended: [
    'HIVE_POSTING_KEY',
    'HIVE_ACTIVE_KEY',
    'HIVE_MEMO_KEY',
    'HIVE_OWNER_KEY'
  ]
};

// Use environment requirements from Jest config if available, otherwise use defaults
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
const requirements: EnvRequirements = globalAny.ENV_REQUIREMENTS || defaultRequirements;

// Environment variables state (export for use in tests)
export const ENV_STATUS = {
  missing: {
    required: requirements.required.filter((varName: string) => !process.env[varName]),
    recommended: requirements.recommended.filter((varName: string) => !process.env[varName])
  },
  available: {
    required: requirements.required.filter((varName: string) => !!process.env[varName]),
    recommended: requirements.recommended.filter((varName: string) => !!process.env[varName])
  }
};
