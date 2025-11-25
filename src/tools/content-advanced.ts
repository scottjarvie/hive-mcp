/**
 * Advanced Content Tools Implementation
 * 
 * Summary: Provides advanced content tools for replies, votes, notifications, discussions.
 * Purpose: Read-only advanced content retrieval from the Hive blockchain.
 * Key elements: contentEngagement (consolidated dispatcher)
 * Dependencies: utils/response, utils/error, utils/api, transaction.js, social.js
 * Last update: Tool consolidation - added dispatcher function
 */

import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi, callBridgeApi } from '../utils/api.js';
import { voteOnPost } from './transaction.js';
import { reblogPost } from './social.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for content engagement operations
 * Handles: vote, reblog, get_replies, get_votes, get_reblogged_by
 */
export async function contentEngagement(
  params: {
    action: 'vote' | 'reblog' | 'get_replies' | 'get_votes' | 'get_reblogged_by';
    author: string;
    permlink: string;
    weight?: number;
  }
): Promise<Response> {
  switch (params.action) {
    case 'vote':
      if (params.weight === undefined) {
        return errorResponse('Error: Weight is required for vote action (-10000 to 10000)');
      }
      return voteOnPost({
        author: params.author,
        permlink: params.permlink,
        weight: params.weight,
      });
    case 'reblog':
      return reblogPost({
        author: params.author,
        permlink: params.permlink,
      });
    case 'get_replies':
      return getContentReplies({
        author: params.author,
        permlink: params.permlink,
      });
    case 'get_votes':
      return getActiveVotes({
        author: params.author,
        permlink: params.permlink,
      });
    case 'get_reblogged_by':
      return getRebloggedBy({
        author: params.author,
        permlink: params.permlink,
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
  params: { author: string; permlink: string }
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
      created: reply.created,
      last_update: reply.last_update,
      depth: reply.depth,
      children: reply.children,
      votes: reply.net_votes,
      payout: reply.pending_payout_value,
      url: `https://hive.blog/@${reply.author}/${reply.permlink}`,
    }));

    return successJson({
      post: `@${params.author}/${params.permlink}`,
      reply_count: formattedReplies.length,
      replies: formattedReplies,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_content_replies'));
  }
}

/**
 * Get all votes on a specific post with voter details
 */
export async function getActiveVotes(
  params: { author: string; permlink: string }
): Promise<Response> {
  try {
    const votes = await callCondenserApi<RawVote[]>(
      'get_active_votes',
      [params.author, params.permlink]
    );

    const formattedVotes: FormattedVote[] = votes.map((vote) => ({
      voter: vote.voter,
      weight: vote.weight,
      percent: vote.percent,
      time: vote.time,
      rshares: String(vote.rshares),
    }));

    // Calculate vote summary
    const upvotes = votes.filter(v => v.weight > 0).length;
    const downvotes = votes.filter(v => v.weight < 0).length;

    return successJson({
      post: `@${params.author}/${params.permlink}`,
      total_votes: votes.length,
      upvotes,
      downvotes,
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
  params: { author: string; permlink: string }
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

    return successJson({
      post: `@${params.author}/${params.permlink}`,
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
      date: notif.date,
      message: notif.msg,
      url: notif.url ? `https://hive.blog${notif.url}` : null,
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
 */
export async function getDiscussion(
  params: { author: string; permlink: string }
): Promise<Response> {
  try {
    // Bridge API returns a map of author/permlink -> content
    const discussion = await callBridgeApi<Record<string, DiscussionEntry>>(
      'get_discussion',
      { author: params.author, permlink: params.permlink }
    );

    if (!discussion || Object.keys(discussion).length === 0) {
      return errorResponse(`Error: Discussion not found: @${params.author}/${params.permlink}`);
    }

    // Convert the map to an array and organize by depth
    const entries = Object.values(discussion);
    
    // Find the root post
    const rootKey = `${params.author}/${params.permlink}`;
    const rootPost = discussion[rootKey];
    
    if (!rootPost) {
      return errorResponse(`Error: Root post not found: @${params.author}/${params.permlink}`);
    }

    // Separate root from replies
    const replies = entries.filter(
      e => !(e.author === params.author && e.permlink === params.permlink)
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
      created: entry.created,
      depth: entry.depth,
      children: entry.children,
      votes: entry.net_votes,
      payout: entry.pending_payout_value,
      url: `https://hive.blog/@${entry.author}/${entry.permlink}`,
    });

    return successJson({
      root_post: formatEntry(rootPost),
      total_replies: replies.length,
      max_depth: replies.length > 0 ? Math.max(...replies.map(r => r.depth)) : 0,
      replies: replies.map(formatEntry),
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_discussion'));
  }
}

