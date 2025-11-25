/**
 * Community Tools Implementation
 * 
 * Summary: Provides tools for Hive community interactions.
 * Purpose: Subscribe, unsubscribe, and query community data via Hivemind.
 * Key elements: communityMembership, communityInfo (consolidated dispatchers)
 * Dependencies: @hiveio/wax, config/client, utils/api, utils/response, utils/error
 * Last update: Tool consolidation - added dispatcher functions
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callBridgeApi } from '../utils/api.js';

// =============================================================================
// CONSOLIDATED DISPATCHERS
// =============================================================================

/**
 * Consolidated dispatcher for community membership actions
 * Handles: subscribe, unsubscribe, get_subscribers
 */
export async function communityMembership(
  params: {
    action: 'subscribe' | 'unsubscribe' | 'get_subscribers';
    community: string;
    last?: string;
    limit?: number;
  }
): Promise<Response> {
  switch (params.action) {
    case 'subscribe':
      return subscribeCommunity({ community: params.community });
    case 'unsubscribe':
      return unsubscribeCommunity({ community: params.community });
    case 'get_subscribers':
      return getCommunitySubscribers({
        community: params.community,
        last: params.last,
        limit: params.limit || 50,
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

/**
 * Consolidated dispatcher for community info queries
 * Handles: get_community, list_communities
 */
export async function communityInfo(
  params: {
    action: 'get_community' | 'list_communities';
    name?: string;
    observer?: string;
    last?: string;
    limit?: number;
    query?: string;
    sort?: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'get_community':
      if (!params.name) {
        return errorResponse('Error: Community name is required for get_community action');
      }
      return getCommunity({ name: params.name, observer: params.observer });
    case 'list_communities':
      return listCommunities({
        last: params.last,
        limit: params.limit || 20,
        query: params.query,
        sort: params.sort || 'rank',
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

// Type definitions for community data
interface CommunityData {
  id: number;
  name: string;
  title: string;
  about: string;
  lang: string;
  type_id: number;
  is_nsfw: boolean;
  subscribers: number;
  sum_pending: number;
  num_pending: number;
  num_authors: number;
  created_at: string;
  avatar_url: string;
  context?: {
    subscribed: boolean;
    role: string;
    title: string;
  };
  description: string;
  flag_text: string;
  settings: Record<string, unknown>;
  team: Array<[string, string, string]>;
}

interface CommunityListItem {
  id: number;
  name: string;
  title: string;
  about: string;
  lang: string;
  type_id: number;
  is_nsfw: boolean;
  subscribers: number;
  sum_pending: number;
  num_pending: number;
  num_authors: number;
  created_at: string;
  avatar_url: string;
  context?: {
    subscribed: boolean;
    role: string;
    title: string;
  };
}

interface SubscriberEntry {
  name: string;
  role: string;
  title: string;
}

/**
 * Get community details
 * Uses bridge.get_community
 */
export async function getCommunity(
  params: {
    name: string;
    observer?: string;
  }
): Promise<Response> {
  try {
    const community = await callBridgeApi<CommunityData>('get_community', {
      name: params.name,
      observer: params.observer || '',
    });

    if (!community) {
      return errorResponse(`Error: Community "${params.name}" not found`);
    }

    return successJson({
      id: community.id,
      name: community.name,
      title: community.title,
      about: community.about,
      description: community.description,
      lang: community.lang,
      is_nsfw: community.is_nsfw,
      subscribers: community.subscribers,
      num_authors: community.num_authors,
      num_pending: community.num_pending,
      created_at: community.created_at,
      avatar_url: community.avatar_url,
      flag_text: community.flag_text,
      team: community.team,
      context: community.context,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_community'));
  }
}

/**
 * List communities
 * Uses bridge.list_communities
 */
export async function listCommunities(
  params: {
    last?: string;
    limit: number;
    query?: string;
    sort: string;
  }
): Promise<Response> {
  try {
    const communities = await callBridgeApi<CommunityListItem[]>('list_communities', {
      last: params.last || '',
      limit: params.limit || 20,
      query: params.query || null,
      sort: params.sort || 'rank',
    });

    if (!communities || !Array.isArray(communities)) {
      return successJson({
        communities_count: 0,
        communities: [],
      });
    }

    const formattedCommunities = communities.map((c) => ({
      name: c.name,
      title: c.title,
      about: c.about,
      subscribers: c.subscribers,
      num_authors: c.num_authors,
      created_at: c.created_at,
      is_nsfw: c.is_nsfw,
      avatar_url: c.avatar_url,
    }));

    return successJson({
      communities_count: formattedCommunities.length,
      sort: params.sort || 'rank',
      communities: formattedCommunities,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'list_communities'));
  }
}

/**
 * Get community subscribers
 * Uses bridge.list_subscribers
 */
export async function getCommunitySubscribers(
  params: {
    community: string;
    last?: string;
    limit: number;
  }
): Promise<Response> {
  try {
    const subscribers = await callBridgeApi<SubscriberEntry[]>('list_subscribers', {
      community: params.community,
      last: params.last || '',
      limit: params.limit || 50,
    });

    if (!subscribers || !Array.isArray(subscribers)) {
      return successJson({
        community: params.community,
        subscribers_count: 0,
        subscribers: [],
      });
    }

    return successJson({
      community: params.community,
      subscribers_count: subscribers.length,
      subscribers: subscribers,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_community_subscribers'));
  }
}

/**
 * Subscribe to a community
 * Broadcasts a custom_json subscribe operation
 */
export async function subscribeCommunity(
  params: { community: string }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Community subscribe custom_json format
    const subscribeJson = JSON.stringify([
      'subscribe',
      {
        community: params.community,
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'community',
        json: subscribeJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      account: username,
      community: params.community,
      action: 'subscribe',
      community_url: `https://peakd.com/c/${params.community}`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'subscribe_community'));
  }
}

/**
 * Unsubscribe from a community
 * Broadcasts a custom_json unsubscribe operation
 */
export async function unsubscribeCommunity(
  params: { community: string }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Community unsubscribe custom_json format
    const unsubscribeJson = JSON.stringify([
      'unsubscribe',
      {
        community: params.community,
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'community',
        json: unsubscribeJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      account: username,
      community: params.community,
      action: 'unsubscribe',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'unsubscribe_community'));
  }
}

