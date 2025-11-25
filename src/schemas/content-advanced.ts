/**
 * Advanced Content Schemas
 * 
 * Summary: Zod schemas for advanced content tools.
 * Purpose: Input validation for content replies, votes, notifications, discussions.
 * Key elements: getContentRepliesSchema, getActiveVotesSchema, getAccountNotificationsSchema
 * Dependencies: zod
 * Last update: Phase 3 - Advanced content features
 */

import { z } from 'zod';

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
export const getDiscussionSchema = z.object({
  author: z.string().describe('Author of the root post'),
  permlink: z.string().describe('Permlink of the root post'),
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

