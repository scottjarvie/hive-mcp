/**
 * Hive WAX Chain Client Setup
 * 
 * Summary: Provides a singleton WAX chain instance for interacting with the Hive blockchain.
 * Purpose: Centralizes blockchain connection management using the WAX library.
 * Key elements: createHiveChain, getChain singleton pattern
 * Dependencies: @hiveio/wax
 * Last update: Migration from dhive to WAX library
 */

import { createHiveChain, type IHiveChainInterface } from '@hiveio/wax';

// WAX chain instance (singleton)
let chainInstance: IHiveChainInterface | null = null;

// API endpoint
const API_ENDPOINT = 'https://api.hive.blog';

/**
 * Get the WAX chain instance (singleton pattern)
 * Creates the chain on first call, returns cached instance on subsequent calls
 */
export async function getChain(): Promise<IHiveChainInterface> {
  if (!chainInstance) {
    chainInstance = await createHiveChain({
      apiEndpoint: API_ENDPOINT,
    });
  }
  return chainInstance;
}

/**
 * Reset the chain instance (useful for testing or reconnection)
 */
export function resetChain(): void {
  chainInstance = null;
}

export default getChain;
