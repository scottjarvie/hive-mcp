/**
 * Content Retrieval Tools Implementation
 * 
 * Summary: Provides tools for fetching Hive posts and content.
 * Purpose: Read-only content retrieval from the Hive blockchain.
 * Key elements: getPosts (consolidated dispatcher)
 * Dependencies: utils/response, utils/error, utils/api
 * Last update: Tool consolidation - added dispatcher function
 */

import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi } from '../utils/api.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for getting posts
 * Handles: by_tag, by_user, single
 */
export async function getPosts(
  params: {
    action: 'by_tag' | 'by_user' | 'single';
    author?: string;
    permlink?: string;
    tag?: string;
    category?: string;
    username?: string;
    limit?: number;
  }
): Promise<Response> {
  switch (params.action) {
    case 'single':
      if (!params.author || !params.permlink) {
        return errorResponse('Error: Author and permlink are required for single post action');
      }
      return getPostContent({ author: params.author, permlink: params.permlink });
    case 'by_tag':
      if (!params.tag || !params.category) {
        return errorResponse('Error: Tag and category are required for by_tag action');
      }
      return getPostsByTag({
        category: params.category,
        tag: params.tag,
        limit: params.limit || 10,
      });
    case 'by_user':
      if (!params.username || !params.category) {
        return errorResponse('Error: Username and category are required for by_user action');
      }
      return getPostsByUser({
        category: params.category,
        username: params.username,
        limit: params.limit || 10,
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

// Post interface for formatted posts
interface FormattedPost {
  title: string;
  author: string;
  permlink: string;
  created: string;
  votes: number;
  payout: string;
  url: string;
}

// Raw post from API
interface RawPost {
  title: string;
  author: string;
  permlink: string;
  created: string;
  net_votes: number;
  pending_payout_value: string;
  body?: string;
  last_update?: string;
  category?: string;
  json_metadata?: string;
}

/**
 * Get a specific post by author and permlink
 */
export async function getPostContent(
  params: { author: string; permlink: string }
): Promise<Response> {
  try {
    // Use direct API call for content
    const content = await callCondenserApi<RawPost>(
      'get_content',
      [params.author, params.permlink]
    );
    
    if (!content || !content.author) {
      return errorResponse(`Error: Post not found: ${params.author}/${params.permlink}`);
    }
    
    // Parse tags from json_metadata
    let tags: string[] = [];
    try {
      if (content.json_metadata) {
        const metadata = JSON.parse(content.json_metadata);
        tags = metadata.tags || [];
      }
    } catch {
      // Ignore JSON parse errors for metadata
    }
    
    return successJson({
      title: content.title,
      author: content.author,
      body: content.body,
      created: content.created,
      last_update: content.last_update,
      category: content.category,
      tags,
      url: `https://hive.blog/@${params.author}/${params.permlink}`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_post_content'));
  }
}

/**
 * Get posts by tag
 * Retrieves Hive posts filtered by a specific tag and sorted by a category
 */
export async function getPostsByTag(
  params: { 
    category: string; 
    tag: string; 
    limit: number;
  }
): Promise<Response> {
  try {
    // Map category to the appropriate condenser API method
    const methodMap: Record<string, string> = {
      trending: 'get_discussions_by_trending',
      hot: 'get_discussions_by_hot',
      created: 'get_discussions_by_created',
      active: 'get_discussions_by_active',
      promoted: 'get_discussions_by_promoted',
      votes: 'get_discussions_by_votes',
      children: 'get_discussions_by_children',
      cashout: 'get_discussions_by_cashout',
      comments: 'get_discussions_by_comments',
    };
    
    const method = methodMap[params.category] || 'get_discussions_by_trending';
    
    const posts = await callCondenserApi<RawPost[]>(method, [{
      tag: params.tag,
      limit: params.limit,
    }]);

    const formattedPosts: FormattedPost[] = posts.map((post) => ({
      title: post.title,
      author: post.author,
      permlink: post.permlink,
      created: post.created,
      votes: post.net_votes,
      payout: post.pending_payout_value,
      url: `https://hive.blog/@${post.author}/${post.permlink}`,
    }));

    return successJson(formattedPosts);
  } catch (error) {
    return errorResponse(handleError(error, 'get_posts_by_tag'));
  }
}

/**
 * Get posts by user
 * Retrieves posts authored by or in the feed of a specific Hive user
 */
export async function getPostsByUser(
  params: { 
    category: string; 
    username: string; 
    limit: number;
  }
): Promise<Response> {
  try {
    // For blog and feed queries, the username is provided as the tag parameter
    const methodMap: Record<string, string> = {
      blog: 'get_discussions_by_blog',
      feed: 'get_discussions_by_feed',
    };
    
    const method = methodMap[params.category] || 'get_discussions_by_blog';
    
    const posts = await callCondenserApi<RawPost[]>(method, [{
      tag: params.username,
      limit: params.limit,
    }]);

    const formattedPosts: FormattedPost[] = posts.map((post) => ({
      title: post.title,
      author: post.author,
      permlink: post.permlink,
      created: post.created,
      votes: post.net_votes,
      payout: post.pending_payout_value,
      url: `https://hive.blog/@${post.author}/${post.permlink}`,
    }));

    return successJson(formattedPosts);
  } catch (error) {
    return errorResponse(handleError(error, 'get_posts_by_user'));
  }
}
