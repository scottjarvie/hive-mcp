/**
 * Hive Engine Token Schemas
 * 
 * Summary: Zod schemas for Hive Engine token operations.
 * Purpose: Input validation for token queries, transfers, staking.
 * Key elements: heTokensSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related HE token operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all Hive Engine token operations
 * Combines: balance, info, list, transfer, stake, unstake, delegate, undelegate
 */
export const heTokensSchema = z.object({
  action: z.enum(['balance', 'info', 'list', 'transfer', 'stake', 'unstake', 'delegate', 'undelegate']).describe(
    'Action: balance, info, list, transfer, stake, unstake, delegate, or undelegate'
  ),
  // For balance, transfer, stake, delegate, undelegate
  account: z.string().optional().describe('Hive account (for balance, transfer target uses "to")'),
  symbol: z.string().optional().describe('Token symbol (e.g., LEO, POB, BEE)'),
  // For transfer, stake, unstake, delegate, undelegate
  quantity: z.string().optional().describe('Amount (as string for precision)'),
  to: z.string().optional().describe('Recipient account (for transfer, stake, delegate)'),
  from: z.string().optional().describe('Account to undelegate from'),
  memo: z.string().optional().default('').describe('Optional memo (for transfer)'),
  // For list
  limit: z.number().min(1).max(1000).optional().default(100).describe('Max results (for list)'),
  offset: z.number().min(0).optional().default(0).describe('Pagination offset (for list)'),
  issuer: z.string().optional().describe('Filter by issuer (for list)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for get_he_token_balance tool
export const getHETokenBalanceSchema = z.object({
  account: z.string().describe('Hive account name'),
  symbol: z.string().optional().describe('Token symbol (if not provided, returns all balances)'),
});

// Schema for get_he_token_info tool
export const getHETokenInfoSchema = z.object({
  symbol: z.string().describe('Token symbol (e.g., LEO, POB, BEE)'),
});

// Schema for get_he_tokens_list tool
export const getHETokensListSchema = z.object({
  limit: z.number().min(1).max(1000).default(100).describe('Maximum number of tokens to return'),
  offset: z.number().min(0).default(0).describe('Offset for pagination'),
  issuer: z.string().optional().describe('Filter by token issuer'),
});

// Schema for transfer_he_token tool
export const transferHETokenSchema = z.object({
  to: z.string().describe('Recipient Hive account'),
  symbol: z.string().describe('Token symbol to transfer'),
  quantity: z.string().describe('Amount to transfer (as string to preserve precision)'),
  memo: z.string().optional().default('').describe('Optional memo'),
});

// Schema for stake_he_token tool
export const stakeHETokenSchema = z.object({
  symbol: z.string().describe('Token symbol to stake'),
  quantity: z.string().describe('Amount to stake (as string to preserve precision)'),
  to: z.string().optional().describe('Account to stake to (defaults to self)'),
});

// Schema for unstake_he_token tool
export const unstakeHETokenSchema = z.object({
  symbol: z.string().describe('Token symbol to unstake'),
  quantity: z.string().describe('Amount to unstake (as string to preserve precision)'),
});

// Schema for delegate_he_token tool
export const delegateHETokenSchema = z.object({
  symbol: z.string().describe('Token symbol to delegate'),
  quantity: z.string().describe('Amount to delegate (as string to preserve precision)'),
  to: z.string().describe('Account to delegate to'),
});

// Schema for undelegate_he_token tool
export const undelegateHETokenSchema = z.object({
  symbol: z.string().describe('Token symbol to undelegate'),
  quantity: z.string().describe('Amount to undelegate (as string to preserve precision)'),
  from: z.string().describe('Account to undelegate from'),
});

