/**
 * Messaging Schemas
 * 
 * Summary: Zod schemas for encrypted messaging tools.
 * Purpose: Input validation for message encryption, decryption, and retrieval.
 * Key elements: messagingSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related messaging operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all messaging operations
 * Combines: encrypt_message, decrypt_message, send_encrypted_message, get_encrypted_messages
 */
export const messagingSchema = z.object({
  action: z.enum(['encrypt', 'decrypt', 'send', 'get_messages']).describe(
    'Action: encrypt, decrypt, send, or get_messages'
  ),
  // For encrypt, send
  message: z.string().min(1).optional().describe('Message to encrypt/send (for encrypt, send)'),
  recipient: z.string().optional().describe('Recipient username (for encrypt, send)'),
  // For decrypt
  encrypted_message: z.string().optional().describe('Encrypted message starting with # (for decrypt)'),
  sender: z.string().optional().describe('Sender username (for decrypt)'),
  // For send
  amount: z.number().min(0.001).optional().default(0.001).describe('HIVE amount for transfer (for send)'),
  // For get_messages
  username: z.string().optional().describe('Account to fetch messages for (for get_messages)'),
  limit: z.number().min(1).max(100).optional().default(20).describe('Max messages to retrieve (for get_messages)'),
  decrypt: z.boolean().optional().default(false).describe('Whether to decrypt messages (for get_messages)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for encrypt_message tool
export const encryptMessageSchema = z.object({
  message: z.string().min(1).describe('Message to encrypt'),
  recipient: z.string().describe('Hive username of the recipient'),
});

// Schema for decrypt_message tool
export const decryptMessageSchema = z.object({
  encrypted_message: z.string().startsWith('#').describe('Encrypted message (starts with #)'),
  sender: z.string().describe('Hive username of the sender'),
});

// Schema for send_encrypted_message tool
export const sendEncryptedMessageSchema = z.object({
  message: z.string().min(1).describe('Message to encrypt and send'),
  recipient: z.string().describe('Hive username of the recipient'),
  amount: z.number().min(0.001).default(0.001).describe('Amount of HIVE to send (minimum 0.001)'),
});

// Schema for get_encrypted_messages tool - updated with optional username
export const getEncryptedMessagesSchema = z.object({
  username: z.string().optional().describe('Hive username to fetch encrypted messages for (defaults to configured account if not specified)'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum number of messages to retrieve'),
  decrypt: z.boolean().default(false).describe('Whether to attempt decryption of messages'),
});
