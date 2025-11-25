/**
 * Rewards Schemas
 * 
 * Summary: Zod schemas for rewards operations.
 * Purpose: Input validation for claiming rewards and querying reward info.
 * Key elements: claimRewardsSchema, getRewardFundSchema, getPendingRewardsSchema
 * Dependencies: zod
 * Last update: Phase 4 - DeFi operations
 */

import { z } from 'zod';

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

