/**
 * Savings Schemas
 * 
 * Summary: Zod schemas for savings operations.
 * Purpose: Input validation for savings deposits, withdrawals, and queries.
 * Key elements: savingsSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related savings operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all savings operations
 * Combines: transfer_to_savings, transfer_from_savings, cancel_savings_withdraw, get_savings_withdrawals
 */
export const savingsSchema = z.object({
  action: z.enum(['deposit', 'withdraw', 'cancel_withdraw', 'get_withdrawals']).describe(
    'Action to perform: deposit, withdraw, cancel_withdraw, or get_withdrawals'
  ),
  amount: z.number().positive().optional().describe('Amount to deposit/withdraw (for deposit, withdraw)'),
  currency: z.enum(['HIVE', 'HBD']).optional().describe('Currency: HIVE or HBD (for deposit, withdraw)'),
  to: z.string().optional().describe('Target account (defaults to self)'),
  memo: z.string().optional().default('').describe('Optional memo (for deposit, withdraw)'),
  request_id: z.number().optional().describe('Withdrawal request ID (for cancel_withdraw)'),
  account: z.string().optional().describe('Account to query (for get_withdrawals)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for transfer_to_savings tool
export const transferToSavingsSchema = z.object({
  amount: z.number().positive().describe('Amount to transfer to savings'),
  currency: z.enum(['HIVE', 'HBD']).describe('Currency to transfer (HIVE or HBD)'),
  to: z.string().optional().describe('Account to send savings to (defaults to self)'),
  memo: z.string().optional().default('').describe('Optional memo'),
});

// Schema for transfer_from_savings tool
export const transferFromSavingsSchema = z.object({
  amount: z.number().positive().describe('Amount to withdraw from savings'),
  currency: z.enum(['HIVE', 'HBD']).describe('Currency to withdraw (HIVE or HBD)'),
  to: z.string().optional().describe('Account to send withdrawal to (defaults to self)'),
  memo: z.string().optional().default('').describe('Optional memo'),
});

// Schema for cancel_savings_withdraw tool
export const cancelSavingsWithdrawSchema = z.object({
  request_id: z.number().describe('Request ID of the withdrawal to cancel'),
});

// Schema for get_savings_withdrawals tool
export const getSavingsWithdrawalsSchema = z.object({
  account: z.string().describe('Account to get pending withdrawals for'),
});

