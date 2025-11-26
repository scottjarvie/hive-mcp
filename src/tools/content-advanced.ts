/**
 * Advanced Content Tools Implementation
 * 
 * Summary: Provides advanced content tools for replies, votes, notifications, discussions.
 * Purpose: Read-only advanced content retrieval from the Hive blockchain.
 * Key elements: contentEngagement (consolidated dispatcher)
 * Dependencies: utils/response, utils/error, utils/api, utils/date, transaction.js, social.js
 * Last update: Added username support for latest post resolution, vote sorting/pagination
 */

import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi, callBridgeApi } from '../utils/api.js';
import { formatDate } from '../utils/date.js';
import { voteOnPost } from './transaction.js';
import { reblogPost } from './social.js';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Interface for Bridge API post (minimal fields needed for resolution)
interface BridgePostMinimal {
  author: string;
  permlink: string;
  title: string;
}

/**
 * Resolve a username to their latest post's author and permlink
 * Used to allow engagement queries by username instead of requiring author/permlink
 */
async function resolveLatestPost(username: string): Promise<{ 
  success: boolean; 
  author?: string; 
  permlink?: string;
  title?: string;
  error?: string;
}> {
  try {
    const posts = await callBridgeApi<BridgePostMinimal[]>('get_account_posts', {
      account: username,
      sort: 'posts',  // Only authored posts, not reblogs
      limit: 1,
    });
    
    if (posts && Array.isArray(posts) && posts.length > 0) {
      return { 
        success: true, 
        author: posts[0].author, 
        permlink: posts[0].permlink,
        title: posts[0].title,
      };
    }
    return { success: false, error: `No posts found for user @${username}` };
  } catch (error) {
    return { success: false, error: `Failed to fetch latest post for @${username}` };
  }
}

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for content engagement operations
 * Handles: vote, reblog, get_replies, get_votes, get_reblogged_by
 * 
 * Supports two modes for post identification:
 * 1. author + permlink: Target a specific post
 * 2. username: Automatically resolve to the user's latest post
 */
export async function contentEngagement(
  params: {
    action: 'vote' | 'reblog' | 'get_replies' | 'get_votes' | 'get_reblogged_by';
    author?: string;
    permlink?: string;
    username?: string;  // Alternative: resolve to user's latest post
    weight?: number;
    // Pagination/sorting for get_votes
    limit?: number;
    offset?: number;
    sort?: 'size' | 'time' | 'voter';
  }
): Promise<Response> {
  // Resolve post identification: either use author/permlink or resolve from username
  let author = params.author;
  let permlink = params.permlink;
  let resolvedFromUsername = false;
  let postTitle: string | undefined;

  if (params.username && (!author || !permlink)) {
    // Resolve username to their latest post
    const resolved = await resolveLatestPost(params.username);
    if (!resolved.success) {
      return errorResponse(`Error: ${resolved.error}`);
    }
    author = resolved.author;
    permlink = resolved.permlink;
    postTitle = resolved.title;
    resolvedFromUsername = true;
  }

  // Validate we have author and permlink
  if (!author || !permlink) {
    return errorResponse('Error: Either author+permlink or username is required');
  }

  switch (params.action) {
    case 'vote':
      if (params.weight === undefined) {
        return errorResponse('Error: Weight is required for vote action (-10000 to 10000)');
      }
      return voteOnPost({
        author,
        permlink,
        weight: params.weight,
      });
    case 'reblog':
      return reblogPost({
        author,
        permlink,
      });
    case 'get_replies':
      return getContentReplies({
        author,
        permlink,
        resolvedFromUsername,
        postTitle,
      });
    case 'get_votes':
      return getActiveVotes({
        author,
        permlink,
        resolvedFromUsername,
        postTitle,
        limit: params.limit,
        offset: params.offset,
        sort: params.sort,
      });
    case 'get_reblogged_by':
      return getRebloggedBy({
        author,
        permlink,
        resolvedFromUsername,
        postTitle,
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

// Interface for vote data from API
interface RawVote {
  voter: string;
  weight: number;
  rshares: string | number;
  percent: number;
  reputation: string | number;
  time: string;
}

// Interface for formatted vote
interface FormattedVote {
  voter: string;
  weight: number;
  percent: number;
  time: string;
  rshares: string;
}

// Interface for reply/comment from API
interface RawReply {
  author: string;
  permlink: string;
  parent_author: string;
  parent_permlink: string;
  title: string;
  body: string;
  created: string;
  last_update: string;
  depth: number;
  children: number;
  net_votes: number;
  pending_payout_value: string;
}

// Interface for notification from bridge API
interface RawNotification {
  id: number;
  type: string;
  score: number;
  date: string;
  msg: string;
  url: string;
}

// Interface for discussion entry
interface DiscussionEntry {
  author: string;
  permlink: string;
  parent_author: string;
  parent_permlink: string;
  title: string;
  body: string;
  created: string;
  depth: number;
  children: number;
  net_votes: number;
  pending_payout_value: string;
}

/**
 * Get all replies/comments on a specific post
 */
export async function getContentReplies(
  params: { 
    author: string; 
    permlink: string;
    resolvedFromUsername?: boolean;
    postTitle?: string;
  }
): Promise<Response> {
  try {
    const replies = await callCondenserApi<RawReply[]>(
      'get_content_replies',
      [params.author, params.permlink]
    );

    const formattedReplies = replies.map((reply) => ({
      author: reply.author,
      permlink: reply.permlink,
      parent_author: reply.parent_author,
      parent_permlink: reply.parent_permlink,
      body: reply.body,
      created: formatDate(reply.created),
      last_update: formatDate(reply.last_update),
      depth: reply.depth,
      children: reply.children,
      votes: reply.net_votes,
      payout: reply.pending_payout_value,
      url: `https://peakd.com/@${reply.author}/${reply.permlink}`,
    }));

    const postUrl = `https://peakd.com/@${params.author}/${params.permlink}`;

    return successJson({
      post: `@${params.author}/${params.permlink}`,
      post_title: params.postTitle || null,
      post_url: postUrl,
      ...(params.resolvedFromUsername && { resolved_from: 'latest post' }),
      reply_count: formattedReplies.length,
      replies: formattedReplies,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_content_replies'));
  }
}

/**
 * Get all votes on a specific post with voter details
 * Supports sorting by vote size (default), time, or voter name
 * Supports pagination via limit and offset
 */
export async function getActiveVotes(
  params: { 
    author: string; 
    permlink: string;
    resolvedFromUsername?: boolean;
    postTitle?: string;
    limit?: number;
    offset?: number;
    sort?: 'size' | 'time' | 'voter';
  }
): Promise<Response> {
  try {
    const votes = await callCondenserApi<RawVote[]>(
      'get_active_votes',
      [params.author, params.permlink]
    );

    // Calculate vote summary (before sorting/pagination)
    const upvotes = votes.filter(v => v.weight > 0).length;
    const downvotes = votes.filter(v => v.weight < 0).length;

    // Sort votes based on sort parameter (default: by size/rshares)
    const sortBy = params.sort || 'size';
    const sortedVotes = [...votes].sort((a, b) => {
      switch (sortBy) {
        case 'size':
          // Sort by absolute rshares value (largest first)
          return Math.abs(Number(b.rshares)) - Math.abs(Number(a.rshares));
        case 'time':
          // Sort by time (newest first)
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        case 'voter':
          // Sort alphabetically by voter name
          return a.voter.localeCompare(b.voter);
        default:
          return 0;
      }
    });

    // Apply pagination
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const paginatedVotes = sortedVotes.slice(offset, offset + limit);
    const hasMore = (offset + limit) < sortedVotes.length;

    // Format votes with percentage as human-readable
    const formattedVotes = paginatedVotes.map((vote) => ({
      voter: vote.voter,
      weight: vote.weight,
      percent: `${(vote.percent / 100).toFixed(2)}%`,
      time: formatDate(vote.time),
      rshares: String(vote.rshares),
    }));

    // Get top voter by rshares for summary
    const topVoter = sortedVotes.length > 0 
      ? sortedVotes.reduce((max, v) => 
          Math.abs(Number(v.rshares)) > Math.abs(Number(max.rshares)) ? v : max
        )
      : null;

    const postUrl = `https://peakd.com/@${params.author}/${params.permlink}`;

    return successJson({
      post: `@${params.author}/${params.permlink}`,
      post_title: params.postTitle || null,
      post_url: postUrl,
      ...(params.resolvedFromUsername && { resolved_from: 'latest post' }),
      // Summary stats
      total_votes: votes.length,
      upvotes,
      downvotes,
      top_voter: topVoter ? { 
        voter: topVoter.voter, 
        percent: `${(topVoter.percent / 100).toFixed(2)}%` 
      } : null,
      // Pagination info
      sort: sortBy,
      returned_count: formattedVotes.length,
      offset,
      has_more: hasMore,
      // Vote list
      votes: formattedVotes,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_active_votes'));
  }
}

/**
 * Get list of accounts that reblogged a specific post
 */
export async function getRebloggedBy(
  params: { 
    author: string; 
    permlink: string;
    resolvedFromUsername?: boolean;
    postTitle?: string;
  }
): Promise<Response> {
  try {
    const rebloggers = await callCondenserApi<string[]>(
      'get_reblogged_by',
      [params.author, params.permlink]
    );

    // Filter out the original author (they're always included)
    const actualRebloggers = rebloggers.filter(
      account => account !== params.author
    );

    const postUrl = `https://peakd.com/@${params.author}/${params.permlink}`;

    return successJson({
      post: `@${params.author}/${params.permlink}`,
      post_title: params.postTitle || null,
      post_url: postUrl,
      ...(params.resolvedFromUsername && { resolved_from: 'latest post' }),
      reblog_count: actualRebloggers.length,
      reblogged_by: actualRebloggers,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_reblogged_by'));
  }
}

/**
 * Get account notifications (mentions, replies, votes, etc.)
 */
export async function getAccountNotifications(
  params: { account: string; limit: number; last_id?: number }
): Promise<Response> {
  try {
    const requestParams: Record<string, unknown> = {
      account: params.account,
      limit: params.limit,
    };
    
    if (params.last_id !== undefined) {
      requestParams.last_id = params.last_id;
    }

    const notifications = await callBridgeApi<RawNotification[]>(
      'account_notifications',
      requestParams
    );

    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      date: formatDate(notif.date),
      message: notif.msg,
      url: notif.url ? `https://peakd.com${notif.url}` : null,
      score: notif.score,
    }));

    // Group by type for summary
    const typeCounts: Record<string, number> = {};
    notifications.forEach(n => {
      typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
    });

    return successJson({
      account: params.account,
      notification_count: notifications.length,
      type_summary: typeCounts,
      notifications: formattedNotifications,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_account_notifications'));
  }
}

/**
 * Get full threaded discussion for a post (root post + all nested replies)
 * Supports two modes:
 * 1. author + permlink: Get discussion for a specific post
 * 2. username: Get discussion for the user's latest post
 */
export async function getDiscussion(
  params: { author?: string; permlink?: string; username?: string }
): Promise<Response> {
  try {
    // Resolve post identification
    let author = params.author;
    let permlink = params.permlink;
    let resolvedFromUsername = false;

    if (params.username && (!author || !permlink)) {
      // Resolve username to their latest post
      const resolved = await resolveLatestPost(params.username);
      if (!resolved.success) {
        return errorResponse(`Error: ${resolved.error}`);
      }
      author = resolved.author;
      permlink = resolved.permlink;
      resolvedFromUsername = true;
    }

    // Validate we have author and permlink
    if (!author || !permlink) {
      return errorResponse('Error: Either author+permlink or username is required');
    }

    // Bridge API returns a map of author/permlink -> content
    const discussion = await callBridgeApi<Record<string, DiscussionEntry>>(
      'get_discussion',
      { author, permlink }
    );

    if (!discussion || Object.keys(discussion).length === 0) {
      return errorResponse(`Error: Discussion not found: @${author}/${permlink}`);
    }

    // Convert the map to an array and organize by depth
    const entries = Object.values(discussion);
    
    // Find the root post
    const rootKey = `${author}/${permlink}`;
    const rootPost = discussion[rootKey];
    
    if (!rootPost) {
      return errorResponse(`Error: Root post not found: @${author}/${permlink}`);
    }

    // Separate root from replies
    const replies = entries.filter(
      e => !(e.author === author && e.permlink === permlink)
    );

    // Sort replies by depth then by created date
    replies.sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });

    // Format entries
    const formatEntry = (entry: DiscussionEntry) => ({
      author: entry.author,
      permlink: entry.permlink,
      parent_author: entry.parent_author,
      parent_permlink: entry.parent_permlink,
      title: entry.title,
      body: entry.body,
      created: formatDate(entry.created),
      depth: entry.depth,
      children: entry.children,
      votes: entry.net_votes,
      payout: entry.pending_payout_value,
      url: `https://peakd.com/@${entry.author}/${entry.permlink}`,
    });

    const postUrl = `https://peakd.com/@${author}/${permlink}`;

    return successJson({
      ...(resolvedFromUsername && { resolved_from: 'latest post' }),
      post_url: postUrl,
      root_post: formatEntry(rootPost),
      total_replies: replies.length,
      max_depth: replies.length > 0 ? Math.max(...replies.map(r => r.depth)) : 0,
      replies: replies.map(formatEntry),
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_discussion'));
  }
}

