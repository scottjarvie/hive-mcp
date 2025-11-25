// tests/config/index.test.ts
import * as configModule from '../../src/config/index.js';

// Helper function to check if environment variables exist
const hasEnv = (vars: string[]): boolean => 
  vars.every(varName => !!process.env[varName]);

describe('Configuration Module', () => {
  const originalEnv = { ...process.env };

  // Save original environment variables and restore them after tests
  beforeEach(() => {
    // Refresh the config with the current environment
    configModule.refreshEnvConfig();
  });

  afterAll(() => {
    // Restore original env
    process.env = originalEnv;
    configModule.refreshEnvConfig();
  });

  describe('Configuration Structure', () => {
    it('should have the expected structure', () => {
      expect(configModule).toBeDefined();
      expect(configModule.default).toBeDefined();
      const config = configModule.default;
      
      expect(config.hive).toBeDefined();
      expect(config.server).toBeDefined();
      expect(config.log).toBeDefined();
      
      // Server config
      expect(config.server.name).toBeDefined();
      expect(config.server.version).toBeDefined();
      
      // Log config
      expect(config.log.logLevel).toBeDefined();
      expect(['debug', 'info', 'warn', 'error']).toContain(config.log.logLevel);
    });
    
    it('should read environment variables for Hive credentials', () => {
      const config = configModule.default;
      // The values in config should match the environment variables
      expect(config.hive.username).toBe(process.env.HIVE_USERNAME);
      expect(config.hive.postingKey).toBe(process.env.HIVE_POSTING_KEY);
      expect(config.hive.activeKey).toBe(process.env.HIVE_ACTIVE_KEY);
      expect(config.hive.memoKey).toBe(process.env.HIVE_MEMO_KEY);
    });
  });
  
  describe('getConfig function', () => {
    it('should return the current configuration', () => {
      const currentConfig = configModule.getConfig();
      expect(currentConfig).toEqual(configModule.default);
    });
  });
  
  describe('validatePrivateKey function', () => {
    it('should return false for undefined keys', () => {
      expect(configModule.validatePrivateKey(undefined)).toBe(false);
    });
    
    it('should return false for invalid key formats', () => {
      expect(configModule.validatePrivateKey('invalid-key')).toBe(false);
      expect(configModule.validatePrivateKey('12345')).toBe(false);
      expect(configModule.validatePrivateKey('NOT_A_VALID_KEY')).toBe(false);
      // Key not starting with 5
      expect(configModule.validatePrivateKey('4WIF_KEY_INVALID_START')).toBe(false);
    });
    
    it('should validate correctly formatted WIF private keys', () => {
      // A valid WIF private key starts with '5' and is 51-52 characters of base58
      // Using a test key format that matches the validation rules
      const testKey = '5JdeC9P7Pbd1uGdFVEsJ41EkEnADbbHGq6p1BwFxm6txNBsQnsw';
      expect(configModule.validatePrivateKey(testKey)).toBe(true);
    });
    
    it('should reject keys with invalid characters', () => {
      // Base58 doesn't include 0, O, I, l
      expect(configModule.validatePrivateKey('5JdeC9P7Pbd1uGdFVEsJ41EkEnADbbHGq6p1BwFxm6txNBsQn0O')).toBe(false);
    });
  });
  
  describe('Authentication capability functions', () => {
    // Only run this test if required env vars are available or conditionally run part of it
    (hasEnv(['HIVE_USERNAME']) ? it : it.skip)('should check if authenticated operations are available', () => {
      // First with no credentials - directly modify the environment
      const username = process.env.HIVE_USERNAME;
      const postingKey = process.env.HIVE_POSTING_KEY;
      
      // Delete the environment variables
      delete process.env.HIVE_USERNAME;
      delete process.env.HIVE_POSTING_KEY;
      configModule.refreshEnvConfig();
      
      // Test with no credentials
      expect(configModule.canPerformAuthenticatedOperations()).toBe(false);
      
      // Restore environment variables if they existed
      if (username) process.env.HIVE_USERNAME = username;
      if (postingKey) process.env.HIVE_POSTING_KEY = postingKey;
      configModule.refreshEnvConfig();
      
      // Test with credentials if available
      if (username && postingKey && configModule.validatePrivateKey(postingKey)) {
        expect(configModule.canPerformAuthenticatedOperations()).toBe(true);
      }
    });
    
    (hasEnv(['HIVE_USERNAME']) ? it : it.skip)('should check if token transfers are available', () => {
      // First with no credentials - directly modify the environment
      const username = process.env.HIVE_USERNAME;
      const activeKey = process.env.HIVE_ACTIVE_KEY;
      
      // Delete the environment variables
      delete process.env.HIVE_USERNAME;
      delete process.env.HIVE_ACTIVE_KEY;
      configModule.refreshEnvConfig();
      
      // Test with no credentials
      expect(configModule.canPerformTokenTransfers()).toBe(false);
      
      // Restore environment variables if they existed
      if (username) process.env.HIVE_USERNAME = username;
      if (activeKey) process.env.HIVE_ACTIVE_KEY = activeKey;
      configModule.refreshEnvConfig();
      
      // Test with credentials if available
      if (username && activeKey && configModule.validatePrivateKey(activeKey)) {
        expect(configModule.canPerformTokenTransfers()).toBe(true);
      }
    });
  });
});
