/**
 * Social-related schemas
 * 
 * Summary: Zod schemas for social tools (follow, mute, reblog).
 * Purpose: Input validation for Hivemind social operations.
 * Key elements: getFollowersSchema, followAccountSchema, reblogPostSchema
 * Dependencies: zod
 * Last update: Phase 2 - Hivemind social features
 */

import { z } from 'zod';

// Follow type enum
export const followTypeSchema = z.enum(['blog', 'ignore']).default('blog');

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

// Schema for reblog_post tool
export const reblogPostSchema = z.object({
  author: z.string().describe('Author of the post to reblog'),
  permlink: z.string().describe('Permlink of the post to reblog'),
});

