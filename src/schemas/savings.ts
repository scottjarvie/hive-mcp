/**
 * Savings Schemas
 * 
 * Summary: Zod schemas for savings operations.
 * Purpose: Input validation for savings deposits, withdrawals, and queries.
 * Key elements: transferToSavingsSchema, transferFromSavingsSchema, getSavingsWithdrawalsSchema
 * Dependencies: zod
 * Last update: Phase 4 - DeFi operations
 */

import { z } from 'zod';

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

