/**
 * Transaction-related Tools Implementation
 * 
 * Summary: Provides tools for broadcasting transactions to the Hive blockchain.
 * Purpose: Vote on posts and transfer tokens using WAX transaction builder.
 * Key elements: voteOnPost, sendToken
 * Dependencies: @hiveio/wax (via config/client), config, utils/response, utils/error
 * Last update: Migration from dhive to WAX library with transaction builder pattern
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';

/**
 * Vote on a post
 * Broadcasts a vote operation to the Hive blockchain
 */
export async function voteOnPost(
  params: { 
    author: string; 
    permlink: string;
    weight: number;
  }
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    const chain = await getChain();
    
    // Create a new transaction with WAX
    const tx = await chain.createTransaction();
    
    // Push the vote operation using WAX's operation format (with _operation suffix)
    tx.pushOperation({
      vote_operation: {
        voter: username,
        author: params.author,
        permlink: params.permlink,
        weight: params.weight,
      }
    });
    
    // Sign the transaction with the posting key
    tx.sign(privateKey);
    
    // Broadcast the transaction
    await chain.broadcast(tx);
    
    // Get transaction ID from the signed transaction
    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      voter: username,
      author: params.author,
      permlink: params.permlink,
      weight: params.weight,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'vote_on_post'));
  }
}

/**
 * Send HIVE or HBD to another account
 * Broadcasts a transfer operation to the Hive blockchain
 */
export async function sendToken(
  params: { 
    to: string; 
    amount: number;
    currency: string;
    memo?: string;
  }
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Note that transfers require an active key, not a posting key.');
    }

    const chain = await getChain();
    
    // Create the asset using WAX helper methods
    let amountAsset;
    if (params.currency.toUpperCase() === 'HIVE') {
      amountAsset = chain.hiveCoins(params.amount);
    } else if (params.currency.toUpperCase() === 'HBD') {
      amountAsset = chain.hbdCoins(params.amount);
    } else {
      return errorResponse(`Error: Invalid currency: ${params.currency}. Must be HIVE or HBD.`);
    }
    
    // Create a new transaction with WAX
    const tx = await chain.createTransaction();
    
    // Push the transfer operation (with _operation suffix)
    tx.pushOperation({
      transfer_operation: {
        from: username,
        to: params.to,
        amount: amountAsset,
        memo: params.memo || '',
      }
    });
    
    // Sign the transaction with the active key (required for transfers)
    tx.sign(activeKey);
    
    // Broadcast the transaction
    await chain.broadcast(tx);
    
    // Get transaction ID
    const txId = tx.id;

    // Format the amount string for display
    const formattedAmount = `${params.amount.toFixed(3)} ${params.currency.toUpperCase()}`;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      from: username,
      to: params.to,
      amount: formattedAmount,
      memo: params.memo || '(no memo)',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'send_token'));
  }
}
