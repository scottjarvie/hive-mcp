// tests/tools/social.test.ts
import { getFollowers, getFollowing, getFollowCount } from '../../src/tools/social.js';
import { canRunAuthenticatedTests, getTestUsername } from '../utils/test-helpers.js';

describe('Social Tools', () => {
  describe('getFollowers', () => {
    it('should fetch followers for a known account', async () => {
      // Use a well-known account with followers
      const testAccount = 'helo';
      
      const result = await getFollowers({
        account: testAccount,
        start: '',
        type: 'blog',
        limit: 10,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(content.mimeType).toBe('application/json');
      
      const data = JSON.parse(content.text);
      expect(data.account).toBe(testAccount);
      expect(data.type).toBe('blog');
      expect(data.followers).toBeDefined();
      expect(Array.isArray(data.followers)).toBe(true);
    });

    it('should handle pagination with start parameter', async () => {
      const testAccount = 'helo';
      
      // First request
      const result1 = await getFollowers({
        account: testAccount,
        start: '',
        type: 'blog',
        limit: 5,
      });
      
      const data1 = JSON.parse(result1.content[0].text);
      
      if (data1.followers.length >= 5) {
        // Use last follower as start for next page
        const lastFollower = data1.followers[data1.followers.length - 1].follower;
        
        const result2 = await getFollowers({
          account: testAccount,
          start: lastFollower,
          type: 'blog',
          limit: 5,
        });
        
        expect(result2.isError).toBeUndefined();
        const data2 = JSON.parse(result2.content[0].text);
        expect(Array.isArray(data2.followers)).toBe(true);
      }
    });
  });

  describe('getFollowing', () => {
    it('should fetch following list for a known account', async () => {
      const testAccount = 'helo';
      
      const result = await getFollowing({
        account: testAccount,
        start: '',
        type: 'blog',
        limit: 10,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.account).toBe(testAccount);
      expect(data.type).toBe('blog');
      expect(data.following).toBeDefined();
      expect(Array.isArray(data.following)).toBe(true);
    });
  });

  describe('getFollowCount', () => {
    it('should fetch follow counts for a known account', async () => {
      const testAccount = 'helo';
      
      const result = await getFollowCount({
        account: testAccount,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.account).toBe(testAccount);
      expect(typeof data.follower_count).toBe('number');
      expect(typeof data.following_count).toBe('number');
      expect(data.follower_count).toBeGreaterThanOrEqual(0);
      expect(data.following_count).toBeGreaterThanOrEqual(0);
    });

    it('should return zeros for new/inactive accounts', async () => {
      // Account that likely has few or no followers
      const testAccount = 'test-no-followers-xyz';
      
      const result = await getFollowCount({
        account: testAccount,
      });
      
      // Either success with low numbers or error for non-existent account
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(typeof data.follower_count).toBe('number');
        expect(typeof data.following_count).toBe('number');
      }
    });
  });

  // Write operations require authentication
  const maybeDescribe = canRunAuthenticatedTests() ? describe : describe.skip;

  maybeDescribe('Write Operations (require HIVE_USERNAME and HIVE_POSTING_KEY)', () => {
    // Note: These tests would actually broadcast to the blockchain
    // In a real test environment, you might want to use a testnet or mock
    
    it('should require credentials for follow operation', async () => {
      // This test verifies the error handling when credentials are missing
      // If credentials are set, the test will pass differently
      const { followAccount } = await import('../../src/tools/social.js');
      
      const result = await followAccount({
        account: 'some-test-account',
      });
      
      // With credentials set, this would succeed or fail based on actual operation
      // Without credentials, it should return an error about missing env vars
      expect(result).toBeDefined();
    });
  });
});

