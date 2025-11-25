/**
 * Configuration Manager
 * 
 * Summary: Manages environment variables, settings, and key validation for the Hive MCP server.
 * Purpose: Centralizes configuration loading and validation.
 * Key elements: HiveConfig, AppConfig, validatePrivateKey, getConfig
 * Dependencies: fs, path
 * Last update: Migration from dhive to WAX library for key validation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Read package.json for server info
function getPackageInfo(): { name: string; version: string } {
  try {
    // Use process.cwd() which works in both ESM and CJS
    const packagePath = join(process.cwd(), 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      return {
        name: packageJson.name || 'HiveServer',
        version: packageJson.version || '1.0.0'
      };
    }
    return { name: 'HiveServer', version: '1.0.0' };
  } catch {
    // Fallback values if package.json cannot be read
    return { name: 'HiveServer', version: '1.0.0' };
  }
}

interface HiveConfig {
  username: string | undefined;
  postingKey: string | undefined;
  activeKey: string | undefined;
  memoKey: string | undefined;
  ownerKey?: string | undefined;
}

interface LogConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

interface ServerConfig {
  name: string;
  version: string;
}

interface AppConfig {
  hive: HiveConfig;
  server: ServerConfig;
  log: LogConfig;
}

// Create a function to read environment variables
const readEnvConfig = (): HiveConfig => {
  return {
    username: process.env.HIVE_USERNAME,
    postingKey: process.env.HIVE_POSTING_KEY,
    activeKey: process.env.HIVE_ACTIVE_KEY,
    memoKey: process.env.HIVE_MEMO_KEY,
    ownerKey: process.env.HIVE_OWNER_KEY,
  };
};

// Get package info for server configuration
const packageInfo = getPackageInfo();

// Default configuration
const defaultConfig: AppConfig = {
  hive: readEnvConfig(),
  server: {
    name: packageInfo.name,
    version: packageInfo.version,
  },
  log: {
    logLevel: 'info',
  },
};

/**
 * Validate a private key format (without logging the actual key)
 * WIF private keys start with '5' and are 51 characters long (standard format)
 */
export const validatePrivateKey = (key: string | undefined): boolean => {
  if (!key) return false;

  try {
    // WIF private key validation:
    // - Starts with '5' (for standard Hive/Bitcoin-style keys)
    // - Is 51 or 52 characters long
    // - Contains only base58 characters
    const base58Chars = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    
    if (!key.startsWith('5')) {
      return false;
    }
    
    if (key.length < 51 || key.length > 52) {
      return false;
    }
    
    if (!base58Chars.test(key)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

// Get the configuration
export const getConfig = (): AppConfig => {
  return defaultConfig;
};

// Refresh the environment variables in the config
export const refreshEnvConfig = (): void => {
  defaultConfig.hive = readEnvConfig();
};

// Check if the authenticated operations are available
export const canPerformAuthenticatedOperations = (): boolean => {
  // Always read the latest environment values
  refreshEnvConfig();
  
  const { username, postingKey } = defaultConfig.hive;
  return Boolean(username && postingKey && validatePrivateKey(postingKey));
};

// Check if token transfers are available
export const canPerformTokenTransfers = (): boolean => {
  // Always read the latest environment values
  refreshEnvConfig();
  
  const { username, activeKey } = defaultConfig.hive;
  return Boolean(username && activeKey && validatePrivateKey(activeKey));
};

export default defaultConfig;
