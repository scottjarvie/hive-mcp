/**
 * Social Tools Implementation
 * 
 * Summary: Provides tools for social interactions on the Hive blockchain.
 * Purpose: Follow, mute, and reblog operations via Hivemind.
 * Key elements: socialRelationship, socialInfo (consolidated dispatchers)
 * Dependencies: @hiveio/wax, config/client, utils/api, utils/response, utils/error
 * Last update: Tool consolidation - added dispatcher functions
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi } from '../utils/api.js';

// =============================================================================
// CONSOLIDATED DISPATCHERS
// =============================================================================

/**
 * Consolidated dispatcher for social relationship actions
 * Handles: follow, unfollow, mute, unmute
 */
export async function socialRelationship(
  params: {
    action: 'follow' | 'unfollow' | 'mute' | 'unmute';
    account: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'follow':
      return followAccount({ account: params.account });
    case 'unfollow':
      return unfollowAccount({ account: params.account });
    case 'mute':
      return muteAccount({ account: params.account });
    case 'unmute':
      return unmuteAccount({ account: params.account });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

/**
 * Consolidated dispatcher for social info queries
 * Handles: get_followers, get_following, get_follow_count
 */
export async function socialInfo(
  params: {
    action: 'get_followers' | 'get_following' | 'get_follow_count';
    account: string;
    start?: string;
    type?: string;
    limit?: number;
  }
): Promise<Response> {
  switch (params.action) {
    case 'get_followers':
      return getFollowers({
        account: params.account,
        start: params.start || '',
        type: params.type || 'blog',
        limit: params.limit || 100,
      });
    case 'get_following':
      return getFollowing({
        account: params.account,
        start: params.start || '',
        type: params.type || 'blog',
        limit: params.limit || 100,
      });
    case 'get_follow_count':
      return getFollowCount({ account: params.account });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

// Type definitions for follow operations
interface FollowEntry {
  follower: string;
  following: string;
  what: string[];
}

interface FollowCount {
  account: string;
  follower_count: number;
  following_count: number;
}

/**
 * Get followers for an account
 * Uses condenser_api.get_followers
 */
export async function getFollowers(
  params: {
    account: string;
    start: string;
    type: string;
    limit: number;
  }
): Promise<Response> {
  try {
    const followers = await callCondenserApi<FollowEntry[]>('get_followers', [
      params.account,
      params.start || '',
      params.type || 'blog',
      params.limit || 100,
    ]);

    const formattedFollowers = followers.map((f) => ({
      follower: f.follower,
      following: f.following,
      type: f.what,
    }));

    return successJson({
      account: params.account,
      type: params.type || 'blog',
      followers_count: formattedFollowers.length,
      followers: formattedFollowers,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_followers'));
  }
}

/**
 * Get accounts that a user follows
 * Uses condenser_api.get_following
 */
export async function getFollowing(
  params: {
    account: string;
    start: string;
    type: string;
    limit: number;
  }
): Promise<Response> {
  try {
    const following = await callCondenserApi<FollowEntry[]>('get_following', [
      params.account,
      params.start || '',
      params.type || 'blog',
      params.limit || 100,
    ]);

    const formattedFollowing = following.map((f) => ({
      follower: f.follower,
      following: f.following,
      type: f.what,
    }));

    return successJson({
      account: params.account,
      type: params.type || 'blog',
      following_count: formattedFollowing.length,
      following: formattedFollowing,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_following'));
  }
}

/**
 * Get follow count for an account
 * Uses condenser_api.get_follow_count
 */
export async function getFollowCount(
  params: { account: string }
): Promise<Response> {
  try {
    const counts = await callCondenserApi<FollowCount>('get_follow_count', [
      params.account,
    ]);

    return successJson({
      account: counts.account,
      follower_count: counts.follower_count,
      following_count: counts.following_count,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_follow_count'));
  }
}

/**
 * Follow an account
 * Broadcasts a custom_json follow operation
 */
export async function followAccount(
  params: { account: string }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Create the follow custom_json operation
    // Format: ["follow", {"follower": "user", "following": "target", "what": ["blog"]}]
    const followJson = JSON.stringify([
      'follow',
      {
        follower: username,
        following: params.account,
        what: ['blog'],
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'follow',
        json: followJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      follower: username,
      following: params.account,
      action: 'follow',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'follow_account'));
  }
}

/**
 * Unfollow an account
 * Broadcasts a custom_json follow operation with empty what array
 */
export async function unfollowAccount(
  params: { account: string }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Unfollow is a follow operation with empty what array
    const unfollowJson = JSON.stringify([
      'follow',
      {
        follower: username,
        following: params.account,
        what: [],
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'follow',
        json: unfollowJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      follower: username,
      unfollowed: params.account,
      action: 'unfollow',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'unfollow_account'));
  }
}

/**
 * Mute an account
 * Broadcasts a custom_json follow operation with "ignore" in what array
 */
export async function muteAccount(
  params: { account: string }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Mute is a follow operation with "ignore" in what array
    const muteJson = JSON.stringify([
      'follow',
      {
        follower: username,
        following: params.account,
        what: ['ignore'],
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'follow',
        json: muteJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      follower: username,
      muted: params.account,
      action: 'mute',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'mute_account'));
  }
}

/**
 * Unmute an account
 * Broadcasts a custom_json follow operation with empty what array
 */
export async function unmuteAccount(
  params: { account: string }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Unmute is the same as unfollow - empty what array
    const unmuteJson = JSON.stringify([
      'follow',
      {
        follower: username,
        following: params.account,
        what: [],
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'follow',
        json: unmuteJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      follower: username,
      unmuted: params.account,
      action: 'unmute',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'unmute_account'));
  }
}

/**
 * Reblog a post
 * Broadcasts a custom_json reblog operation
 */
export async function reblogPost(
  params: { author: string; permlink: string }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Reblog custom_json format
    const reblogJson = JSON.stringify([
      'reblog',
      {
        account: username,
        author: params.author,
        permlink: params.permlink,
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'follow',
        json: reblogJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      reblogger: username,
      author: params.author,
      permlink: params.permlink,
      action: 'reblog',
      post_url: `https://hive.blog/@${params.author}/${params.permlink}`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'reblog_post'));
  }
}

