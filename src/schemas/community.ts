/**
 * Community-related schemas
 * 
 * Summary: Zod schemas for community tools.
 * Purpose: Input validation for Hive community operations.
 * Key elements: communityMembershipSchema, communityInfoSchema
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related community operations
 */

import { z } from 'zod';

// Community sort options
export const communitySortSchema = z.enum(['rank', 'new', 'subs']).default('rank');

// =========================================================================
// CONSOLIDATED SCHEMAS
// =========================================================================

/**
 * Consolidated schema for community membership actions
 * Combines: subscribe_community, unsubscribe_community, get_community_subscribers
 */
export const communityMembershipSchema = z.object({
  action: z.enum(['subscribe', 'unsubscribe', 'get_subscribers']).describe(
    'Action to perform: subscribe, unsubscribe, or get_subscribers'
  ),
  community: z.string().describe('Community name (e.g., "hive-123456")'),
  last: z.string().optional().describe('Last subscriber for pagination (for get_subscribers)'),
  limit: z.number().min(1).max(100).optional().default(50).describe('Maximum subscribers to return (for get_subscribers)'),
});

/**
 * Consolidated schema for community info queries
 * Combines: get_community, list_communities
 */
export const communityInfoSchema = z.object({
  action: z.enum(['get_community', 'list_communities']).describe(
    'Action to perform: get_community or list_communities'
  ),
  name: z.string().optional().describe('Community name for get_community (e.g., "hive-123456")'),
  observer: z.string().optional().describe('Optional observer account for context'),
  last: z.string().optional().describe('Last community name for pagination (for list_communities)'),
  limit: z.number().min(1).max(100).optional().default(20).describe('Maximum communities to return (for list_communities)'),
  query: z.string().optional().describe('Search query to filter (for list_communities)'),
  sort: communitySortSchema.optional().describe('Sort order: "rank", "new", or "subs" (for list_communities)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

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

