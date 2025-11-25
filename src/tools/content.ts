/**
 * Content Retrieval Tools Implementation
 * 
 * Summary: Provides tools for fetching Hive posts and content.
 * Purpose: Read-only content retrieval from the Hive blockchain.
 * Key elements: getPosts (consolidated dispatcher)
 * Dependencies: utils/response, utils/error, utils/api, utils/date
 * Last update: Added reblog support with bridge.get_account_posts API
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
      created: formatDate(content.created),
      last_update: formatDate(content.last_update),
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
      created: formatDate(post.created),
      votes: post.net_votes,
      payout: post.pending_payout_value,
      url: `https://hive.blog/@${post.author}/${post.permlink}`,
    }));

    return successJson(formattedPosts);
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
  author_reputation: number;
  stats?: {
    total_votes: number;
    gray: boolean;
    hide: boolean;
  };
  payout?: number;
  pending_payout_value?: string;
  reblogged_by?: string[];  // Array of accounts that reblogged (when in blog view)
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
 */
export async function getPostsByUser(
  params: { 
    category: string; 
    username: string; 
    limit: number;
  }
): Promise<Response> {
  try {
    // Use bridge.get_account_posts API which provides reblog metadata
    const posts = await callBridgeApi<BridgePost[]>('get_account_posts', {
      account: params.username,
      sort: params.category,  // posts, blog, feed, comments, replies
      limit: params.limit,
    });

    if (!posts || !Array.isArray(posts)) {
      return successJson({
        username: params.username,
        category: params.category,
        result_type: getCategoryLabel(params.category),
        count: 0,
        items: [],
      });
    }

    // Format posts with reblog metadata
    const formattedPosts = posts.map((post) => {
      // Determine if this is a reblog (author differs from queried user in blog view)
      const isReblog = params.category === 'blog' && post.author !== params.username;
      
      return {
        title: post.title || '(comment)',
        author: post.author,
        permlink: post.permlink,
        created: formatDate(post.created),
        votes: post.stats?.total_votes || 0,
        payout: post.payout || post.pending_payout_value || '0',
        reputation: post.author_reputation,
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
