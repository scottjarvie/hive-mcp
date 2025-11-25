/**
 * Staking Schemas
 * 
 * Summary: Zod schemas for staking/vesting operations.
 * Purpose: Input validation for power up/down and HP delegation.
 * Key elements: powerUpSchema, powerDownSchema, delegateHpSchema
 * Dependencies: zod
 * Last update: Phase 4 - DeFi operations
 */

import { z } from 'zod';

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

