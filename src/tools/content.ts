/**
 * Content Retrieval Tools Implementation
 * 
 * Summary: Provides tools for fetching Hive posts and content.
 * Purpose: Read-only content retrieval from the Hive blockchain.
 * Key elements: getPosts (consolidated dispatcher)
 * Dependencies: utils/response, utils/error, utils/api, utils/date
 * Last update: Added 'since' date filter parameter for post analysis
 */

import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi, callBridgeApi } from '../utils/api.js';
import { formatDate } from '../utils/date.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for getting posts
 * Handles: by_tag, by_user, single, get_latest_post
 * 
 * @param since - Optional ISO date string to filter posts (e.g., "2025-10-25")
 *                Only returns posts created after this date
 */
export async function getPosts(
  params: {
    action: 'by_tag' | 'by_user' | 'single' | 'get_latest_post';
    author?: string;
    permlink?: string;
    tag?: string;
    category?: string;
    username?: string;
    limit?: number;
    since?: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'single':
      if (!params.author || !params.permlink) {
        return errorResponse('Error: Author and permlink are required for single post action');
      }
      return getPostContent({ author: params.author, permlink: params.permlink });
    case 'get_latest_post':
      if (!params.username) {
        return errorResponse('Error: Username is required for get_latest_post action');
      }
      return getLatestPost({ username: params.username });
    case 'by_tag':
      if (!params.tag || !params.category) {
        return errorResponse('Error: Tag and category are required for by_tag action');
      }
      return getPostsByTag({
        category: params.category,
        tag: params.tag,
        limit: params.limit || 10,
        since: params.since,
      });
    case 'by_user':
      if (!params.username || !params.category) {
        return errorResponse('Error: Username and category are required for by_user action');
      }
      return getPostsByUser({
        category: params.category,
        username: params.username,
        limit: params.limit || 10,
        since: params.since,
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
 * Uses bridge.get_post for richer data including community info
 */
export async function getPostContent(
  params: { author: string; permlink: string }
): Promise<Response> {
  try {
    // Use bridge API for richer post data
    const content = await callBridgeApi<BridgePost>('get_post', {
      author: params.author,
      permlink: params.permlink,
    });
    
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
      permlink: content.permlink,
      body: content.body,
      created: formatDate(content.created),
      last_update: formatDate(content.updated),
      votes: content.stats?.total_votes || 0,
      payout: content.payout || content.pending_payout_value || '0',
      reputation: content.author_reputation,
      community: content.community_title || null,
      community_id: content.category || null,
      tags,
      excerpt: getPostExcerpt(content),
      url: `https://peakd.com/@${params.author}/${params.permlink}`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_post_content'));
  }
}

/**
 * Get the latest post by a user with full content
 * Fetches the most recent post and returns complete data in a single call
 */
export async function getLatestPost(
  params: { username: string }
): Promise<Response> {
  try {
    // Fetch the most recent post by the user
    const posts = await callBridgeApi<BridgePost[]>('get_account_posts', {
      account: params.username,
      sort: 'posts',  // Only authored posts, not reblogs
      limit: 1,
    });

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return errorResponse(`Error: No posts found for user: ${params.username}`);
    }

    const post = posts[0];
    
    // Parse tags from json_metadata
    let tags: string[] = [];
    try {
      if (post.json_metadata) {
        const metadata = JSON.parse(post.json_metadata);
        tags = metadata.tags || [];
      }
    } catch {
      // Ignore JSON parse errors for metadata
    }

    return successJson({
      title: post.title,
      author: post.author,
      permlink: post.permlink,
      body: post.body,
      created: formatDate(post.created),
      last_update: formatDate(post.updated),
      votes: post.stats?.total_votes || 0,
      payout: post.payout || post.pending_payout_value || '0',
      reputation: post.author_reputation,
      community: post.community_title || null,
      community_id: post.category || null,
      tags,
      excerpt: getPostExcerpt(post),
      url: `https://peakd.com/@${post.author}/${post.permlink}`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_latest_post'));
  }
}

/**
 * Get posts by tag
 * Retrieves Hive posts filtered by a specific tag and sorted by a category
 * Uses bridge.get_ranked_posts API for richer data including community and excerpts
 * 
 * @param since - Optional ISO date string to filter posts created after this date
 */
export async function getPostsByTag(
  params: { 
    category: string; 
    tag: string; 
    limit: number;
    since?: string;
  }
): Promise<Response> {
  try {
    // Fetch more posts if filtering by date (we'll filter client-side)
    const fetchLimit = params.since ? Math.min(params.limit * 3, 100) : params.limit;
    
    // Use bridge.get_ranked_posts which provides community data and better metadata
    const posts = await callBridgeApi<BridgePost[]>('get_ranked_posts', {
      sort: params.category,  // trending, hot, created, etc.
      tag: params.tag,
      limit: fetchLimit,
    });

    if (!posts || !Array.isArray(posts)) {
      return successJson({
        tag: params.tag,
        category: params.category,
        count: 0,
        items: [],
        ...(params.since && { since: params.since }),
      });
    }

    // Filter by date if since parameter provided
    let filteredPosts = posts;
    if (params.since) {
      const sinceDate = new Date(params.since);
      filteredPosts = posts.filter(post => {
        const postDate = new Date(post.created + 'Z');
        return postDate >= sinceDate;
      });
    }

    // Apply limit after filtering
    const limitedPosts = filteredPosts.slice(0, params.limit);

    const formattedPosts = limitedPosts.map((post) => ({
      title: post.title,
      author: post.author,
      permlink: post.permlink,
      created: formatDate(post.created),
      last_update: formatDate(post.updated),
      votes: post.stats?.total_votes || 0,
      payout: post.payout || post.pending_payout_value || '0',
      reputation: post.author_reputation,
      community: post.community_title || null,
      community_id: post.category || null,
      excerpt: getPostExcerpt(post),
      url: `https://peakd.com/@${post.author}/${post.permlink}`,
    }));

    return successJson({
      tag: params.tag,
      category: params.category,
      count: formattedPosts.length,
      ...(params.since && { since: params.since, total_before_filter: filteredPosts.length }),
      items: formattedPosts,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_posts_by_tag'));
  }
}

// Bridge API post interface (richer data than condenser API)
interface BridgePost {
  title: string;
  author: string;
  permlink: string;
  created: string;
  updated: string;
  body?: string;
  category: string;
  community?: string;
  community_title?: string;
  author_reputation: number;
  json_metadata?: string;
  stats?: {
    total_votes: number;
    gray: boolean;
    hide: boolean;
  };
  payout?: number;
  pending_payout_value?: string;
  reblogged_by?: string[];  // Array of accounts that reblogged (when in blog view)
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a clean text excerpt from post body
 * Strips markdown formatting and returns first N characters
 */
function createExcerpt(body: string | undefined, maxLength: number = 150): string {
  if (!body) return '';
  
  // Strip markdown images, links, and formatting
  const clean = body
    .replace(/!\[.*?\]\(.*?\)/g, '')           // Remove images ![alt](url)
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')     // Keep link text [text](url) -> text
    .replace(/#{1,6}\s*/g, '')                  // Remove heading markers
    .replace(/[*_~`]+/g, '')                    // Remove emphasis markers
    .replace(/<[^>]+>/g, '')                    // Remove HTML tags
    .replace(/\n+/g, ' ')                       // Normalize newlines to spaces
    .replace(/\s+/g, ' ')                       // Normalize multiple spaces
    .trim();
  
  if (clean.length <= maxLength) return clean;
  
  // Cut at word boundary
  const truncated = clean.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  return truncated.trim() + '...';
}

/**
 * Extract description from json_metadata or create excerpt from body
 */
function getPostExcerpt(post: BridgePost): string {
  // Try to get description from metadata first
  if (post.json_metadata) {
    try {
      const meta = JSON.parse(post.json_metadata);
      if (meta.description && typeof meta.description === 'string') {
        return meta.description;
      }
    } catch {
      // Ignore parse errors
    }
  }
  
  // Fallback to body excerpt
  return createExcerpt(post.body, 150);
}

/**
 * Get posts by user
 * Retrieves posts authored by, in the feed of, or comments/replies by a specific Hive user
 * Uses bridge.get_account_posts API for better data including reblog metadata
 * 
 * Categories:
 * - posts: Only posts authored by the user
 * - blog: Blog feed (authored posts + reblogs) with reblog metadata
 * - feed: Posts from accounts they follow
 * - comments: Comments made by the user
 * - replies: Replies to their posts
 * 
 * @param since - Optional ISO date string to filter posts created after this date
 */
export async function getPostsByUser(
  params: { 
    category: string; 
    username: string; 
    limit: number;
    since?: string;
  }
): Promise<Response> {
  try {
    // Fetch more posts if filtering by date (we'll filter client-side)
    const fetchLimit = params.since ? Math.min(params.limit * 3, 100) : params.limit;
    
    // Use bridge.get_account_posts API which provides reblog metadata
    const posts = await callBridgeApi<BridgePost[]>('get_account_posts', {
      account: params.username,
      sort: params.category,  // posts, blog, feed, comments, replies
      limit: fetchLimit,
    });

    if (!posts || !Array.isArray(posts)) {
      return successJson({
        username: params.username,
        category: params.category,
        result_type: getCategoryLabel(params.category),
        count: 0,
        items: [],
        ...(params.since && { since: params.since }),
      });
    }

    // Filter by date if since parameter provided
    let filteredPosts = posts;
    if (params.since) {
      const sinceDate = new Date(params.since);
      filteredPosts = posts.filter(post => {
        const postDate = new Date(post.created + 'Z');
        return postDate >= sinceDate;
      });
    }

    // Apply limit after filtering
    const limitedPosts = filteredPosts.slice(0, params.limit);

    // Format posts with reblog metadata, community, and excerpt
    const formattedPosts = limitedPosts.map((post) => {
      // Determine if this is a reblog (author differs from queried user in blog view)
      const isReblog = params.category === 'blog' && post.author !== params.username;
      
      return {
        title: post.title || '(comment)',
        author: post.author,
        permlink: post.permlink,
        created: formatDate(post.created),
        last_update: formatDate(post.updated),
        votes: post.stats?.total_votes || 0,
        payout: post.payout || post.pending_payout_value || '0',
        reputation: post.author_reputation,
        community: post.community_title || null,
        community_id: post.category || null,
        excerpt: getPostExcerpt(post),
        is_reblog: isReblog,
        reblogged_by: isReblog ? params.username : null,
        url: `https://peakd.com/@${post.author}/${post.permlink}`,
      };
    });

    // Calculate reblog stats for blog category
    const authoredCount = formattedPosts.filter(p => !p.is_reblog).length;
    const reblogCount = formattedPosts.filter(p => p.is_reblog).length;

    const response: Record<string, unknown> = {
      username: params.username,
      category: params.category,
      result_type: getCategoryLabel(params.category),
      count: formattedPosts.length,
      items: formattedPosts,
    };

    // Add date filter info if used
    if (params.since) {
      response.since = params.since;
      response.total_fetched = filteredPosts.length;
    }

    // Add reblog breakdown for blog category
    if (params.category === 'blog') {
      response.authored_count = authoredCount;
      response.reblog_count = reblogCount;
    }

    return successJson(response);
  } catch (error) {
    return errorResponse(handleError(error, 'get_posts_by_user'));
  }
}

/**
 * Get human-readable label for category
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    posts: 'authored posts',
    blog: 'blog posts',
    feed: 'feed posts',
    comments: 'comments',
    replies: 'replies',
  };
  return labels[category] || category;
}
