# Hive MCP

A comprehensive MCP server that enables AI assistants to interact with the Hive blockchain and Hive Engine sidechain through the Model Context Protocol. Built with [@hiveio/wax](https://www.npmjs.com/package/@hiveio/wax) for modern, type-safe blockchain interactions.

## Overview

This server provides a bridge between AI assistants (like Claude) and the Hive ecosystem, allowing AI models to:

- **Account & Blockchain**: Fetch account information, history, delegations, and chain properties
- **Content**: Read posts, comments, votes, and discussions; create and edit content
- **Social**: Follow/unfollow accounts, mute users, reblog posts
- **Communities**: Browse and interact with Hive communities
- **DeFi**: Stake HIVE (power up/down), manage savings, claim rewards, convert tokens
- **Resource Credits**: Monitor and delegate RC for account operations
- **Cryptography**: Sign/verify messages, encrypt/decrypt private communications
- **Hive Engine**: Trade tokens, manage NFTs, swap via liquidity pools

## Features

### Prompts

- `create-post` - Creates a structured prompt to guide the AI through creating a new Hive post with the right format and tags
- `analyze-account` - Generates a prompt to analyze a Hive account's statistics, posting history, and activity patterns

### Tools (84 total)

#### Account & Blockchain (4 tools)

| Tool                      | Description                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| `get_account_info`        | Get detailed account information including balance, voting power, and authority |
| `get_account_history`     | Get transaction history with optional operation type filtering                  |
| `get_vesting_delegations` | Get HP delegations made by an account                                           |
| `get_chain_properties`    | Get current blockchain properties and statistics                                |

#### Content Reading (8 tools)

| Tool                        | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `get_post_content`          | Get a specific post by author and permlink               |
| `get_posts_by_tag`          | Get posts filtered by tag (trending, hot, created, etc.) |
| `get_posts_by_user`         | Get posts from a user's blog or feed                     |
| `get_content_replies`       | Get all replies/comments on a post                       |
| `get_active_votes`          | Get all votes on a post with voter details               |
| `get_reblogged_by`          | Get list of accounts that reblogged a post               |
| `get_account_notifications` | Get account notifications (mentions, replies, votes)     |
| `get_discussion`            | Get full threaded discussion for a post                  |

#### Content Writing (5 tools)

| Tool             | Key     | Description                             |
| ---------------- | ------- | --------------------------------------- |
| `create_post`    | Posting | Create a new blog post                  |
| `create_comment` | Posting | Comment on a post or reply to a comment |
| `update_post`    | Posting | Edit an existing post or comment        |
| `delete_comment` | Posting | Delete a post or comment                |
| `vote_on_post`   | Posting | Upvote or downvote content              |

#### Social (8 tools)

| Tool               | Key     | Description                          |
| ------------------ | ------- | ------------------------------------ |
| `get_followers`    | -       | Get list of followers for an account |
| `get_following`    | -       | Get list of accounts a user follows  |
| `get_follow_count` | -       | Get follower/following counts        |
| `follow_account`   | Posting | Follow an account                    |
| `unfollow_account` | Posting | Unfollow an account                  |
| `mute_account`     | Posting | Mute an account                      |
| `unmute_account`   | Posting | Unmute an account                    |
| `reblog_post`      | Posting | Reblog (resteem) a post              |

#### Communities (5 tools)

| Tool                        | Key     | Description                   |
| --------------------------- | ------- | ----------------------------- |
| `get_community`             | -       | Get community details         |
| `list_communities`          | -       | List and search communities   |
| `get_community_subscribers` | -       | Get community subscriber list |
| `subscribe_community`       | Posting | Subscribe to a community      |
| `unsubscribe_community`     | Posting | Unsubscribe from a community  |

#### Cryptography (2 tools)

| Tool               | Description                             |
| ------------------ | --------------------------------------- |
| `sign_message`     | Sign a message with a Hive private key  |
| `verify_signature` | Verify a signature against a public key |

#### Encrypted Messaging (4 tools)

| Tool                     | Key           | Description                               |
| ------------------------ | ------------- | ----------------------------------------- |
| `encrypt_message`        | Memo          | Encrypt a message for another account     |
| `decrypt_message`        | Memo          | Decrypt a received encrypted message      |
| `send_encrypted_message` | Active + Memo | Send encrypted message via token transfer |
| `get_encrypted_messages` | Memo          | Retrieve and decrypt message history      |

#### Token Transfers (1 tool)

| Tool         | Key    | Description                         |
| ------------ | ------ | ----------------------------------- |
| `send_token` | Active | Send HIVE or HBD to another account |

#### DeFi - Staking (5 tools)

| Tool                | Key    | Description                          |
| ------------------- | ------ | ------------------------------------ |
| `power_up`          | Active | Convert HIVE to Hive Power (HP)      |
| `power_down`        | Active | Start power down (13-week unstaking) |
| `cancel_power_down` | Active | Cancel ongoing power down            |
| `delegate_hp`       | Active | Delegate HP to another account       |
| `undelegate_hp`     | Active | Remove HP delegation                 |

#### DeFi - Rewards (3 tools)

| Tool                  | Key     | Description                           |
| --------------------- | ------- | ------------------------------------- |
| `claim_rewards`       | Posting | Claim pending author/curation rewards |
| `get_reward_fund`     | -       | Get reward pool information           |
| `get_pending_rewards` | -       | Get unclaimed rewards for an account  |

#### DeFi - Savings (4 tools)

| Tool                      | Key    | Description                             |
| ------------------------- | ------ | --------------------------------------- |
| `transfer_to_savings`     | Active | Deposit to savings (HBD earns ~20% APR) |
| `transfer_from_savings`   | Active | Withdraw from savings (3-day wait)      |
| `cancel_savings_withdraw` | Active | Cancel pending withdrawal               |
| `get_savings_withdrawals` | -      | Get pending withdrawals                 |

#### DeFi - Conversions (4 tools)

| Tool                      | Key    | Description                              |
| ------------------------- | ------ | ---------------------------------------- |
| `convert_hbd`             | Active | Convert HBD to HIVE (3.5-day conversion) |
| `collateralized_convert`  | Active | Instant HBD→HIVE with collateral         |
| `get_conversion_requests` | -      | Get pending conversions                  |
| `get_current_price_feed`  | -      | Get HBD/HIVE median price                |

#### Resource Credits (2 tools)

| Tool              | Key     | Description                    |
| ----------------- | ------- | ------------------------------ |
| `get_rc_accounts` | -       | Get RC info for accounts       |
| `delegate_rc`     | Posting | Delegate RC to another account |

#### Hive Engine - Tokens (8 tools)

| Tool                   | Key    | Description                              |
| ---------------------- | ------ | ---------------------------------------- |
| `get_he_token_balance` | -      | Get HE token balances for an account     |
| `get_he_token_info`    | -      | Get token details (supply, issuer, etc.) |
| `get_he_tokens_list`   | -      | List all tokens with filtering           |
| `transfer_he_token`    | Active | Transfer HE tokens                       |
| `stake_he_token`       | Active | Stake tokens for voting power            |
| `unstake_he_token`     | Active | Begin unstaking (cooldown applies)       |
| `delegate_he_token`    | Active | Delegate staked tokens                   |
| `undelegate_he_token`  | Active | Remove token delegation                  |

#### Hive Engine - Market (7 tools)

| Tool                      | Key    | Description                     |
| ------------------------- | ------ | ------------------------------- |
| `get_he_market_orderbook` | -      | Get buy/sell orders for a token |
| `get_he_market_history`   | -      | Get recent trades               |
| `get_he_market_metrics`   | -      | Get price, volume, market cap   |
| `get_he_open_orders`      | -      | Get user's open orders          |
| `place_he_buy_order`      | Active | Place limit buy order           |
| `place_he_sell_order`     | Active | Place limit sell order          |
| `cancel_he_order`         | Active | Cancel an open order            |

#### Hive Engine - NFTs (8 tools)

| Tool                     | Key    | Description                  |
| ------------------------ | ------ | ---------------------------- |
| `get_he_nft_collection`  | -      | Get NFTs owned by an account |
| `get_he_nft_info`        | -      | Get NFT details              |
| `get_he_nft_properties`  | -      | Get NFT collection schema    |
| `get_he_nft_sell_orders` | -      | Get NFTs for sale            |
| `transfer_he_nft`        | Active | Transfer NFTs                |
| `sell_he_nft`            | Active | List NFTs for sale           |
| `cancel_he_nft_sale`     | Active | Cancel NFT listing           |
| `buy_he_nft`             | Active | Purchase NFTs                |

#### Hive Engine - Liquidity Pools (6 tools)

| Tool                  | Key    | Description                    |
| --------------------- | ------ | ------------------------------ |
| `get_he_pool_info`    | -      | Get pool details               |
| `get_he_pools_list`   | -      | List all liquidity pools       |
| `estimate_he_swap`    | -      | Calculate swap output/slippage |
| `swap_he_tokens`      | Active | Swap tokens via DEX            |
| `add_he_liquidity`    | Active | Add liquidity to a pool        |
| `remove_he_liquidity` | Active | Remove liquidity from a pool   |

## Debugging with MCP Inspector

The MCP Inspector provides an interactive interface for testing and debugging the server:

```bash
npx @modelcontextprotocol/inspector npx @jarvie/hive-mcp
```

### Authentication Configuration

To enable authenticated operations (voting, posting, sending tokens), you'll need to set environment variables:

```bash
export HIVE_USERNAME=your-hive-username
export HIVE_POSTING_KEY=your-hive-posting-private-key  # For content operations
export HIVE_ACTIVE_KEY=your-hive-active-private-key    # For token transfers
export HIVE_MEMO_KEY=your-hive-memo-private-key        # For encrypted messaging
```

**Security Note**: Never share your private keys or commit them to version control. Use environment variables or a secure configuration approach.

## Integration with AI Assistants

### Claude Desktop

To use this server with Claude Desktop:

1. Ensure you have [Claude Desktop](https://claude.ai/download) installed
2. Open or create the Claude configuration file:

   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

3. Add this server to your configuration:

```json
{
  "mcpServers": {
    "hive": {
      "command": "npx",
      "args": ["-y", "@jarvie/hive-mcp"],
      "env": {
        "HIVE_USERNAME": "your-hive-username",
        "HIVE_POSTING_KEY": "your-hive-posting-private-key",
        "HIVE_ACTIVE_KEY": "your-hive-active-private-key",
        "HIVE_MEMO_KEY": "your-hive-memo-private-key"
      }
    }
  }
}
```

### Windsurf and Cursor

The same JSON configuration works for Windsurf (in `windsurf_config.json`) and for Cursor (in `~/.cursor/mcp.json` for version >= 0.47).

In previous versions, you'll have to use the 1 line command format in the MCP section of the Settings:
`env HIVE_USERNAME=your-hive-username env HIVE_POSTING_KEY=your-hive-posting-private-key env HIVE_ACTIVE_KEY=your-hive-active-private-key env HIVE_MEMO_KEY=your-hive-memo-private-key npx -y @jarvie/hive-mcp`

## Examples

Once connected to an MCP client, you can ask questions like:

### Account & Content

- "What are the trending posts in the #photography tag on Hive?"
- "Show me the recent posts from username 'alice'"
- "What's the account balance and details for 'bob'?"
- "Get the transaction history for 'charlie'"
- "Can you upvote the post by 'dave' with permlink 'my-awesome-post'?"
- "Create a new post on Hive about AI technology"

### Social & Communities

- "Who follows @alice on Hive?"
- "How many followers does @bob have?"
- "Follow the account @photography-daily"
- "List all Hive communities about photography"
- "Subscribe to the hive-167922 community"
- "Reblog the post by @alice with permlink 'my-photo'"

### DeFi Operations

- "Power up 100 HIVE to increase my voting power"
- "What rewards do I have pending to claim?"
- "Claim all my pending rewards"
- "Transfer 50 HBD to my savings account"
- "What's the current HBD to HIVE exchange rate?"
- "Delegate 500 HP to @newcomer-support"

### Encrypted Messaging

- "Encrypt this message for user 'alice': 'This is a secret message'"
- "Decrypt this message from 'bob': '#4f3a5b...'"
- "Send an encrypted message to 'charlie' saying 'Let's meet tomorrow'"
- "Show me my encrypted messages and decrypt them"

### Hive Engine

- "What's my LEO token balance?"
- "Show me the orderbook for the LEO token"
- "Place a buy order for 100 LEO at 0.5 SWAP.HIVE"
- "What NFTs do I own on Hive Engine?"
- "Swap 10 SWAP.HIVE for BEE tokens"
- "Add liquidity to the SWAP.HIVE:LEO pool"

### Resource Credits

- "What are my current Resource Credits?"
- "Delegate 5 billion RC to @new-user"

## Architecture

### Multi-Node Failover

The server implements automatic failover for both Hive and Hive Engine APIs:

**Hive API Nodes:**

- `https://api.hive.blog`
- `https://api.deathwing.me`
- `https://hive-api.arcange.eu`
- `https://api.openhive.network`

**Hive Engine API Nodes:**

- `https://api.hive-engine.com/rpc`
- `https://engine.rishipanthee.com`
- `https://herpc.dtools.dev`
- `https://api.primersion.com`

Failed nodes are automatically marked unhealthy and requests are routed to healthy nodes. Node health is periodically re-evaluated.

## Development

### Project Structure

```
src/
├── index.ts              # Main server entry point
├── config/               # Client configuration and environment handling
├── schemas/              # Zod schemas for tool parameter validation
│   ├── account.ts
│   ├── content.ts
│   ├── social.ts
│   ├── community.ts
│   ├── staking.ts
│   ├── hive-engine-*.ts
│   └── ...
├── tools/                # Tool implementations
│   ├── account.ts
│   ├── content.ts
│   ├── social.ts
│   ├── community.ts
│   ├── staking.ts
│   ├── hive-engine-*.ts
│   └── ...
└── utils/
    ├── api.ts            # Hive API calls with failover
    ├── hive-engine-api.ts # HE API calls with failover
    ├── response.ts       # Response formatting
    ├── error.ts          # Error handling
    └── logger.ts         # Logging utilities
```

### Dependencies

- [@hiveio/wax](https://www.npmjs.com/package/@hiveio/wax) - Modern Hive blockchain client
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - MCP SDK
- [zod](https://www.npmjs.com/package/zod) - Schema validation

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## Tool Reference

For detailed parameter documentation for all 84 tools, see [docs/TOOLS.md](docs/TOOLS.md).

## Acknowledgments

This project was originally created by [Gregory Luneau (@gluneau)](https://github.com/gluneau/hive-mcp-server) using the @hiveio/dhive library. The codebase has been extensively rewritten by [@jarvie](https://github.com/scottjarvie) to use the modern [@hiveio/wax](https://www.npmjs.com/package/@hiveio/wax) library and expanded from 17 to 84 tools, adding comprehensive support for:

- Social features (follow, mute, reblog)
- Community interactions
- DeFi operations (staking, savings, conversions)
- Resource Credits management
- Hive Engine (tokens, NFTs, market, liquidity pools)
- Multi-node failover for reliability

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more detailed contribution guidelines.
