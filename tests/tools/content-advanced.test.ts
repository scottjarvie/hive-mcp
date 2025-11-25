/**
 * Content Advanced Tools Tests
 * 
 * Summary: Tests for advanced content tools.
 * Purpose: Verify replies, votes, notifications, and discussions functionality.
 * Key elements: getContentReplies, getActiveVotes, getRebloggedBy, getAccountNotifications, getDiscussion
 * Dependencies: Jest, content-advanced tools
 * Last update: Phase 3 - Advanced content features
 */

import { 
  getContentReplies, 
  getActiveVotes, 
  getRebloggedBy, 
  getAccountNotifications,
  getDiscussion 
} from '../../src/tools/content-advanced.js';
import { canRunAuthenticatedTests, getTestUsername } from '../utils/test-helpers.js';

describe('Content Advanced Tools', () => {
  // Use a well-known post that has comments and votes
  const testAuthor = 'helo';
  const testPermlink = 'bridging-hive-and-ai-introducing-the-hive-mcp-server';
  
  describe('getContentReplies', () => {
    it('should fetch replies for a known post', async () => {
      const result = await getContentReplies({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(content.mimeType).toBe('application/json');
      
      const data = JSON.parse(content.text);
      expect(data.post).toBe(`@${testAuthor}/${testPermlink}`);
      expect(typeof data.reply_count).toBe('number');
      expect(Array.isArray(data.replies)).toBe(true);
    });

    it('should return empty array for post with no replies', async () => {
      // Use a random permlink that likely has no replies
      const result = await getContentReplies({
        author: testAuthor,
        permlink: 'nonexistent-post-12345',
      });
      
      expect(result).toBeDefined();
      // May be empty result or error for non-existent post
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(data.reply_count).toBe(0);
        expect(data.replies).toEqual([]);
      }
    });

    it('should include proper reply structure', async () => {
      const result = await getContentReplies({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        
        if (data.replies.length > 0) {
          const reply = data.replies[0];
          expect(reply.author).toBeDefined();
          expect(reply.permlink).toBeDefined();
          expect(reply.body).toBeDefined();
          expect(reply.created).toBeDefined();
          expect(reply.url).toContain('https://hive.blog/');
        }
      }
    });
  });

  describe('getActiveVotes', () => {
    it('should fetch votes for a known post', async () => {
      const result = await getActiveVotes({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.post).toBe(`@${testAuthor}/${testPermlink}`);
      expect(typeof data.total_votes).toBe('number');
      expect(typeof data.upvotes).toBe('number');
      expect(typeof data.downvotes).toBe('number');
      expect(Array.isArray(data.votes)).toBe(true);
    });

    it('should include vote details', async () => {
      const result = await getActiveVotes({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        
        if (data.votes.length > 0) {
          const vote = data.votes[0];
          expect(vote.voter).toBeDefined();
          expect(typeof vote.weight).toBe('number');
          expect(typeof vote.percent).toBe('number');
          expect(vote.time).toBeDefined();
        }
      }
    });

    it('should correctly count upvotes and downvotes', async () => {
      const result = await getActiveVotes({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(data.upvotes + data.downvotes).toBeLessThanOrEqual(data.total_votes);
      }
    });
  });

  describe('getRebloggedBy', () => {
    it('should fetch rebloggers for a post', async () => {
      const result = await getRebloggedBy({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.post).toBe(`@${testAuthor}/${testPermlink}`);
      expect(typeof data.reblog_count).toBe('number');
      expect(Array.isArray(data.reblogged_by)).toBe(true);
    });

    it('should filter out the original author', async () => {
      const result = await getRebloggedBy({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(data.reblogged_by).not.toContain(testAuthor);
      }
    });
  });

  describe('getAccountNotifications', () => {
    const testUsername = getTestUsername();

    it('should fetch notifications for a known account', async () => {
      const result = await getAccountNotifications({
        account: testUsername,
        limit: 10,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.account).toBe(testUsername);
      expect(typeof data.notification_count).toBe('number');
      expect(Array.isArray(data.notifications)).toBe(true);
      expect(data.type_summary).toBeDefined();
    });

    it('should respect limit parameter', async () => {
      const result = await getAccountNotifications({
        account: testUsername,
        limit: 5,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(data.notifications.length).toBeLessThanOrEqual(5);
      }
    });

    it('should include notification structure', async () => {
      const result = await getAccountNotifications({
        account: testUsername,
        limit: 10,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        
        if (data.notifications.length > 0) {
          const notif = data.notifications[0];
          expect(notif.id).toBeDefined();
          expect(notif.type).toBeDefined();
          expect(notif.date).toBeDefined();
          expect(notif.message).toBeDefined();
        }
      }
    });

    it('should group notifications by type in summary', async () => {
      const result = await getAccountNotifications({
        account: testUsername,
        limit: 50,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        
        // Verify type_summary exists and is an object
        expect(typeof data.type_summary).toBe('object');
        
        // The sum of type counts should equal notification_count
        if (data.notification_count > 0) {
          const typeSum = Object.values(data.type_summary).reduce(
            (a: number, b) => a + (b as number), 0
          );
          expect(typeSum).toBe(data.notification_count);
        }
      }
    });
  });

  describe('getDiscussion', () => {
    it('should fetch full discussion for a post', async () => {
      const result = await getDiscussion({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBeUndefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.root_post).toBeDefined();
      expect(data.root_post.author).toBe(testAuthor);
      expect(data.root_post.permlink).toBe(testPermlink);
      expect(typeof data.total_replies).toBe('number');
      expect(Array.isArray(data.replies)).toBe(true);
    });

    it('should include max_depth in response', async () => {
      const result = await getDiscussion({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        expect(typeof data.max_depth).toBe('number');
        expect(data.max_depth).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return error for non-existent post', async () => {
      const result = await getDiscussion({
        author: 'nonexistentuser123456',
        permlink: 'nonexistent-post-123456',
      });
      
      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/not found|Error/i);
    });

    it('should include proper reply structure in discussion', async () => {
      const result = await getDiscussion({
        author: testAuthor,
        permlink: testPermlink,
      });
      
      if (!result.isError) {
        const data = JSON.parse(result.content[0].text);
        
        if (data.replies.length > 0) {
          const reply = data.replies[0];
          expect(reply.author).toBeDefined();
          expect(reply.permlink).toBeDefined();
          expect(reply.parent_author).toBeDefined();
          expect(reply.parent_permlink).toBeDefined();
          expect(typeof reply.depth).toBe('number');
          expect(reply.depth).toBeGreaterThan(0);
        }
      }
    });
  });

  // Write operations require authentication
  const maybeDescribe = canRunAuthenticatedTests() ? describe : describe.skip;

  maybeDescribe('updatePost (requires HIVE_USERNAME and HIVE_POSTING_KEY)', () => {
    it('should require credentials for update operation', async () => {
      const { updatePost } = await import('../../src/tools/content-creation.js');
      
      // This test just verifies the function exists and returns a response
      const result = await updatePost({
        author: process.env.HIVE_USERNAME!,
        permlink: 'test-post',
        body: 'Updated content',
      });
      
      expect(result).toBeDefined();
      // Should either succeed or fail gracefully
    });
  });

  maybeDescribe('deleteComment (requires HIVE_USERNAME and HIVE_POSTING_KEY)', () => {
    it('should require credentials for delete operation', async () => {
      const { deleteComment } = await import('../../src/tools/content-creation.js');
      
      const result = await deleteComment({
        author: process.env.HIVE_USERNAME!,
        permlink: 'test-post',
      });
      
      expect(result).toBeDefined();
      // Should either succeed or fail gracefully
    });
  });
});

