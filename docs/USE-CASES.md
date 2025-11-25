# Hive MCP Use Cases & Examples

**Purpose:** This document catalogs documented use cases and proposed examples for the Hive MCP Server. We organize them by authentication requirements to help users understand what they can do with and without private keys configured.

---

## Test Accounts

### Read-Only Testing (No Keys Required)

| Account        | Notes                                           |
| -------------- | ----------------------------------------------- |
| `jarvie`       | Active account with lots of history and content |
| `blocktrades`  | Major witness/stakeholder, good for analytics   |
| `asgarth`      | Developer account, varied activity              |
| `yozen`        | Active community member                         |
| `peakd`        | Official PeakD account, app-related posts       |
| `peakmonsters` | Splinterlands market account                    |
| `jarvie-dev`   | Development/test account                        |

### Write Testing (Keys Required)

| Account      | Keys Available | Notes                                     |
| ------------ | -------------- | ----------------------------------------- |
| `jarvie-dev` | All keys       | Primary test account for write operations |

⚠️ **Note:** Only `jarvie-dev` has keys configured for write testing. Be careful with real transactions.

---

## Evaluation Criteria & Scoring

### Testing Methodology

**IMPORTANT:** Tests should be conducted by giving the AI the **natural language prompt** and observing:

1. **Which tools the AI chooses to call** - Don't predetermine or "lead the witness"
2. **The parameters the AI selects** - Did it interpret the request correctly?
3. **The AI's synthesized answer** - How well did it answer the user's question?

The tester should:

- Copy the prompt exactly as written
- Let the AI decide which MCP tools to call
- Observe which tools were called and their response sizes
- Evaluate the final answer the AI provides to the user
- Rate based on the **quality of the answer**, not just raw tool output

### Scoring Scale (1.0-10.0)

| Range      | Meaning                           |
| ---------- | --------------------------------- |
| 1.0 - 2.9  | Poor / Failed / Not useful        |
| 3.0 - 4.9  | Below expectations / Major issues |
| 5.0 - 6.9  | Acceptable / Works with caveats   |
| 7.0 - 8.9  | Good / Works well                 |
| 9.0 - 10.0 | Excellent / Exceeded expectations |

### Field Definitions

- **Val**: Value score (1.0-10.0) - How useful is this use case? Can be revised after testing.
- **Exp**: Expected score (1.0-10.0) - What we expect the MCP to achieve.
- **Res**: Result score (1.0-10.0) - Actual result after testing.
- **Tools**: Number of MCP tool calls the AI made to answer the question.
- **Status**: ⬜ Not tested | ✅ Tested

### What to Track During Testing

1. **Tools Called**: Which MCP tools did the AI choose? List them (e.g., `account_info`, `social_info`)
2. **Response Sizes**: Approximate size of each tool response (small/medium/large or byte count)
3. **Tool Selection**: Did the AI pick the right tools? Were any unnecessary?
4. **Answer Quality**: Did the AI synthesize a good answer from the tool results?
5. **Accuracy**: Was the information correct and complete?
6. **Error Handling**: How did it handle edge cases or errors?

### Recommendations Options

After testing, mark applicable recommendations:

- **Keep**: Works well as-is
- **Enhance**: Could use MCP improvements (describe)
- **Combine**: Should combine with other tools
- **Not Suitable**: Better done manually, not ideal for MCP
- **Error Handling**: Needs better error handling
- **Tool Naming**: Tool names could be clearer for AI discovery
- **OTHER** (give reason)

---

## Table of Contents

1. [Hive Layer 1 (No Keys Required)](#1-hive-layer-1-no-keys-required)
2. [Hive Layer 1 (Keys Required)](#2-hive-layer-1-keys-required)
3. [Hive-Engine Layer 2 (No Keys Required)](#3-hive-engine-layer-2-no-keys-required)
4. [Hive-Engine Layer 2 (Keys Required)](#4-hive-engine-layer-2-keys-required)
5. [Advanced / Multi-Step Use Cases](#5-advanced--multi-step-use-cases)

---

## 1. Hive Layer 1 (No Keys Required)

These are **read-only operations** that anyone can perform without authentication.

### 1.1 Account Information & Research

#### 1.1.1 Get account details

- **Prompt:** "What's the account balance and details for @jarvie?"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** 9.0 | **Tools:** 1 | **Status:** ✅
- **Observations:** Tool returned comprehensive data: HIVE/HBD balances, savings, HP, delegations, profile info, activity dates. All requested info obtained in single call.
- **Recommendation:** Keep

#### 1.1.2 View account history

- **Prompt:** "Get the transaction history for @blocktrades"
- **Val:** 7.5 | **Exp:** 7.5 | **Res:** 8.0 | **Tools:** 1 | **Status:** ✅
- **Observations:** Returns recent operations with human-readable timestamps, tx IDs, and details. For witness accounts, history dominated by producer_rewards. operation_filter param available for filtering.
- **Recommendation:** Keep

#### 1.1.3 Check pending rewards

- **Prompt:** "What rewards does @jarvie have pending to claim?"
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** 9.0 | **Tools:** 1 | **Status:** ✅
- **Observations:** Direct answer with clear breakdown of HIVE, HBD, and vesting rewards. HP equivalent helpfully calculated. Single call, perfect response.
- **Recommendation:** Keep

#### 1.1.4 Get account delegations

- **Prompt:** "Show me who @blocktrades has delegated HP to"
- **Val:** 7.5 | **Exp:** 7.5 | **Res:** 9.0 | **Tools:** 1 | **Status:** ✅
- **Observations:** Returns all outgoing delegations with delegatee, VESTS amount, and delegation start date. Clear single-call response.
- **Recommendation:** Keep (could add HP equivalent but VESTS sufficient)

#### 1.1.5 View account notifications

- **Prompt:** "What are @jarvie's recent notifications?"
- **Val:** 6.0 | **Exp:** 6.0 | **Res:** 9.0 | **Tools:** 1 | **Status:** ✅
- **Observations:** Returns notifications with type_summary, human-readable timestamps, messages, URLs, and scores. Exceeded expectations with comprehensive metadata.
- **Recommendation:** Keep

#### 1.1.6 Get Resource Credits status

- **Prompt:** "What are @jarvie-dev's current Resource Credits?"
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** 9.0 | **Tools:** 1 | **Status:** ✅
- **Observations:** Returns max RC, current RC, percentage, RC delegations in/out, and last update. Complete and clear response.
- **Recommendation:** Keep

#### 1.1.7 Analyze account activity ⭐

- **Prompt:** "Analyze @jarvie's posting patterns over the last month"
- **Val:** 9.0 | **Exp:** 5.5 | **Res:** 7.0 | **Tools:** 2 | **Status:** ✅
- **Observations:** Required 2 calls (get_posts + get_history). Tools lack time-range filtering, so AI must manually filter. Got post frequency, community spread, and comment activity data. Analysis synthesis done by AI.
- **Recommendation:** Enhance - add date-range filtering to posts/history tools

#### 1.1.8 Check voting power

- **Prompt:** "What is @blocktrades's current voting power?"
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** 7.5 | **Tools:** 1 | **Status:** ✅
- **Observations:** Tool returns raw manabar data (current_mana, last_update_time) but not pre-calculated percentage. AI must calculate: current_mana/max_vp \* 100. Data available but requires interpretation.
- **Recommendation:** Enhance - add calculated voting_power_percent field

#### 1.1.9 Compare accounts ⭐

- **Prompt:** "Compare the HP and following of @jarvie vs @asgarth"
- **Val:** 8.5 | **Exp:** 5.5 | **Res:** 8.5 | **Tools:** 4 | **Status:** ✅
- **Observations:** Required 4 parallel calls (2x account_info + 2x social_info). AI successfully synthesized comparison table with HP, followers, following, post counts. Worked better than expected.
- **Recommendation:** Keep (could Enhance with compare tool but parallel calls work well)

---

### 1.2 Content Discovery & Reading

#### 1.2.1 Trending posts by tag

- **Prompt:** "What are the trending posts in the #photography tag on Hive?"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.2 User's recent posts

- **Prompt:** "Show me the recent posts from @peakd"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.3 Get single post

- **Prompt:** "Get the full content of @jarvie's latest post"
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.4 Get post discussions

- **Prompt:** "Show me all comments on @jarvie's latest post"
- **Val:** 7.5 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.5 Hot posts discovery

- **Prompt:** "What are the hot posts in #gaming right now?"
- **Val:** 8.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.6 New posts by tag

- **Prompt:** "Show me the newest posts tagged #hive"
- **Val:** 8.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.7 Get votes on a post

- **Prompt:** "Who voted on @jarvie's latest post?"
- **Val:** 6.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.8 Who reblogged a post

- **Prompt:** "Who has reblogged @peakd's latest post?"
- **Val:** 5.5 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.2.9 Search posts by author ⭐

- **Prompt:** "Find all posts by @asgarth about photography"
- **Val:** 9.0 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** MCP doesn't have text search capability
- **Recommendation:** \_

---

### 1.3 Social Information

#### 1.3.1 Get followers list

- **Prompt:** "Who follows @jarvie on Hive?"
- **Val:** 7.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.3.2 Follower count

- **Prompt:** "How many followers does @blocktrades have?"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.3.3 Get following list

- **Prompt:** "Who does @jarvie follow?"
- **Val:** 7.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.3.4 Check mute list

- **Prompt:** "Who has @jarvie muted?"
- **Val:** 4.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.3.5 Analyze social graph ⭐

- **Prompt:** "What's the follower overlap between @jarvie and @yozen?"
- **Val:** 7.5 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Complex operation requiring multiple calls
- **Recommendation:** \_

---

### 1.4 Community Discovery

#### 1.4.1 List communities

- **Prompt:** "List all Hive communities about photography"
- **Val:** 7.5 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.4.2 Community details

- **Prompt:** "Tell me about the hive-167922 community"
- **Val:** 7.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.4.3 Community subscribers

- **Prompt:** "Who are the top subscribers in the photography community?"
- **Val:** 5.5 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.4.4 Find active communities ⭐

- **Prompt:** "What are the most active communities by posts this week?"
- **Val:** 9.0 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Needs analytics not currently available
- **Recommendation:** \_

#### 1.4.5 Community rules

- **Prompt:** "What are the posting rules for community hive-167922?"
- **Val:** 5.5 | **Exp:** 6.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

### 1.5 Blockchain Information

#### 1.5.1 Chain properties

- **Prompt:** "Get current blockchain properties and statistics"
- **Val:** 7.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.5.2 Price feed

- **Prompt:** "What's the current HBD to HIVE exchange rate?"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.5.3 Reward pool info

- **Prompt:** "What's the current state of the reward pool?"
- **Val:** 7.5 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 1.5.4 Witness information ⭐

- **Prompt:** "Who are the top Hive witnesses?"
- **Val:** 8.0 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** May not be supported by current MCP
- **Recommendation:** \_

---

## 2. Hive Layer 1 (Keys Required)

These operations require private keys. **Test Account: `jarvie-dev` only**

### 2.1 Content Creation (Posting Key)

#### 2.1.1 Create blog post ⭐

- **Prompt:** "Create a new post on Hive about AI technology"
- **Key:** Posting
- **Val:** 9.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.1.2 Create comment

- **Prompt:** "Reply to @jarvie's latest post with 'Great work!'"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.1.3 Update post

- **Prompt:** "Update my post 'test-post' with new content"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.1.4 Delete post

- **Prompt:** "Delete my post with permlink 'test-post'"
- **Key:** Posting
- **Val:** 6.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.1.5 Post with beneficiaries ⭐

- **Prompt:** "Create a post with 10% beneficiary to @hivebuzz"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.1.6 AI-generated content ⭐

- **Prompt:** "Write and post a tutorial about Python on Hive"
- **Key:** Posting
- **Val:** 9.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** High-value AI use case
- **Recommendation:** \_

#### 2.1.7 Schedule-style posting

- **Prompt:** "Draft a post about topic X, then I'll tell you when to post"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 6.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Requires conversation context
- **Recommendation:** \_

---

### 2.2 Content Engagement (Posting Key)

#### 2.2.1 Upvote post

- **Prompt:** "Upvote @jarvie's latest post at 10%"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.2.2 Downvote post

- **Prompt:** "Downvote this spam post at 10% weight"
- **Key:** Posting
- **Val:** 6.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Be careful with testing
- **Recommendation:** \_

#### 2.2.3 Reblog/Resteem

- **Prompt:** "Reblog @peakd's latest post"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.2.4 Vote with specific weight

- **Prompt:** "Upvote @yozen's post at 25% voting power"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.2.5 Curate trending posts ⭐

- **Prompt:** "Upvote the top 3 trending posts in #photography at 10%"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multi-step workflow
- **Recommendation:** \_

---

### 2.3 Social Actions (Posting Key)

#### 2.3.1 Follow account

- **Prompt:** "Follow the account @photography-daily"
- **Key:** Posting
- **Val:** 8.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.3.2 Unfollow account

- **Prompt:** "Unfollow @test-account"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.3.3 Mute account

- **Prompt:** "Mute @spammer-test"
- **Key:** Posting
- **Val:** 6.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.3.4 Unmute account

- **Prompt:** "Unmute @reformed-user"
- **Key:** Posting
- **Val:** 5.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.3.5 Subscribe to community

- **Prompt:** "Subscribe to the hive-167922 community"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.3.6 Unsubscribe from community

- **Prompt:** "Unsubscribe from community hive-123456"
- **Key:** Posting
- **Val:** 6.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

### 2.4 Rewards (Posting Key)

#### 2.4.1 Claim rewards

- **Prompt:** "Claim all my pending rewards"
- **Key:** Posting
- **Val:** 9.5 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.4.2 Auto-claim rewards ⭐

- **Prompt:** "Check if I have pending rewards and claim them"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Two-step operation
- **Recommendation:** \_

---

### 2.5 Resource Credits (Posting Key)

#### 2.5.1 Delegate RC ⭐

- **Prompt:** "Delegate 5 billion RC to @new-user"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Great for onboarding new users
- **Recommendation:** \_

#### 2.5.2 Remove RC delegation

- **Prompt:** "Remove RC delegation from @old-delegatee"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

### 2.6 Financial Operations (Active Key)

#### 2.6.1 Send HIVE

- **Prompt:** "Send 0.001 HIVE to @null"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Test with tiny amounts
- **Recommendation:** \_

#### 2.6.2 Send HBD

- **Prompt:** "Transfer 0.001 HBD to @null with memo 'test'"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.3 Power up

- **Prompt:** "Power up 0.001 HIVE"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.4 Power down

- **Prompt:** "Start power down of 0.001 HP"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.5 Cancel power down

- **Prompt:** "Cancel my current power down"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.6 Delegate HP ⭐

- **Prompt:** "Delegate 0.001 HP to @null"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.7 Undelegate HP

- **Prompt:** "Remove HP delegation from @null"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.8 Deposit to savings

- **Prompt:** "Transfer 0.001 HBD to my savings"
- **Key:** Active
- **Val:** 8.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.9 Withdraw from savings

- **Prompt:** "Withdraw 0.001 HBD from savings"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.10 Convert HBD

- **Prompt:** "Convert 0.001 HBD to HIVE"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.6.11 Collateralized convert

- **Prompt:** "Do a collateralized conversion of 0.001 HIVE"
- **Key:** Active
- **Val:** 6.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

### 2.7 Encrypted Messaging (Memo Key + Active Key for send)

#### 2.7.1 Encrypt message

- **Prompt:** "Encrypt this message for @jarvie: 'Test secret message'"
- **Key:** Memo
- **Val:** 8.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.7.2 Decrypt message

- **Prompt:** "Decrypt this message from @jarvie: '#...'"
- **Key:** Memo
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Need real encrypted message to test
- **Recommendation:** \_

#### 2.7.3 Send encrypted message ⭐

- **Prompt:** "Send an encrypted message to @jarvie saying 'Test from MCP'"
- **Key:** Memo+Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.7.4 Get messages & decrypt

- **Prompt:** "Show me my encrypted messages and decrypt them"
- **Key:** Memo
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.7.5 Private group coordination

- **Prompt:** "Send encrypted message to @jarvie and @asgarth saying 'Team test'"
- **Key:** Memo+Active
- **Val:** 7.5 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multiple calls needed
- **Recommendation:** \_

---

### 2.8 Cryptographic Operations (Various Keys)

#### 2.8.1 Sign message

- **Prompt:** "Sign this message: 'I verify this account'"
- **Key:** Posting/Active/Memo
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Useful for account verification
- **Recommendation:** \_

#### 2.8.2 Verify signature

- **Prompt:** "Verify this signature matches @jarvie's public key"
- **Key:** None
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 2.8.3 Prove account ownership ⭐

- **Prompt:** "Create a signed proof that I own this account"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

## 3. Hive-Engine Layer 2 (No Keys Required)

Read-only operations on the Hive-Engine sidechain.

### 3.1 Token Information

#### 3.1.1 Check token balance

- **Prompt:** "What's @jarvie's LEO token balance?"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.1.2 Get token info

- **Prompt:** "Tell me about the LEO token"
- **Val:** 8.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.1.3 List all tokens

- **Prompt:** "Show me all available Hive-Engine tokens"
- **Val:** 6.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Lots of results, may need filtering
- **Recommendation:** \_

#### 3.1.4 Portfolio overview ⭐

- **Prompt:** "What tokens does @jarvie hold on Hive-Engine?"
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.1.5 Token metrics

- **Prompt:** "What's the market cap and volume for LEO?"
- **Val:** 8.0 | **Exp:** 6.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** May need metrics endpoint
- **Recommendation:** \_

---

### 3.2 Market Information

#### 3.2.1 Get orderbook

- **Prompt:** "Show me the orderbook for the LEO token"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.2.2 Trade history

- **Prompt:** "What's the recent trading history for BEE?"
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.2.3 Market metrics

- **Prompt:** "What's the 24h volume and price change for LEO?"
- **Val:** 8.0 | **Exp:** 6.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.2.4 Open orders

- **Prompt:** "What are @jarvie's open orders on Hive-Engine?"
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.2.5 Price analysis ⭐

- **Prompt:** "Compare LEO and POB prices"
- **Val:** 8.0 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multiple calls needed
- **Recommendation:** \_

---

### 3.3 NFT Information

#### 3.3.1 View NFT collection

- **Prompt:** "What NFTs does @jarvie own on Hive Engine?"
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.3.2 NFT details

- **Prompt:** "Show me details about a specific NFT from collection X"
- **Val:** 6.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.3.3 Collection properties

- **Prompt:** "What are the properties of the CITY NFT collection?"
- **Val:** 6.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.3.4 NFT sell orders

- **Prompt:** "What NFTs are for sale in the CITY collection?"
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.3.5 NFT portfolio value ⭐

- **Prompt:** "Estimate the floor price value of @jarvie's NFT collection"
- **Val:** 9.0 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Complex calculation requiring multiple calls
- **Recommendation:** \_

---

### 3.4 Liquidity Pool Information

#### 3.4.1 Pool info

- **Prompt:** "Get info about the SWAP.HIVE:LEO pool"
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.4.2 List pools

- **Prompt:** "Show me all available liquidity pools"
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.4.3 Estimate swap

- **Prompt:** "How much LEO would I get for 10 SWAP.HIVE?"
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 3.4.4 Pool APR ⭐

- **Prompt:** "What's the current APR for the SWAP.HIVE:BEE pool?"
- **Val:** 9.0 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** APR calculation is complex
- **Recommendation:** \_

---

## 4. Hive-Engine Layer 2 (Keys Required)

Write operations on Hive-Engine. **Test Account: `jarvie-dev` only**

### 4.1 Token Operations (Active Key)

#### 4.1.1 Transfer token

- **Prompt:** "Send 0.001 LEO to @null"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.1.2 Stake token ⭐

- **Prompt:** "Stake 0.001 LEO tokens"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.1.3 Unstake token

- **Prompt:** "Unstake 0.001 LEO tokens"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.1.4 Delegate token

- **Prompt:** "Delegate 0.001 staked LEO to @null"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.1.5 Undelegate token

- **Prompt:** "Remove my LEO delegation from @null"
- **Key:** Active
- **Val:** 6.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

### 4.2 Market Trading (Active Key)

#### 4.2.1 Buy tokens ⭐

- **Prompt:** "Place a buy order for 1 LEO at 0.01 SWAP.HIVE"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.2.2 Sell tokens

- **Prompt:** "Sell 1 BEE tokens at 1.0 SWAP.HIVE each"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.2.3 Cancel order

- **Prompt:** "Cancel my open buy order for LEO"
- **Key:** Active
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.2.4 Market buy ⭐

- **Prompt:** "Buy 1 LEO at market price"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 6.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** May need price check first
- **Recommendation:** \_

---

### 4.3 NFT Operations (Active Key)

#### 4.3.1 Transfer NFT

- **Prompt:** "Transfer NFT #X from COLLECTION to @y"
- **Key:** Active
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.3.2 List NFT for sale

- **Prompt:** "List my NFT #X for 10 SWAP.HIVE"
- **Key:** Active
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.3.3 Cancel NFT sale

- **Prompt:** "Cancel the sale listing for my NFT #X"
- **Key:** Active
- **Val:** 6.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.3.4 Buy NFT ⭐

- **Prompt:** "Buy NFT #X from COLLECTION"
- **Key:** Active
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

### 4.4 Liquidity Pool Operations (Active Key)

#### 4.4.1 Swap tokens ⭐

- **Prompt:** "Swap 0.1 SWAP.HIVE for BEE tokens"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.4.2 Add liquidity

- **Prompt:** "Add liquidity to the SWAP.HIVE:LEO pool"
- **Key:** Active
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 4.4.3 Remove liquidity

- **Prompt:** "Remove my liquidity from the SWAP.HIVE:BEE pool"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

---

## 5. Advanced / Multi-Step Use Cases

These are complex use cases combining multiple operations.

### 5.1 Content & Curation Workflows

#### 5.1.1 Auto-curation bot ⭐

- **Prompt:** "Monitor #photography for new posts and upvote quality content"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multi-step, needs orchestration beyond MCP
- **Recommendation:** \_

#### 5.1.2 Content scheduler

- **Prompt:** "Draft posts for the week and publish one each day"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 2.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Beyond MCP scope - needs external scheduling
- **Recommendation:** \_

#### 5.1.3 Comment responder ⭐

- **Prompt:** "Reply to all comments on my latest post"
- **Key:** Posting
- **Val:** 9.0 | **Exp:** 6.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multiple calls needed
- **Recommendation:** \_

#### 5.1.4 Cross-post curator

- **Prompt:** "Find trending posts in #hive and reblog the best ones"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multi-step workflow
- **Recommendation:** \_

#### 5.1.5 Community engagement

- **Prompt:** "Subscribe to top photography communities and follow active creators"
- **Key:** Posting
- **Val:** 7.5 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Complex workflow
- **Recommendation:** \_

---

### 5.2 Analytics & Research

#### 5.2.1 Account analyzer ⭐

- **Prompt:** "Give me a full analysis of @blocktrades's activity, holdings, and influence"
- **Key:** None
- **Val:** 9.0 | **Exp:** 7.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multi-query operation
- **Recommendation:** \_

#### 5.2.2 Market researcher ⭐

- **Prompt:** "Analyze the LEO token price, volume, and community sentiment"
- **Key:** None
- **Val:** 9.0 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Cross-layer analysis
- **Recommendation:** \_

#### 5.2.3 Community health check

- **Prompt:** "Analyze posting activity and engagement in community hive-167922"
- **Key:** None
- **Val:** 7.5 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 5.2.4 Witness researcher

- **Prompt:** "Compare the top 5 Hive witnesses by reliability and contribution"
- **Key:** None
- **Val:** 7.5 | **Exp:** 3.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Limited data available
- **Recommendation:** \_

#### 5.2.5 Historical analyzer

- **Prompt:** "Show me @jarvie's posting patterns and reward history over 6 months"
- **Key:** None
- **Val:** 8.0 | **Exp:** 4.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** High data volume
- **Recommendation:** \_

---

### 5.3 Financial Workflows

#### 5.3.1 Reward optimizer ⭐

- **Prompt:** "Claim my rewards, then stake the HP and save the HBD"
- **Key:** Posting+Active
- **Val:** 9.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Multi-step operation
- **Recommendation:** \_

#### 5.3.2 DeFi manager ⭐

- **Prompt:** "Check my LP positions and suggest rebalancing"
- **Key:** Active
- **Val:** 9.0 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Complex multi-call operation
- **Recommendation:** \_

#### 5.3.3 Payment processor

- **Prompt:** "Send 0.001 HIVE to each: @a, @b, @c with memo 'Thanks!'"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Batch operation
- **Recommendation:** \_

#### 5.3.4 Delegation manager

- **Prompt:** "Review my HP delegations and list any to inactive accounts"
- **Key:** None/Active
- **Val:** 8.0 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 5.3.5 Savings automation

- **Prompt:** "If I have HBD over 1, move excess to savings"
- **Key:** Active
- **Val:** 7.5 | **Exp:** 4.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Conditional logic needed
- **Recommendation:** \_

---

### 5.4 Social & Community Management

#### 5.4.1 Follow manager

- **Prompt:** "Follow everyone who follows @jarvie (first 10)"
- **Key:** Posting
- **Val:** 6.0 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 5.4.2 Community builder ⭐

- **Prompt:** "Identify and follow the top 10 active users in #photography"
- **Key:** Posting
- **Val:** 8.0 | **Exp:** 4.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Complex multi-step
- **Recommendation:** \_

#### 5.4.3 Engagement tracker

- **Prompt:** "List who's engaging with my posts lately"
- **Key:** None
- **Val:** 8.0 | **Exp:** 5.5 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 5.4.4 Spam detector

- **Prompt:** "Identify accounts that appear to be spamming in #hive"
- **Key:** None
- **Val:** 6.0 | **Exp:** 2.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Beyond MCP scope
- **Recommendation:** \_

---

### 5.5 Developer & Integration Use Cases

#### 5.5.1 Account verification ⭐

- **Prompt:** "Sign a message to prove I own this account"
- **Key:** Any
- **Val:** 9.0 | **Exp:** 9.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 5.5.2 Webhook alternative

- **Prompt:** "Check @jarvie for new posts since yesterday"
- **Key:** None
- **Val:** 6.0 | **Exp:** 6.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Polling-based approach
- **Recommendation:** \_

#### 5.5.3 Data export

- **Prompt:** "Export my last 10 posts in a readable format"
- **Key:** None
- **Val:** 8.0 | **Exp:** 8.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** \_
- **Recommendation:** \_

#### 5.5.4 Cross-chain prep

- **Prompt:** "Get all the data needed to bridge my assets"
- **Key:** None
- **Val:** 6.0 | **Exp:** 4.0 | **Res:** _ | **Tools:** _ | **Status:** ⬜
- **Observations:** Limited scope
- **Recommendation:** \_

---

## Testing Progress

### Summary by Section

| Section              | Total   | Tested | Avg Result |
| -------------------- | ------- | ------ | ---------- |
| 1. Hive L1 (No Keys) | 32      | 9      | 8.5        |
| 2. Hive L1 (Keys)    | 34      | 0      | -          |
| 3. HE L2 (No Keys)   | 19      | 0      | -          |
| 4. HE L2 (Keys)      | 16      | 0      | -          |
| 5. Advanced          | 21      | 0      | -          |
| **Total**            | **122** | **9**  | **8.5**    |

---

## MCP Enhancement Ideas

Track suggestions for improving the MCP based on testing:

| ID    | Category | Description | Priority | Status |
| ----- | -------- | ----------- | -------- | ------ |
| E-001 |          |             |          |        |
| E-002 |          |             |          |        |

---

## Detailed Test Results

Use this section for expanded test notes when needed:

```
### Test [ID] - [Name]
Date: YYYY-MM-DD
Tester: [name]

**Execution:**
- Prompt: "[exact prompt used]"
- Account: @[test account used]

**Tools Called by AI:**
| Tool Name | Parameters | Response Size |
|-----------|------------|---------------|
| [tool]    | [params]   | [small/med/lg or KB] |

**AI's Answer Summary:**
[Brief summary of how the AI answered the user's question]

**Scores:**
- Value (revised): X.X
- Result: X.X

**What worked:**
- [Did AI pick correct tools?]
- [Was the answer accurate?]
- [Was it well synthesized?]

**What didn't:**
- [Wrong tools selected?]
- [Missing information?]
- [Poor synthesis?]

**Recommendation:** [Keep/Enhance/Combine/Not Suitable/Error Handling/Tool Naming]
- Details:
```

---

_Last Updated: November 25, 2025_
_Document Version: 3.1 - Updated testing methodology_
