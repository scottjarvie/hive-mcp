/**
 * Resource Credits Schemas
 * 
 * Summary: Zod schemas for Resource Credits tools.
 * Purpose: Input validation for RC delegation and queries.
 * Key elements: delegateRcSchema, getRcAccountsSchema
 * Dependencies: zod
 * Last update: Phase 3 - RC operations
 */

import { z } from 'zod';

// Schema for delegate_rc tool
export const delegateRcSchema = z.object({
  to: z.string().describe('Account to delegate RC to'),
  max_rc: z.number().min(0).describe('Maximum amount of RC to delegate (in RC units)'),
});

// Schema for get_rc_accounts tool
export const getRcAccountsSchema = z.object({
  accounts: z.array(z.string()).min(1).max(100).describe('List of accounts to get RC info for'),
});

