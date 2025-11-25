# Hive MCP Server - Tool Reference

Complete documentation for all 22 consolidated tools provided by the Hive MCP Server.

Tools are organized with an `action` parameter that specifies which operation to perform. This design reduces the total tool count while maintaining full functionality, improving AI model tool selection accuracy.

## Table of Contents

- [Social Tools](#social-tools)
- [Community Tools](#community-tools)
- [Content Tools](#content-tools)
- [Account & Messaging Tools](#account--messaging-tools)
- [DeFi Tools](#defi-tools)
- [Resource Credits](#resource-credits)
- [Hive Engine Tools](#hive-engine-tools)
- [Standalone Tools](#standalone-tools)

---

## Social Tools

### `social_relationship`

Manage social relationships: follow, unfollow, mute, or unmute a Hive account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | enum | Yes | One of: `follow`, `unfollow`, `mute`, `unmute` |
| `account` | string | Yes | Target Hive account |

**Key Required:** Posting

**Examples:**
- Follow: `{ action: "follow", account: "alice" }`
- Mute: `{ action: "mute", account: "spammer" }`

---

### `social_info`

Get social information: followers list, following list, or follow counts.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `get_followers`, `get_following`, `get_follow_count` |
| `account` | string | Yes | - | Hive account to query |
| `start` | string | No | "" | Start account for pagination |
| `type` | enum | No | "blog" | Type filter: `blog` or `ignore` |
| `limit` | number | No | 100 | Maximum results (1-1000) |

**Examples:**
- Get followers: `{ action: "get_followers", account: "alice", limit: 50 }`
- Get follow count: `{ action: "get_follow_count", account: "bob" }`

---

## Community Tools

### `community_membership`

Manage community membership: subscribe, unsubscribe, or get subscribers.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `subscribe`, `unsubscribe`, `get_subscribers` |
| `community` | string | Yes | - | Community name (e.g., "hive-123456") |
| `last` | string | No | - | Last subscriber for pagination |
| `limit` | number | No | 50 | Maximum subscribers to return |

**Key Required:** Posting (for subscribe/unsubscribe)

**Examples:**
- Subscribe: `{ action: "subscribe", community: "hive-167922" }`
- Get subscribers: `{ action: "get_subscribers", community: "hive-167922", limit: 100 }`

---

### `community_info`

Get community information: details about a community or list communities.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `get_community`, `list_communities` |
| `name` | string | Conditional | - | Community name (required for get_community) |
| `observer` | string | No | - | Observer account for context |
| `last` | string | No | - | Last community for pagination |
| `limit` | number | No | 20 | Maximum communities to return |
| `query` | string | No | - | Search query |
| `sort` | enum | No | "rank" | Sort: `rank`, `new`, or `subs` |

**Examples:**
- Get community: `{ action: "get_community", name: "hive-167922" }`
- List communities: `{ action: "list_communities", query: "photography", limit: 10 }`

---

## Content Tools

### `get_posts`

Get posts: by tag (trending/hot/etc), by user (blog/feed), or single post.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `by_tag`, `by_user`, `single` |
| `author` | string | Conditional | - | Post author (for single) |
| `permlink` | string | Conditional | - | Post permlink (for single) |
| `tag` | string | Conditional | - | Tag to filter (for by_tag) |
| `category` | string | Conditional | - | Sort category (for by_tag: trending/hot/created/etc; for by_user: blog/feed) |
| `username` | string | Conditional | - | Username (for by_user) |
| `limit` | number | No | 10 | Number of posts (1-20) |

**Examples:**
- Single post: `{ action: "single", author: "alice", permlink: "my-post" }`
- Trending by tag: `{ action: "by_tag", tag: "photography", category: "trending", limit: 5 }`
- User's blog: `{ action: "by_user", username: "alice", category: "blog" }`

---

### `content_manage`

Create, update, or delete content: posts and comments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `create_post`, `create_comment`, `update`, `delete` |
| `title` | string | Conditional | - | Post title (for create_post, update) |
| `body` | string | Conditional | - | Content body with Markdown |
| `tags` | array/string | No | ["blog"] | Tags for the post |
| `parent_author` | string | Conditional | - | Parent author (for create_comment) |
| `parent_permlink` | string | Conditional | - | Parent permlink (for create_comment) |
| `author` | string | Conditional | - | Author (for update/delete) |
| `permlink` | string | No | - | Custom permlink or target permlink |
| `beneficiaries` | array | No | - | Reward beneficiaries |
| `max_accepted_payout` | string | No | - | Max payout (e.g., "1000.000 HBD") |
| `percent_hbd` | number | No | - | Percent HBD in rewards (0-10000) |
| `allow_votes` | boolean | No | true | Allow votes |
| `allow_curation_rewards` | boolean | No | true | Allow curation rewards |

**Key Required:** Posting

**Examples:**
- Create post: `{ action: "create_post", title: "Hello World", body: "My first post!", tags: ["blog", "intro"] }`
- Create comment: `{ action: "create_comment", parent_author: "alice", parent_permlink: "my-post", body: "Great post!" }`
- Update: `{ action: "update", author: "me", permlink: "my-post", body: "Updated content" }`
- Delete: `{ action: "delete", author: "me", permlink: "my-post" }`

---

### `content_engagement`

Engage with content: vote, reblog, or get engagement stats.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | enum | Yes | One of: `vote`, `reblog`, `get_replies`, `get_votes`, `get_reblogged_by` |
| `author` | string | Yes | Post author |
| `permlink` | string | Yes | Post permlink |
| `weight` | number | Conditional | Vote weight -10000 to 10000 (required for vote) |

**Key Required:** Posting (for vote, reblog)

**Examples:**
- Upvote: `{ action: "vote", author: "alice", permlink: "my-post", weight: 10000 }`
- Reblog: `{ action: "reblog", author: "alice", permlink: "my-post" }`
- Get votes: `{ action: "get_votes", author: "alice", permlink: "my-post" }`

---

## Account & Messaging Tools

### `account_info`

Get account information: profile, history, delegations, or notifications.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `get_info`, `get_history`, `get_delegations`, `get_notifications` |
| `username` | string | Yes | - | Hive username |
| `limit` | number | No | 10 | Maximum results |
| `operation_filter` | array/string | No | - | Filter operations (for get_history) |
| `from` | string | No | - | Starting account (for get_delegations) |
| `last_id` | number | No | - | Last notification ID (for get_notifications) |

**Examples:**
- Get info: `{ action: "get_info", username: "alice" }`
- Get history: `{ action: "get_history", username: "alice", limit: 50, operation_filter: ["transfer", "vote"] }`
- Get delegations: `{ action: "get_delegations", username: "alice", limit: 100 }`
- Get notifications: `{ action: "get_notifications", username: "alice", limit: 25 }`

---

### `messaging`

Encrypted messaging: encrypt, decrypt, send, or retrieve messages.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `encrypt`, `decrypt`, `send`, `get_messages` |
| `message` | string | Conditional | - | Message to encrypt/send |
| `recipient` | string | Conditional | - | Recipient username |
| `encrypted_message` | string | Conditional | - | Encrypted message (starts with #) |
| `sender` | string | Conditional | - | Sender username (for decrypt) |
| `amount` | number | No | 0.001 | HIVE amount for transfer (for send) |
| `username` | string | No | - | Account to fetch messages for |
| `limit` | number | No | 20 | Max messages to retrieve |
| `decrypt` | boolean | No | false | Whether to decrypt messages |

**Key Required:** Memo (+ Active for send)

**Examples:**
- Encrypt: `{ action: "encrypt", message: "Secret message", recipient: "alice" }`
- Send: `{ action: "send", message: "Hello!", recipient: "alice", amount: 0.001 }`
- Get messages: `{ action: "get_messages", limit: 50, decrypt: true }`

---

## DeFi Tools

### `staking`

Hive Power staking: power up/down, delegate/undelegate HP.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | enum | Yes | One of: `power_up`, `power_down`, `cancel_power_down`, `delegate_hp`, `undelegate_hp` |
| `amount` | number | Conditional | Amount of HIVE/HP |
| `to` | string | No | Target account (for power_up) |
| `delegatee` | string | Conditional | Account to delegate to/from |

**Key Required:** Active

**Examples:**
- Power up: `{ action: "power_up", amount: 100 }`
- Power down: `{ action: "power_down", amount: 500 }`
- Delegate: `{ action: "delegate_hp", delegatee: "newcomer", amount: 100 }`
- Undelegate: `{ action: "undelegate_hp", delegatee: "olddelegate" }`

---

### `savings`

Savings account operations: deposit, withdraw, cancel, or check status.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `deposit`, `withdraw`, `cancel_withdraw`, `get_withdrawals` |
| `amount` | number | Conditional | - | Amount |
| `currency` | enum | Conditional | - | `HIVE` or `HBD` |
| `to` | string | No | self | Target account |
| `memo` | string | No | "" | Optional memo |
| `request_id` | number | Conditional | - | Withdrawal ID (for cancel) |
| `account` | string | Conditional | - | Account to query |

**Key Required:** Active

**Examples:**
- Deposit: `{ action: "deposit", amount: 100, currency: "HBD" }`
- Withdraw: `{ action: "withdraw", amount: 50, currency: "HBD" }`
- Get withdrawals: `{ action: "get_withdrawals", account: "alice" }`

---

### `conversions`

HBD/HIVE conversions: convert, get requests, or check price feed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | enum | Yes | One of: `convert_hbd`, `collateralized_convert`, `get_requests`, `get_price_feed` |
| `amount` | number | Conditional | Amount for conversion |
| `account` | string | Conditional | Account to query (for get_requests) |

**Key Required:** Active (for conversions)

**Examples:**
- Convert HBD: `{ action: "convert_hbd", amount: 100 }`
- Get price: `{ action: "get_price_feed" }`
- Get requests: `{ action: "get_requests", account: "alice" }`

---

### `rewards`

Rewards operations: claim rewards or get reward info.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `claim`, `get_fund_info`, `get_pending` |
| `account` | string | Conditional | - | Account (for get_pending) |
| `fund_name` | string | No | "post" | Fund name (for get_fund_info) |

**Key Required:** Posting (for claim)

**Examples:**
- Claim: `{ action: "claim" }`
- Get pending: `{ action: "get_pending", account: "alice" }`
- Get fund info: `{ action: "get_fund_info" }`

---

## Resource Credits

### `resource_credits`

Resource Credits operations: get RC info or delegate RC.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | enum | Yes | One of: `get_rc`, `delegate_rc` |
| `accounts` | array | Conditional | Accounts to query (for get_rc) |
| `to` | string | Conditional | Account to delegate to (for delegate_rc) |
| `max_rc` | number | Conditional | Maximum RC to delegate |

**Key Required:** Posting (for delegate_rc)

**Examples:**
- Get RC: `{ action: "get_rc", accounts: ["alice", "bob"] }`
- Delegate RC: `{ action: "delegate_rc", to: "newcomer", max_rc: 5000000000 }`

---

## Hive Engine Tools

### `he_tokens`

Hive Engine tokens: balance, info, transfer, stake operations.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `balance`, `info`, `list`, `transfer`, `stake`, `unstake`, `delegate`, `undelegate` |
| `account` | string | Conditional | - | Hive account |
| `symbol` | string | Conditional | - | Token symbol (e.g., LEO, BEE) |
| `quantity` | string | Conditional | - | Amount (as string for precision) |
| `to` | string | Conditional | - | Recipient account |
| `from` | string | Conditional | - | Account to undelegate from |
| `memo` | string | No | "" | Transfer memo |
| `limit` | number | No | 100 | Max results (for list) |
| `offset` | number | No | 0 | Pagination offset |
| `issuer` | string | No | - | Filter by issuer |

**Key Required:** Active (for write operations)

**Examples:**
- Get balance: `{ action: "balance", account: "alice", symbol: "LEO" }`
- Transfer: `{ action: "transfer", to: "bob", symbol: "LEO", quantity: "10" }`
- Stake: `{ action: "stake", symbol: "LEO", quantity: "100" }`

---

### `he_market`

Hive Engine market: orderbook, history, trading operations.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `orderbook`, `history`, `metrics`, `open_orders`, `buy`, `sell`, `cancel` |
| `symbol` | string | Conditional | - | Token symbol |
| `account` | string | Conditional | - | Account (for open_orders) |
| `quantity` | string | Conditional | - | Amount to buy/sell |
| `price` | string | Conditional | - | Price in SWAP.HIVE |
| `type` | enum | Conditional | - | Order type: `buy` or `sell` (for cancel) |
| `id` | string | Conditional | - | Order ID (for cancel) |
| `limit` | number | No | 50 | Max results |

**Key Required:** Active (for buy/sell/cancel)

**Examples:**
- Orderbook: `{ action: "orderbook", symbol: "LEO", limit: 20 }`
- Buy: `{ action: "buy", symbol: "LEO", quantity: "100", price: "0.5" }`
- Cancel: `{ action: "cancel", type: "buy", id: "abc123" }`

---

### `he_nfts`

Hive Engine NFTs: collection, info, buy/sell/transfer operations.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `collection`, `info`, `properties`, `sell_orders`, `transfer`, `sell`, `cancel_sale`, `buy` |
| `symbol` | string | Conditional | - | NFT collection symbol |
| `account` | string | Conditional | - | Account (for collection) |
| `id` | string | No | - | NFT instance ID |
| `ids` | array | Conditional | - | Array of NFT IDs |
| `to` | string | Conditional | - | Recipient (for transfer) |
| `memo` | string | No | "" | Transfer memo |
| `price` | string | Conditional | - | Price per NFT |
| `priceSymbol` | string | No | "SWAP.HIVE" | Price token |
| `marketAccount` | string | No | "nftmarket" | NFT market account |
| `limit` | number | No | 100 | Max results |

**Key Required:** Active (for write operations)

**Examples:**
- Get collection: `{ action: "collection", account: "alice", symbol: "SPLINTERLANDS" }`
- Transfer: `{ action: "transfer", symbol: "MYCARDS", ids: ["123", "456"], to: "bob" }`
- Sell: `{ action: "sell", symbol: "MYCARDS", ids: ["789"], price: "10" }`

---

### `he_pools`

Hive Engine liquidity pools: info, swap, liquidity operations.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | - | One of: `info`, `list`, `estimate_swap`, `swap`, `add_liquidity`, `remove_liquidity` |
| `tokenPair` | string | Conditional | - | Token pair (e.g., "SWAP.HIVE:LEO") |
| `tokenSymbol` | string | Conditional | - | Token to swap from |
| `tokenAmount` | string | Conditional | - | Amount to swap |
| `minAmountOut` | string | No | - | Minimum output (slippage protection) |
| `baseQuantity` | string | Conditional | - | Base token amount |
| `quoteQuantity` | string | Conditional | - | Quote token amount |
| `maxSlippage` | string | No | "0.005" | Max slippage |
| `maxDeviation` | string | No | "0.01" | Max price deviation |
| `shares` | string | Conditional | - | LP shares to remove |
| `limit` | number | No | 100 | Max results |
| `offset` | number | No | 0 | Pagination offset |

**Key Required:** Active (for swap/liquidity operations)

**Examples:**
- Get pool info: `{ action: "info", tokenPair: "SWAP.HIVE:LEO" }`
- Estimate swap: `{ action: "estimate_swap", tokenPair: "SWAP.HIVE:LEO", tokenSymbol: "SWAP.HIVE", tokenAmount: "10" }`
- Swap: `{ action: "swap", tokenPair: "SWAP.HIVE:LEO", tokenSymbol: "SWAP.HIVE", tokenAmount: "10" }`

---

## Standalone Tools

These tools have unique functionality and are not consolidated.

### `send_token`

Send HIVE or HBD tokens to another Hive account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Recipient username |
| `amount` | number | Yes | Amount to send |
| `currency` | enum | Yes | `HIVE` or `HBD` |
| `memo` | string | No | Optional memo |

**Key Required:** Active

---

### `sign_message`

Sign a message using a Hive private key.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | - | Message to sign |
| `key_type` | enum | No | "posting" | Key type: `posting`, `active`, `memo`, or `owner` |

---

### `verify_signature`

Verify a digital signature against a Hive public key.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message_hash` | string | Yes | SHA-256 hash of the message (hex) |
| `signature` | string | Yes | Signature to verify |
| `public_key` | string | Yes | Public key (with or without STM prefix) |

---

### `get_chain_properties`

Get current Hive blockchain properties and statistics.

*No parameters required.*

---

### `get_discussion`

Get full threaded discussion for a Hive post (root post and all nested replies).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the root post |
| `permlink` | string | Yes | Permlink of the root post |

---

### `reblog_post`

Reblog (resteem) a Hive post to share it with your followers.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author` | string | Yes | Author of the post |
| `permlink` | string | Yes | Permlink of the post |

**Key Required:** Posting

*Note: This functionality is also available in `content_engagement` with action `reblog`.*
