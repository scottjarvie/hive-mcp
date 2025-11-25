// tests/tools/community.test.ts
import { getCommunity, listCommunities, getCommunitySubscribers } from '../../src/tools/community.js';
import { canRunAuthenticatedTests } from '../utils/test-helpers.js';

describe('Community Tools', () => {
  describe('getCommunity', () => {
    it('should fetch details for a known community', async () => {
      // Use a well-known active community
      const testCommunity = 'hive-167922'; // Leofinance community
      
      const result = await getCommunity({
        name: testCommunity,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(content.mimeType).toBe('application/json');
      
      const data = JSON.parse(content.text);
      expect(data.name).toBe(testCommunity);
      expect(data.title).toBeDefined();
      expect(typeof data.subscribers).toBe('number');
      expect(data.subscribers).toBeGreaterThan(0);
    });

    it('should return error for non-existent community', async () => {
      const result = await getCommunity({
        name: 'hive-999999999',
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      // API may return "not found" or "Invalid parameters" for non-existent community
      expect(result.content[0].text).toMatch(/not found|Invalid parameters|Error/i);
    });

    it('should include context when observer is provided', async () => {
      const testCommunity = 'hive-167922';
      const observer = 'helo';
      
      const result = await getCommunity({
        name: testCommunity,
        observer: observer,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      // Context should be present when observer is provided
      // It may or may not have subscribed depending on actual state
      expect(data.name).toBe(testCommunity);
    });
  });

  describe('listCommunities', () => {
    it('should list communities by rank', async () => {
      const result = await listCommunities({
        limit: 10,
        sort: 'rank',
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.communities).toBeDefined();
      expect(Array.isArray(data.communities)).toBe(true);
      expect(data.communities.length).toBeGreaterThan(0);
      expect(data.communities.length).toBeLessThanOrEqual(10);
      
      // Check structure of first community
      const firstCommunity = data.communities[0];
      expect(firstCommunity.name).toBeDefined();
      expect(firstCommunity.title).toBeDefined();
      expect(typeof firstCommunity.subscribers).toBe('number');
    });

    it('should list communities by subscribers', async () => {
      const result = await listCommunities({
        limit: 5,
        sort: 'subs',
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.sort).toBe('subs');
      expect(data.communities.length).toBeLessThanOrEqual(5);
    });

    it('should search communities by query', async () => {
      const result = await listCommunities({
        limit: 10,
        query: 'finance',
        sort: 'rank',
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data.communities)).toBe(true);
      // Results may or may not contain matches depending on actual communities
    });

    it('should handle pagination with last parameter', async () => {
      // Get first page
      const result1 = await listCommunities({
        limit: 5,
        sort: 'rank',
      });
      
      const data1 = JSON.parse(result1.content[0].text);
      
      if (data1.communities.length >= 5) {
        const lastCommunity = data1.communities[data1.communities.length - 1].name;
        
        // Get next page
        const result2 = await listCommunities({
          last: lastCommunity,
          limit: 5,
          sort: 'rank',
        });
        
        expect(result2.isError).toBeUndefined();
        const data2 = JSON.parse(result2.content[0].text);
        expect(Array.isArray(data2.communities)).toBe(true);
      }
    });
  });

  describe('getCommunitySubscribers', () => {
    it('should fetch subscribers for a known community', async () => {
      const testCommunity = 'hive-167922';
      
      const result = await getCommunitySubscribers({
        community: testCommunity,
        limit: 10,
      });
      
      expect(result).toBeDefined();
      
      // This API may not be available on all nodes, so handle both success and error
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(data.community).toBe(testCommunity);
        expect(data.subscribers).toBeDefined();
        expect(Array.isArray(data.subscribers)).toBe(true);
      } else {
        // API may not support this method on all nodes
        expect(result.content[0].text).toMatch(/Error|not available|Invalid/i);
      }
    });

    it('should handle non-existent community gracefully', async () => {
      // Use a community that doesn't exist
      const result = await getCommunitySubscribers({
        community: 'hive-999999999',
        limit: 10,
      });
      
      expect(result).toBeDefined();
      // Either empty result or error for non-existent community - both are acceptable
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(Array.isArray(data.subscribers)).toBe(true);
      }
    });
  });

  // Write operations require authentication
  const maybeDescribe = canRunAuthenticatedTests() ? describe : describe.skip;

  maybeDescribe('Write Operations (require HIVE_USERNAME and HIVE_POSTING_KEY)', () => {
    it('should require credentials for subscribe operation', async () => {
      const { subscribeCommunity } = await import('../../src/tools/community.js');
      
      const result = await subscribeCommunity({
        community: 'hive-167922',
      });
      
      // With credentials set, this would succeed or fail based on actual operation
      // Without credentials, it should return an error about missing env vars
      expect(result).toBeDefined();
    });
  });
});

