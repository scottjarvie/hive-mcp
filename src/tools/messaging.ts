/**
 * Messaging Tools Implementation
 * 
 * Summary: Provides tools for encrypted messaging on the Hive blockchain.
 * Purpose: Encrypt/decrypt messages and send encrypted memos via transfers.
 * Key elements: messaging (consolidated dispatcher)
 * Dependencies: @hiveio/wax (via config/client), config, utils/response, utils/error, utils/api, utils/date
 * Last update: Added date formatting for improved readability
 * 
 * Note: WAX encryption requires BeeKeeper for key management. This implementation
 * provides basic functionality with some limitations on client-side encryption.
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi } from '../utils/api.js';
import { formatDate } from '../utils/date.js';
import logger from '../utils/logger.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for all messaging operations
 * Handles: encrypt, decrypt, send, get_messages
 */
export async function messaging(
  params: {
    action: 'encrypt' | 'decrypt' | 'send' | 'get_messages';
    message?: string;
    recipient?: string;
    encrypted_message?: string;
    sender?: string;
    amount?: number;
    username?: string;
    limit?: number;
    decrypt?: boolean;
  }
): Promise<Response> {
  switch (params.action) {
    case 'encrypt':
      if (!params.message || !params.recipient) {
        return errorResponse('Error: Message and recipient are required for encrypt action');
      }
      return encryptMessage({ message: params.message, recipient: params.recipient });
    case 'decrypt':
      if (!params.encrypted_message || !params.sender) {
        return errorResponse('Error: encrypted_message and sender are required for decrypt action');
      }
      return decryptMessage({ encrypted_message: params.encrypted_message, sender: params.sender });
    case 'send':
      if (!params.message || !params.recipient) {
        return errorResponse('Error: Message and recipient are required for send action');
      }
      return sendEncryptedMessage({
        message: params.message,
        recipient: params.recipient,
        amount: params.amount || 0.001,
      });
    case 'get_messages':
      return getEncryptedMessages({
        username: params.username,
        limit: params.limit || 20,
        decrypt: params.decrypt || false,
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

/**
 * Helper function to get a public memo key for a Hive account
 */
async function getMemoPublicKey(username: string): Promise<string> {
  try {
    const chain = await getChain();
    const result = await chain.api.database_api.find_accounts({
      accounts: [username]
    });
    
    if (!result.accounts || result.accounts.length === 0) {
      throw new Error(`User ${username} not found`);
    }
    return result.accounts[0].memo_key;
  } catch (error) {
    throw new Error(`Error fetching memo key for ${username}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Encrypt a message
 * Note: WAX requires BeeKeeper for full encryption support.
 * This provides a placeholder with information about limitations.
 */
export async function encryptMessage(
  params: { 
    message: string;
    recipient: string;
  }
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const memoKey = config.hive.memoKey;

    if (!memoKey) {
      return errorResponse('Error: HIVE_MEMO_KEY environment variable is not set. Encryption requires your private memo key.');
    }

    // Get recipient's public memo key to verify they exist
    const recipientPublicKey = await getMemoPublicKey(params.recipient);
    
    // Note: WAX requires BeeKeeper (a wallet service) for encryption operations
    // The chain.encrypt() method requires ISignatureProvider, not raw keys
    // For full memo encryption, consider using BeeKeeper integration
    
    return successJson({
      success: true,
      recipient: params.recipient,
      recipient_memo_key: recipientPublicKey,
      message_length: params.message.length,
      note: "WAX requires BeeKeeper for memo encryption. To send encrypted messages, use the send_encrypted_message tool which broadcasts the transaction. For client-side encryption, consider integrating BeeKeeper or using the raw Hive memo encryption libraries.",
    });
  } catch (error) {
    return errorResponse(handleError(error, 'encrypt_message'));
  }
}

/**
 * Decrypt a message
 * Note: WAX requires BeeKeeper for full decryption support.
 */
export async function decryptMessage(
  params: { 
    encrypted_message: string;
    sender: string;
  }
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const memoKey = config.hive.memoKey;

    if (!memoKey) {
      return errorResponse('Error: HIVE_MEMO_KEY environment variable is not set. Decryption requires your private memo key.');
    }

    // Verify sender exists and get their memo key
    const senderPublicKey = await getMemoPublicKey(params.sender);
    
    // Check if message is encrypted (starts with #)
    if (!params.encrypted_message.startsWith('#')) {
      return successJson({
        success: true,
        sender: params.sender,
        decrypted_message: params.encrypted_message,
        note: "Message was not encrypted (didn't start with #)"
      });
    }
    
    // Note: WAX requires BeeKeeper for decryption operations
    return successJson({
      success: false,
      sender: params.sender,
      sender_memo_key: senderPublicKey,
      encrypted_message: params.encrypted_message,
      note: "WAX requires BeeKeeper for memo decryption. The encrypted message is shown above. For decryption, consider integrating BeeKeeper or using client-side decryption with the raw Hive memo libraries.",
    });
  } catch (error) {
    return errorResponse(handleError(error, 'decrypt_message'));
  }
}

/**
 * Send an encrypted message (combines encryption with token sending)
 * Note: Due to WAX's BeeKeeper requirement, this sends a plain memo.
 * For actual encryption, BeeKeeper integration is needed.
 */
export async function sendEncryptedMessage(
  params: { 
    message: string;
    recipient: string;
    amount: number;
  }
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;
    const memoKey = config.hive.memoKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Sending requires an active key.');
    }

    if (!memoKey) {
      return errorResponse('Error: HIVE_MEMO_KEY environment variable is not set. Encryption requires your private memo key.');
    }

    // Verify recipient exists
    await getMemoPublicKey(params.recipient);
    
    const chain = await getChain();
    
    // Create the asset
    const amountAsset = chain.hiveCoins(params.amount);
    
    // Create a new transaction with WAX
    const tx = await chain.createTransaction();
    
    // Note: For actual encryption, WAX would use:
    // tx.startEncrypt(publicKey).pushOperation(...)
    // But this requires BeeKeeper. We send with a note about encryption limitations.
    
    // Push the transfer operation with the message as memo
    // In production, this should be encrypted with BeeKeeper
    const memo = `[MCP Server - Encryption requires BeeKeeper] ${params.message}`;
    
    tx.pushOperation({
      transfer_operation: {
        from: username,
        to: params.recipient,
        amount: amountAsset,
        memo: memo,
      }
    });
    
    // Sign the transaction with the active key
    tx.sign(activeKey);
    
    // Broadcast the transaction
    await chain.broadcast(tx);
    
    // Get transaction ID
    const txId = tx.id;

    // Format the amount string for display
    const formattedAmount = `${params.amount.toFixed(3)} HIVE`;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      from: username,
      to: params.recipient,
      amount: formattedAmount,
      note: "Message sent. Note: Full memo encryption requires BeeKeeper integration. The message was sent as a plain memo.",
    });
  } catch (error) {
    return errorResponse(handleError(error, 'send_encrypted_message'));
  }
}

/**
 * Get encrypted messages from account history
 * Retrieves encrypted messages from account history with optional decryption
 */
export async function getEncryptedMessages(
  params: { 
    username?: string;
    limit: number;
    decrypt: boolean;
  }
): Promise<Response> {
  try {
    // Use the provided username or fall back to the configured username
    const username = params.username || config.hive.username;

    if (!username) {
      return errorResponse('Error: No username provided and HIVE_USERNAME environment variable is not set.');
    }

    // Get account history using direct API call
    const history = await callCondenserApi<Array<[number, { timestamp: string; trx_id: string; op: [string, { from: string; to: string; amount: string; memo: string }] }]>>(
      'get_account_history',
      [username, -1, params.limit * 3]
    );

    if (!history || !Array.isArray(history)) {
      return successJson({
        account: username,
        messages_count: 0,
        messages: [],
      });
    }

    // Filter for transfer operations with encrypted memos
    const encryptedMessages = history
      .filter(([_index, operation]) => {
        // Only include transfer operations
        if (operation.op[0] !== 'transfer') return false;
        
        const opData = operation.op[1];
        // Check if memo starts with '#' (encrypted memos start with '#')
        return opData.memo && opData.memo.startsWith('#');
      })
      .map(([index, operation]) => {
        const { timestamp, trx_id } = operation;
        const opData = operation.op[1];
        
        // Determine if this is an incoming or outgoing message
        const direction = opData.to === username ? 'received' : 'sent';
        const otherParty = direction === 'received' ? opData.from : opData.to;
        
        return {
          index,
          transaction_id: trx_id,
          timestamp: formatDate(timestamp),
          direction,
          counterparty: otherParty,
          amount: opData.amount,
          encrypted_message: opData.memo,
          decrypted_message: null as string | null,
        };
      })
      .slice(0, params.limit);

    // Note about decryption
    if (params.decrypt) {
      logger.info('Decryption requested but requires BeeKeeper integration');
      // WAX requires BeeKeeper for decryption, so we can't decrypt here
      for (const msg of encryptedMessages) {
        msg.decrypted_message = "[Decryption requires BeeKeeper integration]";
      }
    }

    return successJson({
      account: username,
      messages_count: encryptedMessages.length,
      messages: encryptedMessages,
      note: params.decrypt ? 
        "Decryption requires BeeKeeper integration with WAX. Encrypted messages are shown in their encrypted form." : 
        "Set 'decrypt' parameter to true to attempt decryption (requires BeeKeeper)"
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_encrypted_messages'));
  }
}
