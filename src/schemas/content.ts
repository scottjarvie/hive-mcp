/**
 * Content and Posting Schemas
 * 
 * Summary: Zod schemas for content reading and creation tools.
 * Purpose: Input validation for posts, comments, and content management.
 * Key elements: getPostsSchema, contentManageSchema (consolidated)
 * Dependencies: zod, common.js
 * Last update: Added get_latest_post action for fetching user's latest post with full content
 */

import { z } from 'zod';
import { tagsSchema, tagQueryCategories, userQueryCategories, beneficiariesSchema } from './common.js';

// =========================================================================
// CONSOLIDATED SCHEMAS
// =========================================================================

/**
 * Consolidated schema for getting posts
 * Combines: get_post_content, get_posts_by_tag, get_posts_by_user, get_latest_post
 */
export const getPostsSchema = z.object({
  action: z.enum(['by_tag', 'by_user', 'single', 'get_latest_post']).describe(
    'Action: by_tag (posts by tag/category), by_user (user posts/feed/comments), single (one specific post), or get_latest_post (user\'s latest post with full content)'
  ),
  // For single post
  author: z.string().optional().describe('Author of the post (for single)'),
  permlink: z.string().optional().describe('Permlink of the post (for single)'),
  // For by_tag
  tag: z.string().optional().describe('Tag to filter posts (for by_tag)'),
  category: z.union([tagQueryCategories, userQueryCategories]).optional().describe(
    'Sort/filter: For by_tag: trending/hot/created/etc. For by_user: posts (authored only), blog (includes reblogs), feed (from followed), comments, replies'
  ),
  // For by_user and get_latest_post
  username: z.string().optional().describe('Username to get posts/comments for (for by_user, get_latest_post)'),
  // Common
  limit: z.number().min(1).max(20).optional().default(10).describe('Number of items to return (1-20)'),
});

/**
 * Consolidated schema for content management (create, update, delete)
 * Combines: create_post, create_comment, update_post, delete_comment
 */
export const contentManageSchema = z.object({
  action: z.enum(['create_post', 'create_comment', 'update', 'delete']).describe(
    'Action: create_post, create_comment, update, or delete'
  ),
  // For create_post
  title: z.string().min(1).max(256).optional().describe('Post title (for create_post, update)'),
  body: z.string().min(1).optional().describe('Content body with Markdown (for create_post, create_comment, update)'),
  tags: tagsSchema.optional().describe('Tags as comma-separated string or array (for create_post)'),
  // For create_comment
  parent_author: z.string().optional().describe('Parent post/comment author (for create_comment)'),
  parent_permlink: z.string().optional().describe('Parent post/comment permlink (for create_comment)'),
  // For update/delete
  author: z.string().optional().describe('Author of post to update/delete (must be you)'),
  permlink: z.string().optional().describe('Permlink of post to update/delete, or custom permalink for new content'),
  // Common options
  beneficiaries: beneficiariesSchema.optional().describe('Beneficiaries for rewards'),
  max_accepted_payout: z.string().optional().describe('Maximum payout (e.g. "1000.000 HBD")'),
  percent_hbd: z.number().min(0).max(10000).optional().describe('Percent HBD in rewards (0-10000)'),
  allow_votes: z.boolean().optional().default(true).describe('Allow votes on content'),
  allow_curation_rewards: z.boolean().optional().default(true).describe('Allow curation rewards'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for get_post_content tool
export const getPostContentSchema = z.object({
  author: z.string().describe('Author of the post'),
  permlink: z.string().describe('Permlink of the post'),
});

// Schema for get_posts_by_tag tool
export const getPostsByTagSchema = z.object({
  category: tagQueryCategories.describe(
    'Sorting category for posts (e.g. trending, hot, created)'
  ),
  tag: z.string().describe('The tag to filter posts by'),
  limit: z
    .number()
    .min(1)
    .max(20)
    .default(10)
    .describe('Number of posts to return (1-20)'),
});

// Schema for get_posts_by_user tool
export const getPostsByUserSchema = z.object({
  category: userQueryCategories.describe(
    'Type of content: posts (authored only), blog (includes reblogs), feed (from followed), comments, replies'
  ),
  username: z.string().describe('Hive username to fetch posts/comments for'),
  limit: z
    .number()
    .min(1)
    .max(20)
    .default(10)
    .describe('Number of items to return (1-20)'),
});

// Schema for create_post tool
export const createPostSchema = z.object({
  title: z.string().min(1).max(256).describe('Title of the blog post'),
  body: z
    .string()
    .min(1)
    .describe('Content of the blog post, can include Markdown formatting'),
  tags: tagsSchema.describe(
    'Tags for the post. Can be provided as comma-separated string \'blog,life,writing\' or array'
  ),
  beneficiaries: beneficiariesSchema.describe(
    'Optional list of beneficiaries to receive a portion of the rewards'
  ),
  permalink: z
    .string()
    .optional()
    .describe(
      'Optional custom permalink. If not provided, one will be generated from the title'
    ),
  max_accepted_payout: z
    .string()
    .optional()
    .describe('Optional maximum accepted payout (e.g. \'1000.000 HBD\')'),
  percent_hbd: z
    .number()
    .min(0)
    .max(10000)
    .optional()
    .describe(
      'Optional percent of HBD in rewards (0-10000, where 10000 = 100%)'
    ),
  allow_votes: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to allow votes on the post'),
  allow_curation_rewards: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to allow curation rewards'),
});

// Schema for create_comment tool
export const createCommentSchema = z.object({
  parent_author: z
    .string()
    .describe('Username of the post author or comment you\'re replying to'),
  parent_permlink: z
    .string()
    .describe('Permlink of the post or comment you\'re replying to'),
  body: z
    .string()
    .min(1)
    .describe('Content of the comment, can include Markdown formatting'),
  permalink: z
    .string()
    .optional()
    .describe(
      'Optional custom permalink for your comment. If not provided, one will be generated'
    ),
  beneficiaries: beneficiariesSchema.describe(
    'Optional list of beneficiaries to receive a portion of the rewards'
  ),
  max_accepted_payout: z
    .string()
    .optional()
    .describe('Optional maximum accepted payout (e.g. \'1000.000 HBD\')'),
  percent_hbd: z
    .number()
    .min(0)
    .max(10000)
    .optional()
    .describe(
      'Optional percent of HBD in rewards (0-10000, where 10000 = 100%)'
    ),
  allow_votes: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to allow votes on the comment'),
  allow_curation_rewards: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to allow curation rewards'),
});
