/**
 * Social-related schemas
 * 
 * Summary: Zod schemas for social tools (follow, mute, reblog).
 * Purpose: Input validation for Hivemind social operations.
 * Key elements: socialRelationshipSchema, socialInfoSchema, reblogPostSchema
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related social operations
 */

import { z } from 'zod';

// Follow type enum
export const followTypeSchema = z.enum(['blog', 'ignore']).default('blog');

// =========================================================================
// CONSOLIDATED SCHEMAS
// =========================================================================

/**
 * Consolidated schema for social relationship actions (follow/unfollow/mute/unmute)
 * Combines: follow_account, unfollow_account, mute_account, unmute_account
 */
export const socialRelationshipSchema = z.object({
  action: z.enum(['follow', 'unfollow', 'mute', 'unmute']).describe(
    'Action to perform: follow, unfollow, mute, or unmute'
  ),
  account: z.string().describe('Target Hive account'),
});

/**
 * Consolidated schema for social info queries (followers/following/count)
 * Combines: get_followers, get_following, get_follow_count
 */
export const socialInfoSchema = z.object({
  action: z.enum(['get_followers', 'get_following', 'get_follow_count']).describe(
    'Action to perform: get_followers, get_following, or get_follow_count'
  ),
  account: z.string().describe('Hive account to query'),
  start: z.string().optional().default('').describe('Start account for pagination (for get_followers/get_following)'),
  type: followTypeSchema.optional().describe('Type filter: "blog" for followers/following, "ignore" for muted'),
  limit: z.number().min(1).max(1000).optional().default(100).describe('Maximum results (for get_followers/get_following)'),
});

// Schema for reblog_post tool (standalone - different parameters)
export const reblogPostSchema = z.object({
  author: z.string().describe('Author of the post to reblog'),
  permlink: z.string().describe('Permlink of the post to reblog'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for get_followers tool
export const getFollowersSchema = z.object({
  account: z.string().describe('Hive account to get followers for'),
  start: z.string().optional().default('').describe('Start account for pagination'),
  type: followTypeSchema.describe('Type of followers: "blog" for followers, "ignore" for muted'),
  limit: z.number().min(1).max(1000).default(100).describe('Maximum number of followers to return'),
});

// Schema for get_following tool
export const getFollowingSchema = z.object({
  account: z.string().describe('Hive account to get following list for'),
  start: z.string().optional().default('').describe('Start account for pagination'),
  type: followTypeSchema.describe('Type of following: "blog" for followed, "ignore" for muted'),
  limit: z.number().min(1).max(1000).default(100).describe('Maximum number of accounts to return'),
});

// Schema for get_follow_count tool
export const getFollowCountSchema = z.object({
  account: z.string().describe('Hive account to get follow counts for'),
});

// Schema for follow_account tool
export const followAccountSchema = z.object({
  account: z.string().describe('Hive account to follow'),
});

// Schema for unfollow_account tool
export const unfollowAccountSchema = z.object({
  account: z.string().describe('Hive account to unfollow'),
});

// Schema for mute_account tool
export const muteAccountSchema = z.object({
  account: z.string().describe('Hive account to mute'),
});

// Schema for unmute_account tool
export const unmuteAccountSchema = z.object({
  account: z.string().describe('Hive account to unmute'),
});

