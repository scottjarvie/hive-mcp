/**
 * Advanced Content Schemas
 * 
 * Summary: Zod schemas for advanced content tools.
 * Purpose: Input validation for content replies, votes, notifications, discussions.
 * Key elements: contentEngagementSchema (consolidated)
 * Dependencies: zod
 * Last update: Added username support and vote pagination/sorting parameters
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for content engagement operations
 * Combines: vote, reblog, get_replies, get_votes, get_reblogged_by
 * 
 * Supports two modes:
 * 1. author + permlink: Target a specific post
 * 2. username: Target the user's latest post (auto-resolved)
 */
export const contentEngagementSchema = z.object({
  action: z.enum(['vote', 'reblog', 'get_replies', 'get_votes', 'get_reblogged_by']).describe(
    'Action: vote, reblog, get_replies, get_votes, or get_reblogged_by'
  ),
  // Post identification - either author+permlink OR username
  author: z.string().optional().describe('Author of the post (or use username for latest post)'),
  permlink: z.string().optional().describe('Permlink of the post (or use username for latest post)'),
  username: z.string().optional().describe('Username to get engagement for their latest post (alternative to author+permlink)'),
  // Vote-specific
  weight: z.number().min(-10000).max(10000).optional().describe(
    'Vote weight: -10000 (100% downvote) to 10000 (100% upvote). Required for vote action.'
  ),
  // Pagination/sorting for get_votes action
  limit: z.number().min(1).max(100).optional().default(50).describe(
    'Max votes to return (for get_votes, default 50)'
  ),
  offset: z.number().min(0).optional().default(0).describe(
    'Pagination offset (for get_votes)'
  ),
  sort: z.enum(['size', 'time', 'voter']).optional().default('size').describe(
    'Sort order for votes: size (largest first, default), time (newest first), voter (alphabetical)'
  ),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for get_content_replies tool
export const getContentRepliesSchema = z.object({
  author: z.string().describe('Author of the post to get replies for'),
  permlink: z.string().describe('Permlink of the post to get replies for'),
});

// Schema for get_active_votes tool
export const getActiveVotesSchema = z.object({
  author: z.string().describe('Author of the post to get votes for'),
  permlink: z.string().describe('Permlink of the post to get votes for'),
});

// Schema for get_reblogged_by tool
export const getRebloggedBySchema = z.object({
  author: z.string().describe('Author of the post'),
  permlink: z.string().describe('Permlink of the post'),
});

// Schema for get_account_notifications tool
export const getAccountNotificationsSchema = z.object({
  account: z.string().describe('Hive account to get notifications for'),
  limit: z.number().min(1).max(100).default(50).describe('Maximum number of notifications to return'),
  last_id: z.number().optional().describe('Last notification ID for pagination'),
});

// Schema for get_discussion tool
// Supports two modes: author+permlink OR username (for latest post)
export const getDiscussionSchema = z.object({
  author: z.string().optional().describe('Author of the root post (or use username for latest post)'),
  permlink: z.string().optional().describe('Permlink of the root post (or use username for latest post)'),
  username: z.string().optional().describe('Username to get discussion for their latest post (alternative to author+permlink)'),
});

// Schema for update_post tool
export const updatePostSchema = z.object({
  author: z.string().describe('Author of the post (must match authenticated user)'),
  permlink: z.string().describe('Permlink of the post to update'),
  title: z.string().optional().describe('New title for the post (optional, keeps original if not provided)'),
  body: z.string().describe('New body content for the post'),
  tags: z.array(z.string()).optional().describe('New tags for the post (optional, keeps original if not provided)'),
});

// Schema for delete_comment tool
export const deleteCommentSchema = z.object({
  author: z.string().describe('Author of the post/comment to delete (must match authenticated user)'),
  permlink: z.string().describe('Permlink of the post/comment to delete'),
});

