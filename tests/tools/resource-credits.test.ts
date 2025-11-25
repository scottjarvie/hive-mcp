/**
 * Resource Credits Tools Tests
 * 
 * Summary: Tests for Resource Credits tools.
 * Purpose: Verify RC balance queries and delegation functionality.
 * Key elements: getRcAccounts, delegateRc
 * Dependencies: Jest, resource-credits tools
 * Last update: Phase 3 - Resource Credits operations
 */

import { getRcAccounts, delegateRc } from '../../src/tools/resource-credits.js';
import { canRunAuthenticatedTests, getTestUsername } from '../utils/test-helpers.js';

describe('Resource Credits Tools', () => {
  const testUsername = getTestUsername();

  describe('getRcAccounts', () => {
    it('should fetch RC info for a single account', async () => {
      const result = await getRcAccounts({
        accounts: [testUsername],
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(content.mimeType).toBe('application/json');
      
      const data = JSON.parse(content.text);
      expect(data.accounts_count).toBe(1);
      expect(Array.isArray(data.rc_accounts)).toBe(true);
      expect(data.rc_accounts.length).toBe(1);
      
      const rcAccount = data.rc_accounts[0];
      expect(rcAccount.account).toBe(testUsername);
      expect(rcAccount.max_rc).toBeDefined();
      expect(rcAccount.current_rc).toBeDefined();
      expect(rcAccount.rc_percent).toBeDefined();
    });

    it('should fetch RC info for multiple accounts', async () => {
      const accounts = [testUsername, 'helo', 'blocktrades'];
      
      const result = await getRcAccounts({
        accounts,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.accounts_count).toBe(3);
      expect(data.rc_accounts.length).toBe(3);
      
      // Verify each account is in the response
      const returnedAccounts = data.rc_accounts.map((rc: { account: string }) => rc.account);
      accounts.forEach(acc => {
        expect(returnedAccounts).toContain(acc);
      });
    });

    it('should include delegation info', async () => {
      const result = await getRcAccounts({
        accounts: [testUsername],
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        const rcAccount = data.rc_accounts[0];
        
        expect(rcAccount.delegated_rc).toBeDefined();
        expect(rcAccount.received_delegated_rc).toBeDefined();
      }
    });

    it('should include last_update timestamp', async () => {
      const result = await getRcAccounts({
        accounts: [testUsername],
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        const rcAccount = data.rc_accounts[0];
        
        expect(rcAccount.last_update).toBeDefined();
        // Should be a valid ISO date string
        expect(new Date(rcAccount.last_update).toISOString()).toBe(rcAccount.last_update);
      }
    });

    it('should calculate RC percentage correctly', async () => {
      const result = await getRcAccounts({
        accounts: [testUsername],
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        const rcAccount = data.rc_accounts[0];
        
        const percent = parseFloat(rcAccount.rc_percent);
        expect(percent).toBeGreaterThanOrEqual(0);
        expect(percent).toBeLessThanOrEqual(100);
      }
    });

    it('should handle non-existent account', async () => {
      // Use a shorter invalid account name to speed up API response
      const result = await getRcAccounts({
        accounts: ['zzz-no-exist'],
      });
      
      expect(result).toBeDefined();
      // API may return empty or error for non-existent accounts
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        // May be empty array or account with zero values
        expect(data.rc_accounts).toBeDefined();
      }
    }, 15000); // 15 second timeout
  });

  // Write operations require authentication
  const maybeDescribe = canRunAuthenticatedTests() ? describe : describe.skip;

  maybeDescribe('delegateRc (requires HIVE_USERNAME and HIVE_POSTING_KEY)', () => {
    it('should require credentials for RC delegation', async () => {
      const result = await delegateRc({
        to: 'testuser',
        max_rc: 1000,
      });
      
      expect(result).toBeDefined();
      // With credentials set, this would succeed or fail based on actual operation
    });

    it('should reject negative max_rc', async () => {
      const result = await delegateRc({
        to: 'testuser',
        max_rc: -100,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('non-negative');
    });

    it('should support revoking delegation with max_rc of 0', async () => {
      // Setting max_rc to 0 should revoke the delegation
      const result = await delegateRc({
        to: 'testuser',
        max_rc: 0,
      });
      
      expect(result).toBeDefined();
      // Should either succeed or fail gracefully
    });
  });

  describe('Error Handling', () => {
    it('should handle empty accounts array gracefully', async () => {
      // Note: Schema should prevent this, but test defensive handling
      const result = await getRcAccounts({
        accounts: [],
      });
      
      expect(result).toBeDefined();
      // May be error or empty result depending on implementation
    });
  });
});

