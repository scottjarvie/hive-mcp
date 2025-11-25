/**
 * Tool Registration Module
 * 
 * Summary: Registers all MCP tools and prompts with the server.
 * Purpose: Central registration point for Hive blockchain tools.
 * Key elements: registerTools, registerPrompts
 * Dependencies: @modelcontextprotocol/sdk, schemas, tool modules
 * Last update: Phase 3 - Added advanced content and RC tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as schemas from '../schemas/index.js';
import * as accountTools from './account.js';
import * as contentTools from './content.js';
import * as transactionTools from './transaction.js';
import * as contentCreationTools from './content-creation.js';
import * as cryptoTools from './crypto.js';
import * as blockchainTools from './blockchain.js';
import * as messagingTools from './messaging.js';
import * as socialTools from './social.js';
import * as communityTools from './community.js';
import * as contentAdvancedTools from './content-advanced.js';
import * as resourceCreditsTools from './resource-credits.js';
import * as stakingTools from './staking.js';
import * as rewardsTools from './rewards.js';
import * as savingsTools from './savings.js';
import * as conversionsTools from './conversions.js';
import { adaptHandler } from '../utils/response.js';
import * as promptsTools from './prompts.js';

export function registerPrompts(server: McpServer): void {
  // Create Post prompt
  server.prompt(
    "create-post",
    "Create a new post on Hive blockchain",
    schemas.createPostPromptSchema,
    promptsTools.createPostPrompt
  );

  // Analyze Account prompt
  server.prompt(
    "analyze-account",
    "Analyze a Hive account's activity and statistics",
    schemas.analyzeAccountSchema,
    promptsTools.analyzeAccountPrompt
  );
}

// Register tools with the server
export function registerTools(server: McpServer): void {
  // Account tools
  server.tool(
    'get_account_info',
    'Fetches detailed information about a Hive blockchain account including balance, authority, voting power, and other account metrics.',
    schemas.getAccountInfoSchema,
    adaptHandler(accountTools.getAccountInfo)
  );

  server.tool(
    'get_account_history',
    'Retrieves transaction history for a Hive account with optional operation type filtering.',
    schemas.getAccountHistorySchema,
    adaptHandler(accountTools.getAccountHistory)
  );

  server.tool(
    'get_vesting_delegations',
    'Get a list of vesting delegations made by a specific Hive account',
    schemas.getVestingDelegationsSchema,
    adaptHandler(accountTools.getVestingDelegations)
  );

  // Content tools
  server.tool(
    'get_post_content',
    'Retrieves a specific Hive blog post identified by author and permlink, including the post title, content, and metadata.',
    schemas.getPostContentSchema,
    adaptHandler(contentTools.getPostContent)
  );

  server.tool(
    'get_posts_by_tag',
    'Retrieves Hive posts filtered by a specific tag and sorted by a category like trending, hot, or created.',
    schemas.getPostsByTagSchema,
    adaptHandler(contentTools.getPostsByTag)
  );

  server.tool(
    'get_posts_by_user',
    'Retrieves posts authored by or in the feed of a specific Hive user.',
    schemas.getPostsByUserSchema,
    adaptHandler(contentTools.getPostsByUser)
  );

  // Transaction tools
  server.tool(
    'vote_on_post',
    'Vote on a Hive post (upvote or downvote) using the configured Hive account.',
    schemas.voteOnPostSchema,
    adaptHandler(transactionTools.voteOnPost)
  );

  server.tool(
    'send_token',
    'Send HIVE or HBD tokens to another Hive account using the configured account credentials.',
    schemas.sendTokenSchema,
    adaptHandler(transactionTools.sendToken)
  );

  // Content creation tools
  server.tool(
    'create_post',
    'Create a new blog post on the Hive blockchain using the configured account credentials.',
    schemas.createPostSchema,
    adaptHandler(contentCreationTools.createPost)
  );

  server.tool(
    'create_comment',
    'Create a comment on an existing Hive post or reply to another comment.',
    schemas.createCommentSchema,
    adaptHandler(contentCreationTools.createComment)
  );

  // Cryptography tools
  server.tool(
    'sign_message',
    'Sign a message using a Hive private key from environment variables.',
    schemas.signMessageSchema,
    adaptHandler(cryptoTools.signMessage)
  );

  server.tool(
    'verify_signature',
    'Verify a digital signature against a Hive public key',
    schemas.verifySignatureSchema,
    adaptHandler(cryptoTools.verifySignature)
  );

  // Blockchain info tools
  server.tool(
    'get_chain_properties',
    'Fetch current Hive blockchain properties and statistics',
    schemas.getChainPropertiesSchema,
    adaptHandler(blockchainTools.getChainProperties)
  );

  // Messaging tools
  server.tool(
    'encrypt_message',
    'Encrypt a message for a specific Hive account using memo encryption',
    schemas.encryptMessageSchema,
    adaptHandler(messagingTools.encryptMessage)
  );

  server.tool(
    'decrypt_message',
    'Decrypt an encrypted message received from a specific Hive account',
    schemas.decryptMessageSchema,
    adaptHandler(messagingTools.decryptMessage)
  );

  server.tool(
    'send_encrypted_message',
    'Send an encrypted message to a Hive account using a small token transfer',
    schemas.sendEncryptedMessageSchema,
    adaptHandler(messagingTools.sendEncryptedMessage)
  );

  server.tool(
    'get_encrypted_messages',
    'Retrieve encrypted messages from account history with optional decryption',
    schemas.getEncryptedMessagesSchema,
    adaptHandler(messagingTools.getEncryptedMessages)
  );

  // Social tools
  server.tool(
    'get_followers',
    'Get list of followers for a Hive account',
    schemas.getFollowersSchema,
    adaptHandler(socialTools.getFollowers)
  );

  server.tool(
    'get_following',
    'Get list of accounts that a Hive user follows',
    schemas.getFollowingSchema,
    adaptHandler(socialTools.getFollowing)
  );

  server.tool(
    'get_follow_count',
    'Get follower and following counts for a Hive account',
    schemas.getFollowCountSchema,
    adaptHandler(socialTools.getFollowCount)
  );

  server.tool(
    'follow_account',
    'Follow a Hive account to see their posts in your feed',
    schemas.followAccountSchema,
    adaptHandler(socialTools.followAccount)
  );

  server.tool(
    'unfollow_account',
    'Unfollow a Hive account',
    schemas.unfollowAccountSchema,
    adaptHandler(socialTools.unfollowAccount)
  );

  server.tool(
    'mute_account',
    'Mute a Hive account to hide their content',
    schemas.muteAccountSchema,
    adaptHandler(socialTools.muteAccount)
  );

  server.tool(
    'unmute_account',
    'Unmute a previously muted Hive account',
    schemas.unmuteAccountSchema,
    adaptHandler(socialTools.unmuteAccount)
  );

  server.tool(
    'reblog_post',
    'Reblog (resteem) a Hive post to share it with your followers',
    schemas.reblogPostSchema,
    adaptHandler(socialTools.reblogPost)
  );

  // Community tools
  server.tool(
    'get_community',
    'Get details about a Hive community',
    schemas.getCommunitySchema,
    adaptHandler(communityTools.getCommunity)
  );

  server.tool(
    'list_communities',
    'List and search Hive communities',
    schemas.listCommunitiesSchema,
    adaptHandler(communityTools.listCommunities)
  );

  server.tool(
    'get_community_subscribers',
    'Get list of subscribers for a Hive community',
    schemas.getCommunitySubscribersSchema,
    adaptHandler(communityTools.getCommunitySubscribers)
  );

  server.tool(
    'subscribe_community',
    'Subscribe to (join) a Hive community',
    schemas.subscribeCommunitySchema,
    adaptHandler(communityTools.subscribeCommunity)
  );

  server.tool(
    'unsubscribe_community',
    'Unsubscribe from (leave) a Hive community',
    schemas.unsubscribeCommunitySchema,
    adaptHandler(communityTools.unsubscribeCommunity)
  );

  // Advanced content tools
  server.tool(
    'get_content_replies',
    'Get all replies/comments on a specific Hive post',
    schemas.getContentRepliesSchema,
    adaptHandler(contentAdvancedTools.getContentReplies)
  );

  server.tool(
    'get_active_votes',
    'Get all votes on a specific Hive post with voter details',
    schemas.getActiveVotesSchema,
    adaptHandler(contentAdvancedTools.getActiveVotes)
  );

  server.tool(
    'get_reblogged_by',
    'Get list of accounts that reblogged a specific Hive post',
    schemas.getRebloggedBySchema,
    adaptHandler(contentAdvancedTools.getRebloggedBy)
  );

  server.tool(
    'get_account_notifications',
    'Get account notifications (mentions, replies, votes, etc.)',
    schemas.getAccountNotificationsSchema,
    adaptHandler(contentAdvancedTools.getAccountNotifications)
  );

  server.tool(
    'get_discussion',
    'Get full threaded discussion for a Hive post (root post and all nested replies)',
    schemas.getDiscussionSchema,
    adaptHandler(contentAdvancedTools.getDiscussion)
  );

  // Content update/delete tools
  server.tool(
    'update_post',
    'Update/edit an existing Hive post or comment',
    schemas.updatePostSchema,
    adaptHandler(contentCreationTools.updatePost)
  );

  server.tool(
    'delete_comment',
    'Delete a Hive post or comment (marks for deletion)',
    schemas.deleteCommentSchema,
    adaptHandler(contentCreationTools.deleteComment)
  );

  // Resource Credits tools
  server.tool(
    'get_rc_accounts',
    'Get Resource Credits information for one or more Hive accounts',
    schemas.getRcAccountsSchema,
    adaptHandler(resourceCreditsTools.getRcAccounts)
  );

  server.tool(
    'delegate_rc',
    'Delegate Resource Credits to another Hive account',
    schemas.delegateRcSchema,
    adaptHandler(resourceCreditsTools.delegateRc)
  );

  // =========================================================================
  // DeFi Tools (Phase 4)
  // =========================================================================

  // Staking tools
  server.tool(
    'power_up',
    'Convert HIVE to Hive Power (HP) - stake HIVE to gain governance power',
    schemas.powerUpSchema,
    adaptHandler(stakingTools.powerUp)
  );

  server.tool(
    'power_down',
    'Start power down to convert HP to liquid HIVE (13-week process)',
    schemas.powerDownSchema,
    adaptHandler(stakingTools.powerDown)
  );

  server.tool(
    'cancel_power_down',
    'Cancel an ongoing power down process',
    schemas.cancelPowerDownSchema,
    adaptHandler(stakingTools.cancelPowerDown)
  );

  server.tool(
    'delegate_hp',
    'Delegate Hive Power to another account',
    schemas.delegateHpSchema,
    adaptHandler(stakingTools.delegateHp)
  );

  server.tool(
    'undelegate_hp',
    'Remove HP delegation from an account (5-day cooldown)',
    schemas.undelegateHpSchema,
    adaptHandler(stakingTools.undelegateHp)
  );

  // Rewards tools
  server.tool(
    'claim_rewards',
    'Claim pending author and curation rewards',
    schemas.claimRewardsSchema,
    adaptHandler(rewardsTools.claimRewards)
  );

  server.tool(
    'get_reward_fund',
    'Get information about the Hive reward pool',
    schemas.getRewardFundSchema,
    adaptHandler(rewardsTools.getRewardFund)
  );

  server.tool(
    'get_pending_rewards',
    'Get unclaimed rewards for a Hive account',
    schemas.getPendingRewardsSchema,
    adaptHandler(rewardsTools.getPendingRewards)
  );

  // Savings tools
  server.tool(
    'transfer_to_savings',
    'Deposit HIVE or HBD to savings account (HBD earns interest)',
    schemas.transferToSavingsSchema,
    adaptHandler(savingsTools.transferToSavings)
  );

  server.tool(
    'transfer_from_savings',
    'Withdraw from savings (3-day waiting period)',
    schemas.transferFromSavingsSchema,
    adaptHandler(savingsTools.transferFromSavings)
  );

  server.tool(
    'cancel_savings_withdraw',
    'Cancel a pending savings withdrawal',
    schemas.cancelSavingsWithdrawSchema,
    adaptHandler(savingsTools.cancelSavingsWithdraw)
  );

  server.tool(
    'get_savings_withdrawals',
    'Get pending savings withdrawals for an account',
    schemas.getSavingsWithdrawalsSchema,
    adaptHandler(savingsTools.getSavingsWithdrawals)
  );

  // Conversion tools
  server.tool(
    'convert_hbd',
    'Convert HBD to HIVE using median price feed (3.5-day conversion)',
    schemas.convertHbdSchema,
    adaptHandler(conversionsTools.convertHbd)
  );

  server.tool(
    'collateralized_convert',
    'Instant HBD to HIVE conversion using HIVE as collateral',
    schemas.collateralizedConvertSchema,
    adaptHandler(conversionsTools.collateralizedConvert)
  );

  server.tool(
    'get_conversion_requests',
    'Get pending HBD/HIVE conversions for an account',
    schemas.getConversionRequestsSchema,
    adaptHandler(conversionsTools.getConversionRequests)
  );

  server.tool(
    'get_current_price_feed',
    'Get current HBD/HIVE median price feed from witnesses',
    schemas.getCurrentPriceFeedSchema,
    adaptHandler(conversionsTools.getCurrentPriceFeed)
  );
}
