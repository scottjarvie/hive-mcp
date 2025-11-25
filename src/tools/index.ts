/**
 * Tool Registration Module
 * 
 * Summary: Registers all MCP tools and prompts with the server.
 * Purpose: Central registration point for Hive blockchain tools.
 * Key elements: registerTools, registerPrompts
 * Dependencies: @modelcontextprotocol/sdk, schemas, tool modules
 * Last update: Migration to ESM with WAX library
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
}
