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
import * as stakingSchemas from './staking.js';
import * as rewardsSchemas from './rewards.js';
import * as savingsSchemas from './savings.js';
import * as conversionsSchemas from './conversions.js';
import * as heTokenSchemas from './hive-engine-tokens.js';
import * as heMarketSchemas from './hive-engine-market.js';
import * as heNftSchemas from './hive-engine-nfts.js';
import * as hePoolSchemas from './hive-engine-pools.js';
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

// Staking schemas (Phase 4 - DeFi)
export const powerUpSchema = getZodShape(stakingSchemas.powerUpSchema);
export const powerDownSchema = getZodShape(stakingSchemas.powerDownSchema);
export const cancelPowerDownSchema = getZodShape(stakingSchemas.cancelPowerDownSchema);
export const delegateHpSchema = getZodShape(stakingSchemas.delegateHpSchema);
export const undelegateHpSchema = getZodShape(stakingSchemas.undelegateHpSchema);

// Rewards schemas (Phase 4 - DeFi)
export const claimRewardsSchema = getZodShape(rewardsSchemas.claimRewardsSchema);
export const getRewardFundSchema = getZodShape(rewardsSchemas.getRewardFundSchema);
export const getPendingRewardsSchema = getZodShape(rewardsSchemas.getPendingRewardsSchema);

// Savings schemas (Phase 4 - DeFi)
export const transferToSavingsSchema = getZodShape(savingsSchemas.transferToSavingsSchema);
export const transferFromSavingsSchema = getZodShape(savingsSchemas.transferFromSavingsSchema);
export const cancelSavingsWithdrawSchema = getZodShape(savingsSchemas.cancelSavingsWithdrawSchema);
export const getSavingsWithdrawalsSchema = getZodShape(savingsSchemas.getSavingsWithdrawalsSchema);

// Conversions schemas (Phase 4 - DeFi)
export const convertHbdSchema = getZodShape(conversionsSchemas.convertHbdSchema);
export const collateralizedConvertSchema = getZodShape(conversionsSchemas.collateralizedConvertSchema);
export const getConversionRequestsSchema = getZodShape(conversionsSchemas.getConversionRequestsSchema);
export const getCurrentPriceFeedSchema = getZodShape(conversionsSchemas.getCurrentPriceFeedSchema);

// =============================================================================
// Hive Engine schemas (Phase 5)
// =============================================================================

// HE Token schemas
export const getHETokenBalanceSchema = getZodShape(heTokenSchemas.getHETokenBalanceSchema);
export const getHETokenInfoSchema = getZodShape(heTokenSchemas.getHETokenInfoSchema);
export const getHETokensListSchema = getZodShape(heTokenSchemas.getHETokensListSchema);
export const transferHETokenSchema = getZodShape(heTokenSchemas.transferHETokenSchema);
export const stakeHETokenSchema = getZodShape(heTokenSchemas.stakeHETokenSchema);
export const unstakeHETokenSchema = getZodShape(heTokenSchemas.unstakeHETokenSchema);
export const delegateHETokenSchema = getZodShape(heTokenSchemas.delegateHETokenSchema);
export const undelegateHETokenSchema = getZodShape(heTokenSchemas.undelegateHETokenSchema);

// HE Market schemas
export const getHEMarketOrderbookSchema = getZodShape(heMarketSchemas.getHEMarketOrderbookSchema);
export const getHEMarketHistorySchema = getZodShape(heMarketSchemas.getHEMarketHistorySchema);
export const getHEMarketMetricsSchema = getZodShape(heMarketSchemas.getHEMarketMetricsSchema);
export const getHEOpenOrdersSchema = getZodShape(heMarketSchemas.getHEOpenOrdersSchema);
export const placeHEBuyOrderSchema = getZodShape(heMarketSchemas.placeHEBuyOrderSchema);
export const placeHESellOrderSchema = getZodShape(heMarketSchemas.placeHESellOrderSchema);
export const cancelHEOrderSchema = getZodShape(heMarketSchemas.cancelHEOrderSchema);

// HE NFT schemas
export const getHENFTCollectionSchema = getZodShape(heNftSchemas.getHENFTCollectionSchema);
export const getHENFTInfoSchema = getZodShape(heNftSchemas.getHENFTInfoSchema);
export const getHENFTPropertiesSchema = getZodShape(heNftSchemas.getHENFTPropertiesSchema);
export const getHENFTSellOrdersSchema = getZodShape(heNftSchemas.getHENFTSellOrdersSchema);
export const transferHENFTSchema = getZodShape(heNftSchemas.transferHENFTSchema);
export const sellHENFTSchema = getZodShape(heNftSchemas.sellHENFTSchema);
export const cancelHENFTSaleSchema = getZodShape(heNftSchemas.cancelHENFTSaleSchema);
export const buyHENFTSchema = getZodShape(heNftSchemas.buyHENFTSchema);

// HE Pool schemas
export const getHEPoolInfoSchema = getZodShape(hePoolSchemas.getHEPoolInfoSchema);
export const getHEPoolsListSchema = getZodShape(hePoolSchemas.getHEPoolsListSchema);
export const estimateHESwapSchema = getZodShape(hePoolSchemas.estimateHESwapSchema);
export const swapHETokensSchema = getZodShape(hePoolSchemas.swapHETokensSchema);
export const addHELiquiditySchema = getZodShape(hePoolSchemas.addHELiquiditySchema);
export const removeHELiquiditySchema = getZodShape(hePoolSchemas.removeHELiquiditySchema);
