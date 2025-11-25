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

### Tools (22 consolidated tools)

Tools have been consolidated into logical groups with an `action` parameter to reduce complexity while maintaining full functionality. This improves AI tool selection and reduces context window usage.

#### Social (2 tools)

| Tool                  | Actions                                    | Description                                       |
| --------------------- | ------------------------------------------ | ------------------------------------------------- |
| `social_relationship` | follow, unfollow, mute, unmute             | Manage social relationships with other accounts   |
| `social_info`         | get_followers, get_following, get_follow_count | Get social statistics and lists               |

#### Communities (2 tools)

| Tool                   | Actions                              | Description                        |
| ---------------------- | ------------------------------------ | ---------------------------------- |
| `community_membership` | subscribe, unsubscribe, get_subscribers | Manage community membership     |
| `community_info`       | get_community, list_communities      | Get community information          |

#### Content (3 tools)

| Tool                | Actions                                           | Description                                    |
| ------------------- | ------------------------------------------------- | ---------------------------------------------- |
| `get_posts`         | by_tag, by_user, single                           | Get posts by tag, user, or specific post       |
| `content_manage`    | create_post, create_comment, update, delete       | Create, update, and delete content             |
| `content_engagement`| vote, reblog, get_replies, get_votes, get_reblogged_by | Engage with content                      |

#### Account & Messaging (2 tools)

| Tool           | Actions                                           | Description                                |
| -------------- | ------------------------------------------------- | ------------------------------------------ |
| `account_info` | get_info, get_history, get_delegations, get_notifications | Get account information            |
| `messaging`    | encrypt, decrypt, send, get_messages              | Encrypted messaging operations             |

#### DeFi (4 tools)

| Tool          | Actions                                              | Description                           |
| ------------- | ---------------------------------------------------- | ------------------------------------- |
| `staking`     | power_up, power_down, cancel_power_down, delegate_hp, undelegate_hp | HP staking operations |
| `savings`     | deposit, withdraw, cancel_withdraw, get_withdrawals  | Savings account operations            |
| `conversions` | convert_hbd, collateralized_convert, get_requests, get_price_feed | HBD/HIVE conversions |
| `rewards`     | claim, get_fund_info, get_pending                    | Rewards operations                    |

#### Resource Credits (1 tool)

| Tool               | Actions              | Description                    |
| ------------------ | -------------------- | ------------------------------ |
| `resource_credits` | get_rc, delegate_rc  | RC info and delegation         |

#### Hive Engine (4 tools)

| Tool        | Actions                                              | Description                     |
| ----------- | ---------------------------------------------------- | ------------------------------- |
| `he_tokens` | balance, info, list, transfer, stake, unstake, delegate, undelegate | Token operations |
| `he_market` | orderbook, history, metrics, open_orders, buy, sell, cancel | Market trading       |
| `he_nfts`   | collection, info, properties, sell_orders, transfer, sell, cancel_sale, buy | NFT operations |
| `he_pools`  | info, list, estimate_swap, swap, add_liquidity, remove_liquidity | Liquidity pools   |

#### Standalone Tools (4 tools)

| Tool                 | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `send_token`         | Send HIVE or HBD to another account                  |
| `sign_message`       | Sign a message with a Hive private key               |
| `verify_signature`   | Verify a signature against a public key              |
| `get_chain_properties` | Get current blockchain properties                  |
| `get_discussion`     | Get full threaded discussion for a post              |
| `reblog_post`        | Reblog (resteem) a post (convenience duplicate)      |

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

For detailed parameter documentation for all tools, see [docs/TOOLS.md](docs/TOOLS.md).

## Acknowledgments

This project was originally created by [Gregory Luneau (@gluneau)](https://github.com/gluneau/hive-mcp-server) using the @hiveio/dhive library. The codebase has been extensively rewritten by [@jarvie](https://github.com/scottjarvie) to use the modern [@hiveio/wax](https://www.npmjs.com/package/@hiveio/wax) library and consolidated into 22 action-based tools (from 74 individual tools), adding comprehensive support for:

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
