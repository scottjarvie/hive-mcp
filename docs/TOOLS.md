# Hive MCP Server - Tool Reference

Complete documentation for all 84 tools provided by the Hive MCP Server.

## Table of Contents

- [Account & Blockchain](#account--blockchain)
- [Content Reading](#content-reading)
- [Content Writing](#content-writing)
- [Social](#social)
- [Communities](#communities)
- [Cryptography](#cryptography)
- [Encrypted Messaging](#encrypted-messaging)
- [Token Transfers](#token-transfers)
- [DeFi - Staking](#defi---staking)
- [DeFi - Rewards](#defi---rewards)
- [DeFi - Savings](#defi---savings)
- [DeFi - Conversions](#defi---conversions)
- [Resource Credits](#resource-credits)
- [Hive Engine - Tokens](#hive-engine---tokens)
- [Hive Engine - Market](#hive-engine---market)
- [Hive Engine - NFTs](#hive-engine---nfts)
- [Hive Engine - Liquidity Pools](#hive-engine---liquidity-pools)

---

## Account & Blockchain

### `get_account_info`

Fetches detailed information about a Hive blockchain account including balance, authority, voting power, and other metrics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | Yes | Hive username to fetch information for |

**Returns:** Account data including balance, voting power, resource credits, authority structure, and profile metadata.

---

### `get_account_history`

Retrieves transaction history for a Hive account with optional operation type filtering.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `username` | string | Yes | - | Hive username |
| `limit` | number | No | 10 | Number of operations to return (1-100) |
| `operation_filter` | string/array | No | - | Operation types to filter for (e.g., `['transfer', 'vote']` or `'transfer,vote'`) |

**Returns:** Array of historical operations with timestamps and transaction details.

---

### `get_vesting_delegations`

Get a list of vesting delegations (HP delegations) made by a specific Hive account.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `username` | string | Yes | - | Hive account to get delegations for |
| `limit` | number | No | 100 | Maximum number of delegations (1-1000) |
| `from` | string | No | - | Starting account for pagination |

**Returns:** Array of delegations with delegatee accounts and VESTS amounts.

---

### `get_chain_properties`

Fetch current Hive blockchain properties and statistics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | - |

**Returns:** Blockchain properties including head block, supply, witness schedule, and inflation rates.

---

## Content Reading

### `get_post_content`

Retrieves a specific Hive blog post identified by author and permlink.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post |
| `permlink` | string | Yes | Permlink of the post |

**Returns:** Post content including title, body, metadata, votes, and payout information.

---

### `get_posts_by_tag`

Retrieves Hive posts filtered by a specific tag and sorted by a category.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | Yes | - | Sorting category: `trending`, `hot`, `created`, `active`, `cashout`, `comments`, `promoted`, `votes` |
| `tag` | string | Yes | - | The tag to filter posts by |
| `limit` | number | No | 10 | Number of posts to return (1-20) |

**Returns:** Array of posts matching the tag and sort criteria.

---

### `get_posts_by_user`

Retrieves posts authored by or in the feed of a specific Hive user.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | Yes | - | Type: `blog` (user's posts) or `feed` (posts from followed accounts) |
| `username` | string | Yes | - | Hive username to fetch posts for |
| `limit` | number | No | 10 | Number of posts to return (1-20) |

**Returns:** Array of posts from the user's blog or feed.

---

### `get_content_replies`

Get all replies/comments on a specific Hive post.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post |
| `permlink` | string | Yes | Permlink of the post |

**Returns:** Array of direct reply comments with author, content, and vote information.

---

### `get_active_votes`

Get all votes on a specific Hive post with voter details.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post |
| `permlink` | string | Yes | Permlink of the post |

**Returns:** Array of votes including voter account, weight, rshares, and timestamp.

---

### `get_reblogged_by`

Get list of accounts that reblogged (resteemed) a specific Hive post.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post |
| `permlink` | string | Yes | Permlink of the post |

**Returns:** Array of account names that reblogged the post.

---

### `get_account_notifications`

Get account notifications including mentions, replies, votes, and other activity.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `account` | string | Yes | - | Hive account to get notifications for |
| `limit` | number | No | 50 | Maximum notifications to return (1-100) |
| `last_id` | number | No | - | Last notification ID for pagination |

**Returns:** Array of notifications with type, sender, and relevant post details.

---

### `get_discussion`

Get full threaded discussion for a Hive post (root post and all nested replies).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the root post |
| `permlink` | string | Yes | Permlink of the root post |

**Returns:** The post and all nested reply comments organized as a discussion thread.

---

## Content Writing

**Authentication Required:** Posting Key

### `create_post`

Create a new blog post on the Hive blockchain.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `title` | string | Yes | - | Title of the blog post (max 256 chars) |
| `body` | string | Yes | - | Content of the post (Markdown supported) |
| `tags` | string/array | No | `['blog']` | Tags as comma-separated string or array |
| `beneficiaries` | array | No | - | Beneficiaries to receive portion of rewards |
| `permalink` | string | No | (auto-generated) | Custom permalink for the post |
| `max_accepted_payout` | string | No | - | Maximum payout (e.g., `'1000.000 HBD'`) |
| `percent_hbd` | number | No | - | Percent of HBD in rewards (0-10000) |
| `allow_votes` | boolean | No | true | Whether to allow votes |
| `allow_curation_rewards` | boolean | No | true | Whether to allow curation rewards |

**Returns:** Transaction confirmation with post details.

---

### `create_comment`

Create a comment on an existing Hive post or reply to another comment.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `parent_author` | string | Yes | - | Author of parent post/comment |
| `parent_permlink` | string | Yes | - | Permlink of parent post/comment |
| `body` | string | Yes | - | Comment content (Markdown supported) |
| `permalink` | string | No | (auto-generated) | Custom permalink |
| `beneficiaries` | array | No | - | Beneficiaries for rewards |
| `max_accepted_payout` | string | No | - | Maximum payout |
| `percent_hbd` | number | No | - | Percent HBD in rewards (0-10000) |
| `allow_votes` | boolean | No | true | Allow votes |
| `allow_curation_rewards` | boolean | No | true | Allow curation rewards |

**Returns:** Transaction confirmation with comment details.

---

### `update_post`

Update/edit an existing Hive post or comment.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post (must match authenticated user) |
| `permlink` | string | Yes | Permlink of the post to update |
| `title` | string | No | New title (optional, keeps original if not provided) |
| `body` | string | Yes | New body content |
| `tags` | array | No | New tags (optional, keeps original if not provided) |

**Returns:** Transaction confirmation.

---

### `delete_comment`

Delete a Hive post or comment. Note: Content is marked for deletion but may persist on some nodes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the content (must match authenticated user) |
| `permlink` | string | Yes | Permlink of the content to delete |

**Returns:** Transaction confirmation.

---

### `vote_on_post`

Vote on a Hive post (upvote or downvote).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post |
| `permlink` | string | Yes | Permlink of the post |
| `weight` | number | Yes | Vote weight: -10000 (100% downvote) to 10000 (100% upvote) |

**Returns:** Transaction confirmation with vote details.

---

## Social

### `get_followers`

Get list of followers for a Hive account.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `account` | string | Yes | - | Hive account to get followers for |
| `start` | string | No | '' | Start account for pagination |
| `type` | string | No | 'blog' | Type: `blog` (followers) or `ignore` (muted by) |
| `limit` | number | No | 100 | Maximum followers to return (1-1000) |

**Returns:** Array of follower accounts.

---

### `get_following`

Get list of accounts that a Hive user follows.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `account` | string | Yes | - | Hive account |
| `start` | string | No | '' | Start account for pagination |
| `type` | string | No | 'blog' | Type: `blog` (following) or `ignore` (muted) |
| `limit` | number | No | 100 | Maximum accounts to return (1-1000) |

**Returns:** Array of accounts the user follows.

---

### `get_follow_count`

Get follower and following counts for a Hive account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account |

**Returns:** Follower count and following count.

---

### `follow_account`

Follow a Hive account. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account to follow |

**Returns:** Transaction confirmation.

---

### `unfollow_account`

Unfollow a Hive account. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account to unfollow |

**Returns:** Transaction confirmation.

---

### `mute_account`

Mute a Hive account to hide their content. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account to mute |

**Returns:** Transaction confirmation.

---

### `unmute_account`

Unmute a previously muted Hive account. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account to unmute |

**Returns:** Transaction confirmation.

---

### `reblog_post`

Reblog (resteem) a Hive post to share it with your followers. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post |
| `permlink` | string | Yes | Permlink of the post |

**Returns:** Transaction confirmation.

---

## Communities

### `get_community`

Get details about a Hive community.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Community name (e.g., `'hive-123456'`) |
| `observer` | string | No | Observer account for context |

**Returns:** Community details including title, about, rules, and subscriber count.

---

### `list_communities`

List and search Hive communities.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `last` | string | No | - | Last community name for pagination |
| `limit` | number | No | 20 | Maximum communities (1-100) |
| `query` | string | No | - | Search query to filter communities |
| `sort` | string | No | 'rank' | Sort order: `rank`, `new`, or `subs` |

**Returns:** Array of communities matching the criteria.

---

### `get_community_subscribers`

Get list of subscribers for a Hive community.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `community` | string | Yes | - | Community name |
| `last` | string | No | - | Last subscriber for pagination |
| `limit` | number | No | 50 | Maximum subscribers (1-100) |

**Returns:** Array of subscriber accounts with roles.

---

### `subscribe_community`

Subscribe to a Hive community. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `community` | string | Yes | Community name to subscribe to |

**Returns:** Transaction confirmation.

---

### `unsubscribe_community`

Unsubscribe from a Hive community. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `community` | string | Yes | Community name to unsubscribe from |

**Returns:** Transaction confirmation.

---

## Cryptography

### `sign_message`

Sign a message using a Hive private key. Requires the corresponding key in environment variables.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | - | Message to sign |
| `key_type` | string | No | 'posting' | Key type: `posting`, `active`, `memo`, or `owner` |

**Returns:** Message hash and signature.

---

### `verify_signature`

Verify a digital signature against a Hive public key.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message_hash` | string | Yes | SHA-256 hash of the message (64 hex chars) |
| `signature` | string | Yes | Signature string to verify |
| `public_key` | string | Yes | Public key (with or without STM prefix) |

**Returns:** Verification result (valid/invalid).

---

## Encrypted Messaging

### `encrypt_message`

Encrypt a message for a specific Hive account using memo encryption. **Requires Memo Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | Message to encrypt |
| `recipient` | string | Yes | Hive username of the recipient |

**Returns:** Encrypted message string (starts with `#`).

---

### `decrypt_message`

Decrypt an encrypted message received from a specific Hive account. **Requires Memo Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `encrypted_message` | string | Yes | Encrypted message (starts with `#`) |
| `sender` | string | Yes | Hive username of the sender |

**Returns:** Decrypted message content.

---

### `send_encrypted_message`

Send an encrypted message using a small token transfer. **Requires Active Key + Memo Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | - | Message to encrypt and send |
| `recipient` | string | Yes | - | Recipient Hive username |
| `amount` | number | No | 0.001 | Amount of HIVE to send (min 0.001) |

**Returns:** Transaction confirmation.

---

### `get_encrypted_messages`

Retrieve encrypted messages from account history with optional decryption. **Requires Memo Key for decryption.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `username` | string | No | (configured account) | Account to fetch messages for |
| `limit` | number | No | 20 | Maximum messages (1-100) |
| `decrypt` | boolean | No | false | Whether to decrypt messages |

**Returns:** Array of encrypted messages with optional decrypted content.

---

## Token Transfers

### `send_token`

Send HIVE or HBD tokens to another account. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Recipient Hive username |
| `amount` | number | Yes | Amount of tokens to send |
| `currency` | string | Yes | Currency: `HIVE` or `HBD` |
| `memo` | string | No | Optional memo |

**Returns:** Transaction confirmation.

---

## DeFi - Staking

### `power_up`

Convert HIVE to Hive Power (HP). **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount of HIVE to power up |
| `to` | string | No | Target account (defaults to self) |

**Returns:** Transaction confirmation.

---

### `power_down`

Start power down to convert HP to liquid HIVE. Takes 13 weeks. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount of HP (in HIVE equivalent) to power down |

**Returns:** Transaction confirmation.

---

### `cancel_power_down`

Cancel an ongoing power down process. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | - |

**Returns:** Transaction confirmation.

---

### `delegate_hp`

Delegate Hive Power to another account. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `delegatee` | string | Yes | Account to delegate HP to |
| `amount` | number | Yes | Amount of HP (in HIVE equivalent) to delegate |

**Returns:** Transaction confirmation.

---

### `undelegate_hp`

Remove HP delegation from an account. 5-day cooldown applies. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `delegatee` | string | Yes | Account to remove delegation from |

**Returns:** Transaction confirmation.

---

## DeFi - Rewards

### `claim_rewards`

Claim pending author and curation rewards. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | Claims all pending rewards |

**Returns:** Transaction confirmation with claimed amounts.

---

### `get_reward_fund`

Get information about the Hive reward pool.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fund_name` | string | No | 'post' | Name of the reward fund |

**Returns:** Reward fund balance, recent claims, and reward balance.

---

### `get_pending_rewards`

Get unclaimed rewards for a Hive account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Account to get pending rewards for |

**Returns:** Pending HIVE, HBD, and HP rewards.

---

## DeFi - Savings

### `transfer_to_savings`

Deposit HIVE or HBD to savings account. HBD in savings earns ~20% APR. **Requires Active Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `amount` | number | Yes | - | Amount to transfer |
| `currency` | string | Yes | - | Currency: `HIVE` or `HBD` |
| `to` | string | No | (self) | Target account |
| `memo` | string | No | '' | Optional memo |

**Returns:** Transaction confirmation.

---

### `transfer_from_savings`

Withdraw from savings. 3-day waiting period applies. **Requires Active Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `amount` | number | Yes | - | Amount to withdraw |
| `currency` | string | Yes | - | Currency: `HIVE` or `HBD` |
| `to` | string | No | (self) | Target account |
| `memo` | string | No | '' | Optional memo |

**Returns:** Transaction confirmation with request ID.

---

### `cancel_savings_withdraw`

Cancel a pending savings withdrawal. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request_id` | number | Yes | Request ID of the withdrawal to cancel |

**Returns:** Transaction confirmation.

---

### `get_savings_withdrawals`

Get pending savings withdrawals for an account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Account to get pending withdrawals for |

**Returns:** Array of pending withdrawal requests.

---

## DeFi - Conversions

### `convert_hbd`

Convert HBD to HIVE using median price feed. 3.5-day conversion period. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount of HBD to convert |

**Returns:** Transaction confirmation with request ID.

---

### `collateralized_convert`

Instant HBD to HIVE conversion using HIVE as collateral. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount of HIVE to use as collateral |

**Returns:** Transaction confirmation.

---

### `get_conversion_requests`

Get pending HBD/HIVE conversions for an account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Account to get pending conversions for |

**Returns:** Array of pending conversion requests.

---

### `get_current_price_feed`

Get current HBD/HIVE median price feed from witnesses.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | - |

**Returns:** Current price feed with base and quote values.

---

## Resource Credits

### `get_rc_accounts`

Get Resource Credits information for one or more Hive accounts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `accounts` | array | Yes | List of accounts (1-100) |

**Returns:** RC balance and mana for each account.

---

### `delegate_rc`

Delegate Resource Credits to another Hive account. **Requires Posting Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Account to delegate RC to |
| `max_rc` | number | Yes | Maximum RC to delegate (in RC units) |

**Returns:** Transaction confirmation.

---

## Hive Engine - Tokens

### `get_he_token_balance`

Get Hive Engine token balance(s) for an account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account name |
| `symbol` | string | No | Token symbol (omit for all balances) |

**Returns:** Token balance(s) including staked, delegated, and pending amounts.

---

### `get_he_token_info`

Get details about a Hive Engine token.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol (e.g., `LEO`, `POB`, `BEE`) |

**Returns:** Token info including supply, precision, issuer, and properties.

---

### `get_he_tokens_list`

List Hive Engine tokens with optional filtering.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 100 | Maximum tokens (1-1000) |
| `offset` | number | No | 0 | Offset for pagination |
| `issuer` | string | No | - | Filter by token issuer |

**Returns:** Array of tokens with details.

---

### `transfer_he_token`

Transfer Hive Engine tokens to another account. **Requires Active Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `to` | string | Yes | - | Recipient account |
| `symbol` | string | Yes | - | Token symbol |
| `quantity` | string | Yes | - | Amount to transfer (string for precision) |
| `memo` | string | No | '' | Optional memo |

**Returns:** Transaction confirmation.

---

### `stake_he_token`

Stake Hive Engine tokens for voting/governance power. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol |
| `quantity` | string | Yes | Amount to stake |
| `to` | string | No | Account to stake to (defaults to self) |

**Returns:** Transaction confirmation.

---

### `unstake_he_token`

Begin unstaking Hive Engine tokens. Cooldown period applies. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol |
| `quantity` | string | Yes | Amount to unstake |

**Returns:** Transaction confirmation.

---

### `delegate_he_token`

Delegate staked Hive Engine tokens to another account. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol |
| `quantity` | string | Yes | Amount to delegate |
| `to` | string | Yes | Account to delegate to |

**Returns:** Transaction confirmation.

---

### `undelegate_he_token`

Remove Hive Engine token delegation. Cooldown applies. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol |
| `quantity` | string | Yes | Amount to undelegate |
| `from` | string | Yes | Account to undelegate from |

**Returns:** Transaction confirmation.

---

## Hive Engine - Market

### `get_he_market_orderbook`

Get buy/sell orderbook for a Hive Engine token.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbol` | string | Yes | - | Token symbol |
| `limit` | number | No | 50 | Maximum orders per side (1-500) |

**Returns:** Buy and sell orders with price and quantity.

---

### `get_he_market_history`

Get recent trade history for a Hive Engine token.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbol` | string | Yes | - | Token symbol |
| `limit` | number | No | 100 | Maximum trades (1-500) |

**Returns:** Array of recent trades with price, quantity, and timestamp.

---

### `get_he_market_metrics`

Get market metrics for a Hive Engine token.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol |

**Returns:** Price, volume, market cap, and price changes.

---

### `get_he_open_orders`

Get open buy/sell orders for an account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account name |

**Returns:** Array of open orders with type, symbol, price, and quantity.

---

### `place_he_buy_order`

Place a buy order on the Hive Engine market. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol to buy |
| `quantity` | string | Yes | Amount of tokens to buy |
| `price` | string | Yes | Price per token in SWAP.HIVE |

**Returns:** Transaction confirmation.

---

### `place_he_sell_order`

Place a sell order on the Hive Engine market. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Token symbol to sell |
| `quantity` | string | Yes | Amount of tokens to sell |
| `price` | string | Yes | Price per token in SWAP.HIVE |

**Returns:** Transaction confirmation.

---

### `cancel_he_order`

Cancel an open order on the Hive Engine market. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Order type: `buy` or `sell` |
| `id` | string | Yes | Order ID to cancel |

**Returns:** Transaction confirmation.

---

## Hive Engine - NFTs

### `get_he_nft_collection`

Get NFTs owned by a Hive account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | Hive account name |
| `symbol` | string | No | NFT collection symbol (omit for all NFTs) |

**Returns:** Array of owned NFTs with properties and metadata.

---

### `get_he_nft_info`

Get details about a Hive Engine NFT or NFT collection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | NFT collection symbol |
| `id` | string | No | Specific NFT instance ID |

**Returns:** NFT/collection info including name, issuer, and properties.

---

### `get_he_nft_properties`

Get NFT collection property schema/definition.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | NFT collection symbol |

**Returns:** Property definitions for the NFT collection.

---

### `get_he_nft_sell_orders`

Get NFTs listed for sale on the market.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbol` | string | Yes | - | NFT collection symbol |
| `limit` | number | No | 100 | Maximum orders (1-500) |

**Returns:** Array of NFT sell listings with price and details.

---

### `transfer_he_nft`

Transfer Hive Engine NFTs to another account. **Requires Active Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbol` | string | Yes | - | NFT collection symbol |
| `ids` | array | Yes | - | Array of NFT instance IDs |
| `to` | string | Yes | - | Recipient account |
| `memo` | string | No | '' | Optional memo |

**Returns:** Transaction confirmation.

---

### `sell_he_nft`

List Hive Engine NFTs for sale. **Requires Active Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbol` | string | Yes | - | NFT collection symbol |
| `ids` | array | Yes | - | Array of NFT instance IDs |
| `price` | string | Yes | - | Price per NFT |
| `priceSymbol` | string | No | 'SWAP.HIVE' | Price token symbol |

**Returns:** Transaction confirmation.

---

### `cancel_he_nft_sale`

Cancel NFT sale listings. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | NFT collection symbol |
| `ids` | array | Yes | Array of NFT instance IDs to cancel sale for |

**Returns:** Transaction confirmation.

---

### `buy_he_nft`

Purchase NFTs from the Hive Engine market. **Requires Active Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbol` | string | Yes | - | NFT collection symbol |
| `ids` | array | Yes | - | Array of NFT instance IDs to buy |
| `marketAccount` | string | No | 'nftmarket' | NFT market account |

**Returns:** Transaction confirmation.

---

## Hive Engine - Liquidity Pools

### `get_he_pool_info`

Get details about a Hive Engine liquidity pool.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tokenPair` | string | Yes | Token pair (e.g., `'SWAP.HIVE:LEO'`) |

**Returns:** Pool details including liquidity, volume, and APR.

---

### `get_he_pools_list`

List all Hive Engine liquidity pools.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 100 | Maximum pools (1-500) |
| `offset` | number | No | 0 | Offset for pagination |

**Returns:** Array of liquidity pools with details.

---

### `estimate_he_swap`

Estimate output for a Hive Engine pool swap.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tokenPair` | string | Yes | Token pair (e.g., `'SWAP.HIVE:LEO'`) |
| `tokenSymbol` | string | Yes | Token you are swapping FROM |
| `tokenAmount` | string | Yes | Amount to swap |

**Returns:** Estimated output amount and price impact.

---

### `swap_he_tokens`

Swap tokens via Hive Engine liquidity pool (DEX). **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tokenPair` | string | Yes | Token pair (e.g., `'SWAP.HIVE:LEO'`) |
| `tokenSymbol` | string | Yes | Token you are swapping FROM |
| `tokenAmount` | string | Yes | Amount to swap |
| `minAmountOut` | string | No | Minimum output (slippage protection) |

**Returns:** Transaction confirmation with swap details.

---

### `add_he_liquidity`

Add liquidity to a Hive Engine pool. **Requires Active Key.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tokenPair` | string | Yes | - | Token pair to add liquidity to |
| `baseQuantity` | string | Yes | - | Amount of base token |
| `quoteQuantity` | string | Yes | - | Amount of quote token |
| `maxSlippage` | string | No | '0.005' | Maximum slippage (0.5%) |
| `maxDeviation` | string | No | '0.01' | Maximum price deviation (1%) |

**Returns:** Transaction confirmation with LP shares received.

---

### `remove_he_liquidity`

Remove liquidity from a Hive Engine pool. **Requires Active Key.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tokenPair` | string | Yes | Token pair to remove liquidity from |
| `shares` | string | Yes | Amount of LP shares to remove |

**Returns:** Transaction confirmation with tokens received.

---

## Key Requirements Summary

| Key Type | Required For |
|----------|--------------|
| **Posting** | Voting, commenting, posting, following, reblogging, claiming rewards, RC delegation |
| **Active** | Token transfers, staking/delegation, savings, conversions, all Hive Engine operations |
| **Memo** | Encrypting/decrypting messages |
| **Owner** | Signing with owner key (rarely needed) |

---

## Notes

1. **Hive Engine quantities**: Use strings for amounts to preserve decimal precision (e.g., `"10.000"` not `10`)
2. **Token pairs**: Use colon-separated format (e.g., `"SWAP.HIVE:LEO"`)
3. **Community names**: Use the `hive-XXXXXX` format
4. **Weights**: Vote weights and percentages use 10000 = 100%
5. **Time periods**: Power down = 13 weeks, savings withdrawal = 3 days, HBD conversion = 3.5 days

