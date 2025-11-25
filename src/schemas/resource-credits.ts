/**
 * Resource Credits Schemas
 * 
 * Summary: Zod schemas for Resource Credits tools.
 * Purpose: Input validation for RC delegation and queries.
 * Key elements: resourceCreditsSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related RC operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for Resource Credits operations
 * Combines: get_rc_accounts, delegate_rc
 */
export const resourceCreditsSchema = z.object({
  action: z.enum(['get_rc', 'delegate_rc']).describe(
    'Action: get_rc (query RC info) or delegate_rc (delegate RC to another account)'
  ),
  // For get_rc
  accounts: z.array(z.string()).min(1).max(100).optional().describe('Accounts to get RC info for (for get_rc)'),
  // For delegate_rc
  to: z.string().optional().describe('Account to delegate RC to (for delegate_rc)'),
  max_rc: z.number().min(0).optional().describe('Maximum RC to delegate (for delegate_rc)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for delegate_rc tool
export const delegateRcSchema = z.object({
  to: z.string().describe('Account to delegate RC to'),
  max_rc: z.number().min(0).describe('Maximum amount of RC to delegate (in RC units)'),
});

// Schema for get_rc_accounts tool
export const getRcAccountsSchema = z.object({
  accounts: z.array(z.string()).min(1).max(100).describe('List of accounts to get RC info for'),
});

