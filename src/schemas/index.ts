/**
 * Schema Index
 * 
 * Summary: Exports all schemas in the format needed by McpServer.
 * Purpose: Central schema export point for tool registration.
 * Key elements: Schema shape extraction and exports
 * Dependencies: zod, schema modules
 * Last update: Migration to ESM
 */

import { z } from 'zod';

// Import all the schema objects
import * as accountSchemas from './account.js';
import * as contentSchemas from './content.js';
import * as transactionSchemas from './transaction.js';
import * as cryptoSchemas from './crypto.js';
import * as blockchainSchemas from './blockchain.js';
import * as messagingSchemas from './messaging.js';
import * as promptsSchemas from './prompts.js';
export * from './common.js';

// Helper function to extract the shape from a ZodObject
function getZodShape<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema._def.shape();
}

// Prompt schemas
export const createPostPromptSchema = getZodShape(promptsSchemas.createPostSchema);
export const analyzeAccountSchema = getZodShape(promptsSchemas.analyzeAccountSchema);

// Messaging schemas
export const encryptMessageSchema = getZodShape(messagingSchemas.encryptMessageSchema);
export const decryptMessageSchema = getZodShape(messagingSchemas.decryptMessageSchema);
export const sendEncryptedMessageSchema = getZodShape(messagingSchemas.sendEncryptedMessageSchema);
export const getEncryptedMessagesSchema = getZodShape(messagingSchemas.getEncryptedMessagesSchema);

// Account schemas
export const getAccountInfoSchema = getZodShape(accountSchemas.getAccountInfoSchema);
export const getAccountHistorySchema = getZodShape(accountSchemas.getAccountHistorySchema);
export const getVestingDelegationsSchema = getZodShape(accountSchemas.getVestingDelegationsSchema);

// Content schemas
export const getPostContentSchema = getZodShape(contentSchemas.getPostContentSchema);
export const getPostsByTagSchema = getZodShape(contentSchemas.getPostsByTagSchema);
export const getPostsByUserSchema = getZodShape(contentSchemas.getPostsByUserSchema);
export const createPostSchema = getZodShape(contentSchemas.createPostSchema);
export const createCommentSchema = getZodShape(contentSchemas.createCommentSchema);

// Transaction schemas
export const voteOnPostSchema = getZodShape(transactionSchemas.voteOnPostSchema);
export const sendTokenSchema = getZodShape(transactionSchemas.sendTokenSchema);

// Crypto schemas
export const signMessageSchema = getZodShape(cryptoSchemas.signMessageSchema);
export const verifySignatureSchema = getZodShape(cryptoSchemas.verifySignatureSchema);

// Blockchain schemas
export const getChainPropertiesSchema = getZodShape(blockchainSchemas.getChainPropertiesSchema);
