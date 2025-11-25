/**
 * Content Creation Tools Implementation
 * 
 * Summary: Provides tools for creating posts and comments on the Hive blockchain.
 * Purpose: Broadcast content creation operations using WAX transaction builder.
 * Key elements: createPost, createComment
 * Dependencies: @hiveio/wax (via config/client), config, utils/response, utils/error
 * Last update: Migration from dhive to WAX library with transaction builder pattern
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';

/**
 * Create a new blog post
 * Broadcasts a comment operation (posts are comments with empty parent) to the Hive blockchain
 */
export async function createPost(
  params: {
    title: string;
    body: string;
    tags: string[];
    beneficiaries?: { account: string; weight: number }[] | null;
    permalink?: string;
    max_accepted_payout?: string;
    percent_hbd?: number;
    allow_votes: boolean;
    allow_curation_rewards: boolean;
  }
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const username = config.hive.username;
    const postingKey = config.hive.postingKey;

    if (!username || !postingKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set.');
    }

    // Generate permalink if not provided
    const finalPermalink =
      params.permalink ||
      params.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .slice(0, 255); // Restrict to 255 chars

    // Ensure first tag is used as the main category
    const finalTags = [...new Set(params.tags)]; // Remove duplicates

    const chain = await getChain();
    
    // Create a new transaction with WAX
    const tx = await chain.createTransaction();
    
    // Push the comment operation (posts are comments with empty parent_author)
    tx.pushOperation({
      comment_operation: {
        parent_author: '', // Empty for main posts (non-comments)
        parent_permlink: finalTags[0], // First tag is the main category
        author: username,
        permlink: finalPermalink,
        title: params.title,
        body: params.body,
        json_metadata: JSON.stringify({
          tags: finalTags,
          app: 'hive-mcp-server/1.0',
        }),
      }
    });
    
    // Check if we need to add comment_options
    const hasOptions = params.max_accepted_payout !== undefined ||
                       params.percent_hbd !== undefined ||
                       (params.beneficiaries && params.beneficiaries.length > 0) ||
                       params.allow_votes === false ||
                       params.allow_curation_rewards === false;
    
    if (hasOptions) {
      // Parse max_accepted_payout to WAX asset format
      let maxPayoutAsset;
      if (params.max_accepted_payout) {
        // Parse the string format "1000000.000 HBD"
        const parts = params.max_accepted_payout.split(' ');
        const amount = parseFloat(parts[0]);
        maxPayoutAsset = chain.hbdCoins(amount);
      } else {
        maxPayoutAsset = chain.hbdCoins(1000000); // Default max payout
      }
      
      // Build extensions for beneficiaries if provided
      const extensions: Array<{ comment_payout_beneficiaries: { beneficiaries: Array<{ account: string; weight: number }> } }> = [];
      
      if (params.beneficiaries && params.beneficiaries.length > 0) {
        extensions.push({
          comment_payout_beneficiaries: {
            beneficiaries: params.beneficiaries.map((b) => ({
              account: b.account,
              weight: b.weight,
            })),
          },
        });
      }
      
      // Push the comment_options operation
      tx.pushOperation({
        comment_options_operation: {
          author: username,
          permlink: finalPermalink,
          max_accepted_payout: maxPayoutAsset,
          percent_hbd: params.percent_hbd ?? 10000,
          allow_votes: params.allow_votes,
          allow_curation_rewards: params.allow_curation_rewards,
          extensions: extensions,
        }
      });
    }
    
    // Sign the transaction with the posting key
    tx.sign(postingKey);
    
    // Broadcast the transaction
    await chain.broadcast(tx);
    
    // Get transaction ID
    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      author: username,
      permlink: finalPermalink,
      title: params.title,
      tags: finalTags,
      url: `https://hive.blog/@${username}/${finalPermalink}`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'create_post'));
  }
}

/**
 * Create a comment on an existing post or reply to a comment
 * Broadcasts a comment operation to the Hive blockchain
 */
export async function createComment(
  params: {
    parent_author: string;
    parent_permlink: string;
    body: string;
    permalink?: string;
    beneficiaries?: { account: string; weight: number }[] | null;
    max_accepted_payout?: string;
    percent_hbd?: number;
    allow_votes: boolean;
    allow_curation_rewards: boolean;
  }
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const username = config.hive.username;
    const postingKey = config.hive.postingKey;

    if (!username || !postingKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set.');
    }

    // Generate a random permalink if not provided
    const finalPermalink =
      params.permalink ||
      `re-${params.parent_permlink.slice(0, 20)}-${Date.now().toString(36)}`;

    const chain = await getChain();
    
    // Create a new transaction with WAX
    const tx = await chain.createTransaction();
    
    // Push the comment operation
    tx.pushOperation({
      comment_operation: {
        parent_author: params.parent_author,
        parent_permlink: params.parent_permlink,
        author: username,
        permlink: finalPermalink,
        title: '', // Comments don't have titles
        body: params.body,
        json_metadata: JSON.stringify({
          app: 'hive-mcp-server/1.0',
        }),
      }
    });
    
    // Check if we need to add comment_options
    const hasOptions = params.max_accepted_payout !== undefined ||
                       params.percent_hbd !== undefined ||
                       (params.beneficiaries && params.beneficiaries.length > 0) ||
                       params.allow_votes === false ||
                       params.allow_curation_rewards === false;
    
    if (hasOptions) {
      // Parse max_accepted_payout to WAX asset format
      let maxPayoutAsset;
      if (params.max_accepted_payout) {
        // Parse the string format "1000000.000 HBD"
        const parts = params.max_accepted_payout.split(' ');
        const amount = parseFloat(parts[0]);
        maxPayoutAsset = chain.hbdCoins(amount);
      } else {
        maxPayoutAsset = chain.hbdCoins(1000000); // Default max payout
      }
      
      // Build extensions for beneficiaries if provided
      const extensions: Array<{ comment_payout_beneficiaries: { beneficiaries: Array<{ account: string; weight: number }> } }> = [];
      
      if (params.beneficiaries && params.beneficiaries.length > 0) {
        extensions.push({
          comment_payout_beneficiaries: {
            beneficiaries: params.beneficiaries.map((b) => ({
              account: b.account,
              weight: b.weight,
            })),
          },
        });
      }
      
      // Push the comment_options operation
      tx.pushOperation({
        comment_options_operation: {
          author: username,
          permlink: finalPermalink,
          max_accepted_payout: maxPayoutAsset,
          percent_hbd: params.percent_hbd ?? 10000,
          allow_votes: params.allow_votes,
          allow_curation_rewards: params.allow_curation_rewards,
          extensions: extensions,
        }
      });
    }
    
    // Sign the transaction with the posting key
    tx.sign(postingKey);
    
    // Broadcast the transaction
    await chain.broadcast(tx);
    
    // Get transaction ID
    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      parent_author: params.parent_author,
      parent_permlink: params.parent_permlink,
      author: username,
      permlink: finalPermalink,
      url: `https://hive.blog/@${params.parent_author}/${params.parent_permlink}#@${username}/${finalPermalink}`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'create_comment'));
  }
}
