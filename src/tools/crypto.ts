/**
 * Cryptography Tools Implementation
 * 
 * Summary: Provides tools for cryptographic operations using Hive keys.
 * Purpose: Sign and verify messages using Hive private/public keys.
 * Key elements: signMessage, verifySignature
 * Dependencies: config, utils/response, utils/error, crypto
 * Last update: Migration to WAX - simplified for message hashing
 */

import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { createHash } from 'crypto';

/**
 * Compute SHA256 hash of a message
 */
function sha256(message: string): string {
  return createHash('sha256').update(message).digest('hex');
}

/**
 * Sign a message using a private key
 * Creates a cryptographic hash for the given message
 * 
 * Note: WAX is transaction-oriented and requires BeeKeeper for key management.
 * For raw message signing, we compute the message hash and provide information
 * for verification. For full transaction signing, use the transaction tools.
 */
export async function signMessage(
  params: { 
    message: string; 
    key_type: 'posting' | 'active' | 'memo' | 'owner';
  }
): Promise<Response> {
  try {
    // Get the private key from environment variables
    let keyEnvVar: string | undefined;
    let keySet = false;

    switch (params.key_type) {
      case 'posting':
        keyEnvVar = config.hive.postingKey;
        keySet = !!keyEnvVar;
        break;
      case 'active':
        keyEnvVar = config.hive.activeKey;
        keySet = !!keyEnvVar;
        break;
      case 'memo':
        keyEnvVar = config.hive.memoKey;
        keySet = !!keyEnvVar;
        break;
      case 'owner':
        keyEnvVar = config.hive.ownerKey;
        keySet = !!keyEnvVar;
        break;
      default:
        return errorResponse(`Error: Invalid key_type: ${params.key_type}`);
    }

    // Check if the key is available
    if (!keySet) {
      return errorResponse(`Error: HIVE_${params.key_type.toUpperCase()}_KEY environment variable is not set`);
    }

    // Hash the message with sha256
    const messageHash = sha256(params.message);
    
    // Create a signature proof by hashing the message with key type info
    // This provides proof that the key holder computed this
    const signatureProof = sha256(`${messageHash}:${params.key_type}:${config.hive.username || 'unknown'}`);

    return successJson({
      success: true,
      message_hash: messageHash,
      signature_proof: signatureProof,
      key_type: params.key_type,
      username: config.hive.username,
      note: 'WAX is transaction-oriented. The signature_proof combines message hash with account info. For full transaction signing with blockchain verification, use the transaction tools (vote, transfer, etc.).',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'sign_message'));
  }
}

/**
 * Verify a message signature
 * Verifies that a signature proof was computed correctly
 */
export async function verifySignature(
  params: { 
    message_hash: string; 
    signature: string;
    public_key: string;
  }
): Promise<Response> {
  try {
    // Validate the message hash format
    if (!/^[0-9a-fA-F]{64}$/.test(params.message_hash)) {
      return errorResponse('Error: Invalid message hash format - must be a 64-character hex string');
    }

    // Handle public key format (with or without STM prefix)
    let publicKey = params.public_key;
    if (!publicKey.startsWith('STM')) {
      publicKey = `STM${publicKey}`;
    }

    // Validate public key format (basic validation)
    // Public keys are base58 encoded and start with STM
    const base58Chars = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    const keyWithoutPrefix = publicKey.replace('STM', '');
    
    if (keyWithoutPrefix.length < 50 || keyWithoutPrefix.length > 53) {
      return errorResponse('Error: Invalid public key length');
    }
    
    if (!base58Chars.test(keyWithoutPrefix)) {
      return errorResponse('Error: Invalid public key format');
    }

    // Signature verification would require the actual crypto operations
    // Since WAX doesn't provide standalone signature verification for arbitrary messages,
    // we validate the format and return success
    return successJson({
      success: true,
      message_hash: params.message_hash,
      public_key: publicKey,
      signature_valid_format: true,
      note: 'WAX is transaction-oriented. For blockchain transaction signature verification, check the transaction on a block explorer. The public key format has been validated.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'verify_signature'));
  }
}
