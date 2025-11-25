/**
 * Tool Registration Module
 * 
 * Summary: Registers all MCP tools and prompts with the server.
 * Purpose: Central registration point for Hive blockchain tools.
 * Key elements: registerTools, registerPrompts (consolidated tools)
 * Dependencies: @modelcontextprotocol/sdk, schemas, tool modules
 * Last update: Tool consolidation - reduced from 74 to ~22 tools
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
import * as heTokenTools from './hive-engine-tokens.js';
import * as heMarketTools from './hive-engine-market.js';
import * as heNftTools from './hive-engine-nfts.js';
import * as hePoolTools from './hive-engine-pools.js';
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
  // =========================================================================
  // CONSOLIDATED TOOLS (Primary interface - reduced tool count)
  // =========================================================================

  // === Social Tools ===
  server.tool(
    'social_relationship',
    'Manage social relationships: follow, unfollow, mute, or unmute a Hive account. Actions: follow, unfollow, mute, unmute',
    schemas.socialRelationshipSchema,
    adaptHandler(socialTools.socialRelationship)
  );

  server.tool(
    'social_info',
    'Get social information: followers list, following list, or follow counts. Actions: get_followers, get_following, get_follow_count',
    schemas.socialInfoSchema,
    adaptHandler(socialTools.socialInfo)
  );

  // === Community Tools ===
  server.tool(
    'community_membership',
    'Manage community membership: subscribe, unsubscribe, or get subscribers. Actions: subscribe, unsubscribe, get_subscribers',
    schemas.communityMembershipSchema,
    adaptHandler(communityTools.communityMembership)
  );

  server.tool(
    'community_info',
    'Get community information: details about a community or list communities. Actions: get_community, list_communities',
    schemas.communityInfoSchema,
    adaptHandler(communityTools.communityInfo)
  );

  // === Content Tools ===
  server.tool(
    'get_posts',
    'Get posts: by tag (trending/hot/etc), by user (blog/feed), or single post. Actions: by_tag, by_user, single',
    schemas.getPostsSchema,
    adaptHandler(contentTools.getPosts)
  );

  server.tool(
    'content_manage',
    'Create, update, or delete content: posts and comments. Actions: create_post, create_comment, update, delete',
    schemas.contentManageSchema,
    adaptHandler(contentCreationTools.contentManage)
  );

  server.tool(
    'content_engagement',
    'Engage with content: vote, reblog, or get engagement stats. Actions: vote, reblog, get_replies, get_votes, get_reblogged_by',
    schemas.contentEngagementSchema,
    adaptHandler(contentAdvancedTools.contentEngagement)
  );

  // === Account Tools ===
  server.tool(
    'account_info',
    'Get account information: profile, history, delegations, or notifications. Actions: get_info, get_profile, get_history, get_delegations, get_notifications',
    schemas.accountInfoSchema,
    adaptHandler(accountTools.accountInfo)
  );

  // === Messaging Tools ===
  server.tool(
    'messaging',
    'Encrypted messaging: encrypt, decrypt, send, or retrieve messages. Actions: encrypt, decrypt, send, get_messages',
    schemas.messagingSchema,
    adaptHandler(messagingTools.messaging)
  );

  // === Resource Credits Tools ===
  server.tool(
    'resource_credits',
    'Resource Credits operations: get RC info or delegate RC. Actions: get_rc, delegate_rc',
    schemas.resourceCreditsSchema,
    adaptHandler(resourceCreditsTools.resourceCredits)
  );

  // === DeFi Tools ===
  server.tool(
    'staking',
    'Hive Power staking: power up/down, delegate/undelegate HP. Actions: power_up, power_down, cancel_power_down, delegate_hp, undelegate_hp',
    schemas.stakingSchema,
    adaptHandler(stakingTools.staking)
  );

  server.tool(
    'savings',
    'Savings account operations: deposit, withdraw, cancel, or check status. Actions: deposit, withdraw, cancel_withdraw, get_withdrawals',
    schemas.savingsSchema,
    adaptHandler(savingsTools.savings)
  );

  server.tool(
    'conversions',
    'HBD/HIVE conversions: convert, get requests, or check price feed. Actions: convert_hbd, collateralized_convert, get_requests, get_price_feed',
    schemas.conversionsSchema,
    adaptHandler(conversionsTools.conversions)
  );

  server.tool(
    'rewards',
    'Rewards operations: claim rewards or get reward info. Actions: claim, get_fund_info, get_pending',
    schemas.rewardsSchema,
    adaptHandler(rewardsTools.rewards)
  );

  // === Hive Engine Tools ===
  server.tool(
    'he_tokens',
    'Hive Engine tokens: balance, info, transfer, stake operations. Actions: balance, info, list, transfer, stake, unstake, delegate, undelegate',
    schemas.heTokensSchema,
    adaptHandler(heTokenTools.heTokens)
  );

  server.tool(
    'he_market',
    'Hive Engine market: orderbook, history, trading operations. Actions: orderbook, history, metrics, open_orders, buy, sell, cancel',
    schemas.heMarketSchema,
    adaptHandler(heMarketTools.heMarket)
  );

  server.tool(
    'he_nfts',
    'Hive Engine NFTs: collection, info, buy/sell/transfer operations. Actions: collection, info, properties, sell_orders, transfer, sell, cancel_sale, buy',
    schemas.heNftsSchema,
    adaptHandler(heNftTools.heNfts)
  );

  server.tool(
    'he_pools',
    'Hive Engine liquidity pools: info, swap, liquidity operations. Actions: info, list, estimate_swap, swap, add_liquidity, remove_liquidity',
    schemas.hePoolsSchema,
    adaptHandler(hePoolTools.hePools)
  );

  // =========================================================================
  // STANDALONE TOOLS (Unique functionality, not consolidated)
  // =========================================================================

  // Transaction - send_token is unique (direct token transfer)
  server.tool(
    'send_token',
    'Send HIVE or HBD tokens to another Hive account using the configured account credentials.',
    schemas.sendTokenSchema,
    adaptHandler(transactionTools.sendToken)
  );

  // Cryptography tools - unique signing/verification
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

  // Blockchain info - unique global chain data
  server.tool(
    'get_chain_properties',
    'Fetch current Hive blockchain properties and statistics',
    schemas.getChainPropertiesSchema,
    adaptHandler(blockchainTools.getChainProperties)
  );

  // Discussion tool - unique full thread retrieval
  server.tool(
    'get_discussion',
    'Get full threaded discussion for a Hive post (root post and all nested replies)',
    schemas.getDiscussionSchema,
    adaptHandler(contentAdvancedTools.getDiscussion)
  );

  // Reblog - kept separate for convenience (also in content_engagement)
  server.tool(
    'reblog_post',
    'Reblog (resteem) a Hive post to share it with your followers',
    schemas.reblogPostSchema,
    adaptHandler(socialTools.reblogPost)
  );
}
