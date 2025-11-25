/**
 * Community-related schemas
 * 
 * Summary: Zod schemas for community tools.
 * Purpose: Input validation for Hive community operations.
 * Key elements: getCommunitySchema, subscribeCommunitySchema, listCommunitiesSchema
 * Dependencies: zod
 * Last update: Phase 2 - Hivemind social features
 */

import { z } from 'zod';

// Community sort options
export const communitySortSchema = z.enum(['rank', 'new', 'subs']).default('rank');

// Schema for get_community tool
export const getCommunitySchema = z.object({
  name: z.string().describe('Community name (e.g., "hive-123456")'),
  observer: z.string().optional().describe('Optional observer account for context'),
});

// Schema for list_communities tool
export const listCommunitiesSchema = z.object({
  last: z.string().optional().describe('Last community name for pagination'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum number of communities to return'),
  query: z.string().optional().describe('Search query to filter communities'),
  sort: communitySortSchema.describe('Sort order: "rank", "new", or "subs"'),
});

// Schema for get_community_subscribers tool
export const getCommunitySubscribersSchema = z.object({
  community: z.string().describe('Community name (e.g., "hive-123456")'),
  last: z.string().optional().describe('Last subscriber for pagination'),
  limit: z.number().min(1).max(100).default(50).describe('Maximum number of subscribers to return'),
});

// Schema for subscribe_community tool
export const subscribeCommunitySchema = z.object({
  community: z.string().describe('Community name to subscribe to (e.g., "hive-123456")'),
});

// Schema for unsubscribe_community tool
export const unsubscribeCommunitySchema = z.object({
  community: z.string().describe('Community name to unsubscribe from (e.g., "hive-123456")'),
});

