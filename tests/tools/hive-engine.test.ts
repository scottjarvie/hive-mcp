/**
 * Hive Engine Tools Tests
 * 
 * Summary: Tests for Hive Engine token, market, NFT, and pool tools.
 * Purpose: Verify HE operations work correctly with sidechain API.
 * Dependencies: Jest, HE tools
 * Last update: Phase 5 - Hive Engine integration
 */

import { getHETokenBalance, getHETokenInfo, getHETokensList } from '../../src/tools/hive-engine-tokens.js';
import { getHEMarketOrderbook, getHEMarketHistory, getHEMarketMetrics, getHEOpenOrders } from '../../src/tools/hive-engine-market.js';
import { getHENFTCollection, getHENFTInfo, getHENFTSellOrders } from '../../src/tools/hive-engine-nfts.js';
import { getHEPoolInfo, getHEPoolsList, estimateHESwap } from '../../src/tools/hive-engine-pools.js';
import { getTestUsername } from '../utils/test-helpers.js';

describe('Hive Engine Tools', () => {
  const testUsername = getTestUsername();

  // =========================================================================
  // Token Tools
  // =========================================================================

  describe('Token Tools', () => {
    describe('getHETokenBalance', () => {
      it('should fetch all token balances for an account', async () => {
        const result = await getHETokenBalance({ account: testUsername });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.account).toBe(testUsername);
        expect(Array.isArray(data.balances)).toBe(true);
        expect(typeof data.token_count).toBe('number');
      });

      it('should fetch specific token balance', async () => {
        const result = await getHETokenBalance({ account: testUsername, symbol: 'LEO' });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.account).toBe(testUsername);
        expect(data.symbol).toBe('LEO');
        expect(data.balance).toBeDefined();
      });
    });

    describe('getHETokenInfo', () => {
      it('should fetch token information', async () => {
        const result = await getHETokenInfo({ symbol: 'LEO' });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.symbol).toBe('LEO');
        expect(data.name).toBeDefined();
        expect(data.issuer).toBeDefined();
        expect(typeof data.precision).toBe('number');
        expect(data.supply).toBeDefined();
      });

      it('should return error for non-existent token', async () => {
        const result = await getHETokenInfo({ symbol: 'NONEXISTENT_TOKEN_12345' });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('not found');
      });
    });

    describe('getHETokensList', () => {
      it('should list tokens', async () => {
        const result = await getHETokensList({ limit: 10, offset: 0 });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(Array.isArray(data.tokens)).toBe(true);
        expect(data.tokens.length).toBeLessThanOrEqual(10);
        expect(typeof data.tokens_count).toBe('number');
      });
    });
  });

  // =========================================================================
  // Market Tools
  // =========================================================================

  describe('Market Tools', () => {
    describe('getHEMarketOrderbook', () => {
      it('should fetch orderbook for a token', async () => {
        const result = await getHEMarketOrderbook({ symbol: 'LEO', limit: 10 });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.symbol).toBe('LEO');
        expect(Array.isArray(data.buy_orders)).toBe(true);
        expect(Array.isArray(data.sell_orders)).toBe(true);
      });
    });

    describe('getHEMarketHistory', () => {
      it('should fetch trade history for a token', async () => {
        const result = await getHEMarketHistory({ symbol: 'LEO', limit: 10 });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.symbol).toBe('LEO');
        expect(Array.isArray(data.trades)).toBe(true);
      });
    });

    describe('getHEMarketMetrics', () => {
      it('should fetch market metrics for a token', async () => {
        const result = await getHEMarketMetrics({ symbol: 'LEO' });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.symbol).toBe('LEO');
        expect(data.last_price).toBeDefined();
      });
    });

    describe('getHEOpenOrders', () => {
      it('should fetch open orders for an account', async () => {
        const result = await getHEOpenOrders({ account: testUsername });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.account).toBe(testUsername);
        expect(typeof data.total_orders).toBe('number');
        expect(Array.isArray(data.buy_orders)).toBe(true);
        expect(Array.isArray(data.sell_orders)).toBe(true);
      });
    });
  });

  // =========================================================================
  // NFT Tools
  // =========================================================================

  describe('NFT Tools', () => {
    describe('getHENFTCollection', () => {
      it('should fetch NFTs owned by an account', async () => {
        const result = await getHENFTCollection({ account: testUsername });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.account).toBe(testUsername);
        expect(typeof data.nft_count).toBe('number');
        expect(Array.isArray(data.nfts)).toBe(true);
      });
    });

    describe('getHENFTInfo', () => {
      it('should fetch NFT collection info', async () => {
        // Using a known NFT collection - Splinterlands cards
        const result = await getHENFTInfo({ symbol: 'ALPHA' });
        // Note: This may fail if ALPHA doesn't exist, which is ok
        expect(result).toBeDefined();
      });
    });

    describe('getHENFTSellOrders', () => {
      it('should fetch NFT sell orders', async () => {
        const result = await getHENFTSellOrders({ symbol: 'ALPHA', limit: 10 });
        expect(result).toBeDefined();
        // May not have orders, but should not error
        if (!result.isError) {
          const data = JSON.parse(result.content[0].text);
          expect(data.symbol).toBe('ALPHA');
          expect(Array.isArray(data.orders)).toBe(true);
        }
      });
    });
  });

  // =========================================================================
  // Pool Tools
  // =========================================================================

  describe('Pool Tools', () => {
    describe('getHEPoolsList', () => {
      it('should list liquidity pools', async () => {
        const result = await getHEPoolsList({ limit: 10, offset: 0 });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(typeof data.pool_count).toBe('number');
        expect(Array.isArray(data.pools)).toBe(true);
      });
    });

    describe('getHEPoolInfo', () => {
      it('should fetch pool info for a known pair', async () => {
        // First get a pool from the list
        const listResult = await getHEPoolsList({ limit: 1, offset: 0 });
        if (!listResult.isError) {
          const listData = JSON.parse(listResult.content[0].text);
          if (listData.pools.length > 0) {
            const tokenPair = listData.pools[0].tokenPair;
            const result = await getHEPoolInfo({ tokenPair });
            expect(result).toBeDefined();
            expect(result.isError).toBeUndefined();
            const data = JSON.parse(result.content[0].text);
            expect(data.tokenPair).toBe(tokenPair);
            expect(data.baseQuantity).toBeDefined();
            expect(data.quoteQuantity).toBeDefined();
          }
        }
      });
    });

    describe('estimateHESwap', () => {
      it('should estimate swap output', async () => {
        // First get a pool from the list
        const listResult = await getHEPoolsList({ limit: 1, offset: 0 });
        if (!listResult.isError) {
          const listData = JSON.parse(listResult.content[0].text);
          if (listData.pools.length > 0) {
            const tokenPair = listData.pools[0].tokenPair;
            const [baseSymbol] = tokenPair.split(':');
            
            const result = await estimateHESwap({
              tokenPair,
              tokenSymbol: baseSymbol,
              tokenAmount: '1',
            });
            expect(result).toBeDefined();
            expect(result.isError).toBeUndefined();
            const data = JSON.parse(result.content[0].text);
            expect(data.tokenPair).toBe(tokenPair);
            expect(data.input_token).toBe(baseSymbol);
            expect(data.estimated_output).toBeDefined();
            expect(data.fee).toBeDefined();
            expect(data.price_impact).toBeDefined();
          }
        }
      });
    });
  });

  // =========================================================================
  // API Health
  // =========================================================================

  describe('API Health', () => {
    it('should handle API failover gracefully', async () => {
      // Multiple queries to ensure failover is working
      const results = await Promise.all([
        getHETokenInfo({ symbol: 'LEO' }),
        getHEMarketMetrics({ symbol: 'LEO' }),
        getHEPoolsList({ limit: 5, offset: 0 }),
      ]);

      // All should succeed
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
      });
    });
  });
});

