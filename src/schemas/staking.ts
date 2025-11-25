/**
 * Staking Schemas
 * 
 * Summary: Zod schemas for staking/vesting operations.
 * Purpose: Input validation for power up/down and HP delegation.
 * Key elements: stakingSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related staking operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all staking operations
 * Combines: power_up, power_down, cancel_power_down, delegate_hp, undelegate_hp
 */
export const stakingSchema = z.object({
  action: z.enum(['power_up', 'power_down', 'cancel_power_down', 'delegate_hp', 'undelegate_hp']).describe(
    'Action to perform: power_up, power_down, cancel_power_down, delegate_hp, or undelegate_hp'
  ),
  amount: z.number().positive().optional().describe('Amount of HIVE/HP (for power_up, power_down, delegate_hp)'),
  to: z.string().optional().describe('Target account (for power_up to another account)'),
  delegatee: z.string().optional().describe('Account to delegate to or undelegate from (for delegate_hp, undelegate_hp)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for power_up tool (transfer_to_vesting)
export const powerUpSchema = z.object({
  amount: z.number().positive().describe('Amount of HIVE to power up'),
  to: z.string().optional().describe('Account to power up (defaults to self)'),
});

// Schema for power_down tool (withdraw_vesting)
export const powerDownSchema = z.object({
  amount: z.number().positive().describe('Amount of HP (in HIVE equivalent) to power down'),
});

// Schema for cancel_power_down tool
export const cancelPowerDownSchema = z.object({});

// Schema for delegate_hp tool
export const delegateHpSchema = z.object({
  delegatee: z.string().describe('Account to delegate HP to'),
  amount: z.number().positive().describe('Amount of HP (in HIVE equivalent) to delegate'),
});

// Schema for undelegate_hp tool
export const undelegateHpSchema = z.object({
  delegatee: z.string().describe('Account to remove delegation from'),
});

