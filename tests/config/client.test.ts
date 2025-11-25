// tests/config/client.test.ts
import { getChain, resetChain } from '../../src/config/client.js';

describe('Hive WAX Chain Client', () => {
  // Reset the chain singleton before each test
  beforeEach(() => {
    resetChain();
  });

  it('should initialize WAX chain with API endpoint', async () => {
    // Act
    const chain = await getChain();
    
    // Assert - chain should be initialized
    expect(chain).toBeDefined();
    
    // Check chain has the WAX interface properties
    expect(chain).toHaveProperty('api');
    expect(chain).toHaveProperty('createTransaction');
    expect(chain).toHaveProperty('broadcast');
    
    // Verify API is accessible
    expect(chain.api).toBeDefined();
    expect(chain.api.database_api).toBeDefined();
  });
  
  it('should return same instance on subsequent calls (singleton)', async () => {
    // Act
    const chain1 = await getChain();
    const chain2 = await getChain();
    
    // Assert - should be the same instance
    expect(chain1).toBe(chain2);
  });
  
  it('should connect to the Hive blockchain', async () => {
    // This test ensures we can actually connect to the blockchain
    // by calling a simple API method
    
    const chain = await getChain();
    
    // We'll use get_dynamic_global_properties which requires no authentication
    const props = await chain.api.database_api.get_dynamic_global_properties({});
    
    // Verify we got a response with the expected structure
    expect(props).toBeDefined();
    expect(props.head_block_number).toBeDefined();
    expect(Number(props.head_block_number)).toBeGreaterThan(0);
    expect(props.time).toBeDefined();
    
    // Try to parse the time to ensure it's a valid date
    const blockTime = new Date(props.time);
    expect(blockTime.getTime()).not.toBeNaN();
    
    // The block time should be recent (within the last hour)
    const now = new Date();
    const timeDifferenceMs = now.getTime() - blockTime.getTime();
    expect(timeDifferenceMs).toBeLessThan(60 * 60 * 1000); // Less than 1 hour
  });
  
  it('should have database API accessible', async () => {
    const chain = await getChain();
    
    // Check database_api methods exist
    expect(chain.api.database_api).toBeDefined();
    expect(typeof chain.api.database_api.find_accounts).toBe('function');
    expect(typeof chain.api.database_api.get_dynamic_global_properties).toBe('function');
  });
  
  it('should have helper methods for asset creation', async () => {
    const chain = await getChain();
    
    // Check asset helper methods
    expect(typeof chain.hiveCoins).toBe('function');
    expect(typeof chain.hbdCoins).toBe('function');
    
    // Test creating assets
    const hiveAsset = chain.hiveCoins(10.5);
    const hbdAsset = chain.hbdCoins(5.25);
    
    expect(hiveAsset).toBeDefined();
    expect(hbdAsset).toBeDefined();
  });
  
  it('should be able to create transactions', async () => {
    const chain = await getChain();
    
    // Check we can create a transaction
    expect(typeof chain.createTransaction).toBe('function');
    
    const tx = await chain.createTransaction();
    expect(tx).toBeDefined();
    expect(typeof tx.pushOperation).toBe('function');
    expect(typeof tx.sign).toBe('function');
  });
});
