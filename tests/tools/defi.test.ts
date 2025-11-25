/**
 * DeFi Tools Tests
 * 
 * Summary: Tests for rewards, savings, and conversion tools.
 * Purpose: Verify DeFi operations work correctly with WAX.
 * Dependencies: Jest, rewards/savings/conversions tools
 * Last update: Phase 4 - DeFi operations
 */

import { claimRewards, getRewardFund, getPendingRewards } from '../../src/tools/rewards.js';
import { transferToSavings, transferFromSavings, cancelSavingsWithdraw, getSavingsWithdrawals } from '../../src/tools/savings.js';
import { convertHbd, collateralizedConvert, getConversionRequests, getCurrentPriceFeed } from '../../src/tools/conversions.js';
import { canRunAuthenticatedTests, getTestUsername } from '../utils/test-helpers.js';

describe('DeFi Tools', () => {
  const testUsername = getTestUsername();
  const maybeDescribeAuth = canRunAuthenticatedTests() ? describe : describe.skip;

  // =========================================================================
  // Rewards Tools
  // =========================================================================

  describe('Rewards Tools', () => {
    describe('getRewardFund', () => {
      it('should fetch reward fund information', async () => {
        const result = await getRewardFund({ fund_name: 'post' });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.fund_name).toBe('post');
        expect(data.reward_balance).toBeDefined();
        expect(data.recent_claims).toBeDefined();
      });
    });

    describe('getPendingRewards', () => {
      it('should fetch pending rewards for an account', async () => {
        const result = await getPendingRewards({ account: testUsername });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.account).toBe(testUsername);
        expect(data.pending_rewards).toBeDefined();
        expect(data.pending_rewards.hive).toBeDefined();
        expect(data.pending_rewards.hbd).toBeDefined();
        expect(data.pending_rewards.vests).toBeDefined();
        expect(typeof data.has_pending_rewards).toBe('boolean');
      });

      it('should calculate HP equivalent for VESTS', async () => {
        const result = await getPendingRewards({ account: testUsername });
        const data = JSON.parse(result.content[0].text);
        expect(data.pending_rewards.hp_equivalent).toMatch(/^\d+\.\d{3} HP$/);
      });

      it('should return error for non-existent account', async () => {
        const result = await getPendingRewards({ account: 'nonexistentuser12345678901234567890' });
        expect(result.isError).toBe(true);
        // API may return "not found" or network errors
        expect(result.content[0].text).toMatch(/not found|error/i);
      });
    });

    maybeDescribeAuth('claimRewards (requires HIVE_USERNAME and HIVE_POSTING_KEY)', () => {
      it('should require credentials to claim rewards', async () => {
        const originalUsername = process.env.HIVE_USERNAME;
        const originalPostingKey = process.env.HIVE_POSTING_KEY;
        delete process.env.HIVE_USERNAME;
        delete process.env.HIVE_POSTING_KEY;

        const result = await claimRewards({});
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');

        process.env.HIVE_USERNAME = originalUsername;
        process.env.HIVE_POSTING_KEY = originalPostingKey;
      });
    });
  });

  // =========================================================================
  // Savings Tools
  // =========================================================================

  describe('Savings Tools', () => {
    describe('getSavingsWithdrawals', () => {
      it('should fetch savings withdrawals for an account', async () => {
        const result = await getSavingsWithdrawals({ account: testUsername });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.account).toBe(testUsername);
        expect(Array.isArray(data.pending_withdrawals)).toBe(true);
        expect(typeof data.withdrawal_count).toBe('number');
      });
    });

    maybeDescribeAuth('transferToSavings (requires HIVE_USERNAME and HIVE_ACTIVE_KEY)', () => {
      it('should require credentials for savings deposit', async () => {
        const originalUsername = process.env.HIVE_USERNAME;
        const originalActiveKey = process.env.HIVE_ACTIVE_KEY;
        delete process.env.HIVE_USERNAME;
        delete process.env.HIVE_ACTIVE_KEY;

        const result = await transferToSavings({ amount: 1.0, currency: 'HIVE' });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set');

        process.env.HIVE_USERNAME = originalUsername;
        process.env.HIVE_ACTIVE_KEY = originalActiveKey;
      });
    });

    maybeDescribeAuth('transferFromSavings (requires HIVE_USERNAME and HIVE_ACTIVE_KEY)', () => {
      it('should require credentials for savings withdrawal', async () => {
        const originalUsername = process.env.HIVE_USERNAME;
        const originalActiveKey = process.env.HIVE_ACTIVE_KEY;
        delete process.env.HIVE_USERNAME;
        delete process.env.HIVE_ACTIVE_KEY;

        const result = await transferFromSavings({ amount: 1.0, currency: 'HIVE' });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set');

        process.env.HIVE_USERNAME = originalUsername;
        process.env.HIVE_ACTIVE_KEY = originalActiveKey;
      });
    });

    maybeDescribeAuth('cancelSavingsWithdraw (requires HIVE_USERNAME and HIVE_ACTIVE_KEY)', () => {
      it('should require credentials to cancel withdrawal', async () => {
        const originalUsername = process.env.HIVE_USERNAME;
        const originalActiveKey = process.env.HIVE_ACTIVE_KEY;
        delete process.env.HIVE_USERNAME;
        delete process.env.HIVE_ACTIVE_KEY;

        const result = await cancelSavingsWithdraw({ request_id: 12345 });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set');

        process.env.HIVE_USERNAME = originalUsername;
        process.env.HIVE_ACTIVE_KEY = originalActiveKey;
      });
    });
  });

  // =========================================================================
  // Conversion Tools
  // =========================================================================

  describe('Conversion Tools', () => {
    describe('getCurrentPriceFeed', () => {
      it('should fetch current price feed', async () => {
        const result = await getCurrentPriceFeed({});
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.base).toBeDefined();
        expect(data.quote).toBeDefined();
        expect(data.hive_per_hbd).toBeDefined();
        expect(data.hbd_per_hive).toBeDefined();
      });

      it('should include exchange rates in response', async () => {
        const result = await getCurrentPriceFeed({});
        const data = JSON.parse(result.content[0].text);
        // Rates should be positive numbers
        expect(parseFloat(data.hive_per_hbd)).toBeGreaterThan(0);
        expect(parseFloat(data.hbd_per_hive)).toBeGreaterThan(0);
      });
    });

    describe('getConversionRequests', () => {
      it('should fetch conversion requests for an account', async () => {
        const result = await getConversionRequests({ account: testUsername });
        expect(result).toBeDefined();
        expect(result.isError).toBeUndefined();
        const data = JSON.parse(result.content[0].text);
        expect(data.account).toBe(testUsername);
        expect(Array.isArray(data.hbd_conversions)).toBe(true);
        expect(Array.isArray(data.collateralized_conversions)).toBe(true);
        expect(typeof data.total_pending).toBe('number');
      });
    });

    maybeDescribeAuth('convertHbd (requires HIVE_USERNAME and HIVE_ACTIVE_KEY)', () => {
      it('should require credentials for HBD conversion', async () => {
        const originalUsername = process.env.HIVE_USERNAME;
        const originalActiveKey = process.env.HIVE_ACTIVE_KEY;
        delete process.env.HIVE_USERNAME;
        delete process.env.HIVE_ACTIVE_KEY;

        const result = await convertHbd({ amount: 1.0 });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set');

        process.env.HIVE_USERNAME = originalUsername;
        process.env.HIVE_ACTIVE_KEY = originalActiveKey;
      });
    });

    maybeDescribeAuth('collateralizedConvert (requires HIVE_USERNAME and HIVE_ACTIVE_KEY)', () => {
      it('should require credentials for collateralized conversion', async () => {
        const originalUsername = process.env.HIVE_USERNAME;
        const originalActiveKey = process.env.HIVE_ACTIVE_KEY;
        delete process.env.HIVE_USERNAME;
        delete process.env.HIVE_ACTIVE_KEY;

        const result = await collateralizedConvert({ amount: 1.0 });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set');

        process.env.HIVE_USERNAME = originalUsername;
        process.env.HIVE_ACTIVE_KEY = originalActiveKey;
      });
    });
  });
});

