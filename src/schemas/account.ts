/**
 * Account-related Schemas
 * 
 * Summary: Zod schemas for account information tools.
 * Purpose: Input validation for account queries and history.
 * Key elements: accountInfoSchema (consolidated)
 * Dependencies: zod, common.js
 * Last update: Added get_profile action for human-readable profile with reputation
 */

import { z } from 'zod';
import { operationFilterSchema } from './common.js';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for account information queries
 * Combines: get_account_info, get_account_profile, get_account_history, get_vesting_delegations, get_account_notifications
 */
export const accountInfoSchema = z.object({
  action: z.enum(['get_info', 'get_profile', 'get_history', 'get_delegations', 'get_notifications']).describe(
    'Action: get_info, get_profile, get_history, get_delegations, or get_notifications'
  ),
  username: z.string().optional().describe('Hive username/account to query'),
  // For get_history
  limit: z.number().min(1).max(1000).optional().default(10).describe('Max results to return'),
  operation_filter: operationFilterSchema.optional().describe(
    'Operation types to filter (for get_history). Array or comma-separated string.'
  ),
  // For get_delegations
  from: z.string().optional().describe('Starting account for pagination (for get_delegations)'),
  // For get_notifications
  last_id: z.number().optional().describe('Last notification ID for pagination (for get_notifications)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for get_account_info tool
export const getAccountInfoSchema = z.object({
  username: z.string().describe('Hive username to fetch information for'),
});

// Schema for get_account_history tool
export const getAccountHistorySchema = z.object({
  username: z.string().describe('Hive username'),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(10)
    .describe('Number of operations to return'),
  operation_filter: operationFilterSchema.describe(
    'Operation types to filter for. Can be provided as an array [\'transfer\', \'vote\'] or a comma-separated string \'transfer,vote\''
  ),
});

// Schema for get_vesting_delegations tool
export const getVestingDelegationsSchema = z.object({
  username: z.string().describe('Hive account to get delegations for'),
  limit: z.number().min(1).max(1000).default(100).describe('Maximum number of delegations to retrieve'),
  from: z.string().optional().describe('Optional starting account for pagination'),
});
