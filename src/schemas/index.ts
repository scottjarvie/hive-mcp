/**
 * Schema Index
 * 
 * Summary: Exports all schemas in the format needed by McpServer.
 * Purpose: Central schema export point for tool registration.
 * Key elements: Schema shape extraction and exports
 * Dependencies: zod, schema modules
 * Last update: Phase 3 - Added content-advanced and resource-credits schemas
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
import * as socialSchemas from './social.js';
import * as communitySchemas from './community.js';
import * as contentAdvancedSchemas from './content-advanced.js';
import * as resourceCreditsSchemas from './resource-credits.js';
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

// Social schemas
export const getFollowersSchema = getZodShape(socialSchemas.getFollowersSchema);
export const getFollowingSchema = getZodShape(socialSchemas.getFollowingSchema);
export const getFollowCountSchema = getZodShape(socialSchemas.getFollowCountSchema);
export const followAccountSchema = getZodShape(socialSchemas.followAccountSchema);
export const unfollowAccountSchema = getZodShape(socialSchemas.unfollowAccountSchema);
export const muteAccountSchema = getZodShape(socialSchemas.muteAccountSchema);
export const unmuteAccountSchema = getZodShape(socialSchemas.unmuteAccountSchema);
export const reblogPostSchema = getZodShape(socialSchemas.reblogPostSchema);

// Community schemas
export const getCommunitySchema = getZodShape(communitySchemas.getCommunitySchema);
export const listCommunitiesSchema = getZodShape(communitySchemas.listCommunitiesSchema);
export const getCommunitySubscribersSchema = getZodShape(communitySchemas.getCommunitySubscribersSchema);
export const subscribeCommunitySchema = getZodShape(communitySchemas.subscribeCommunitySchema);
export const unsubscribeCommunitySchema = getZodShape(communitySchemas.unsubscribeCommunitySchema);

// Advanced content schemas
export const getContentRepliesSchema = getZodShape(contentAdvancedSchemas.getContentRepliesSchema);
export const getActiveVotesSchema = getZodShape(contentAdvancedSchemas.getActiveVotesSchema);
export const getRebloggedBySchema = getZodShape(contentAdvancedSchemas.getRebloggedBySchema);
export const getAccountNotificationsSchema = getZodShape(contentAdvancedSchemas.getAccountNotificationsSchema);
export const getDiscussionSchema = getZodShape(contentAdvancedSchemas.getDiscussionSchema);
export const updatePostSchema = getZodShape(contentAdvancedSchemas.updatePostSchema);
export const deleteCommentSchema = getZodShape(contentAdvancedSchemas.deleteCommentSchema);

// Resource Credits schemas
export const delegateRcSchema = getZodShape(resourceCreditsSchemas.delegateRcSchema);
export const getRcAccountsSchema = getZodShape(resourceCreditsSchemas.getRcAccountsSchema);
