/**
 * Rewards Schemas
 * 
 * Summary: Zod schemas for rewards operations.
 * Purpose: Input validation for claiming rewards and querying reward info.
 * Key elements: rewardsSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related rewards operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all rewards operations
 * Combines: claim_rewards, get_reward_fund, get_pending_rewards
 */
export const rewardsSchema = z.object({
  action: z.enum(['claim', 'get_fund_info', 'get_pending']).describe(
    'Action to perform: claim, get_fund_info, or get_pending'
  ),
  account: z.string().optional().describe('Account to get pending rewards for (for get_pending)'),
  fund_name: z.string().optional().default('post').describe('Name of the reward fund (for get_fund_info)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for claim_rewards tool
export const claimRewardsSchema = z.object({});

// Schema for get_reward_fund tool
export const getRewardFundSchema = z.object({
  fund_name: z.string().default('post').describe('Name of the reward fund (default: "post")'),
});

// Schema for get_pending_rewards tool
export const getPendingRewardsSchema = z.object({
  account: z.string().describe('Account to get pending rewards for'),
});

