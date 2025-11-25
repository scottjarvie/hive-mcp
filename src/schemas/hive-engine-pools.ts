/**
 * Hive Engine Pool Schemas
 * 
 * Summary: Zod schemas for Hive Engine liquidity pool operations.
 * Purpose: Input validation for pool queries and swaps.
 * Key elements: getHEPoolInfoSchema, swapHETokensSchema
 * Dependencies: zod
 * Last update: Phase 5 - Hive Engine integration
 */

import { z } from 'zod';

// Schema for get_he_pool_info tool
export const getHEPoolInfoSchema = z.object({
  tokenPair: z.string().describe('Token pair (e.g., "SWAP.HIVE:LEO")'),
});

// Schema for get_he_pools_list tool
export const getHEPoolsListSchema = z.object({
  limit: z.number().min(1).max(500).default(100).describe('Maximum pools to return'),
  offset: z.number().min(0).default(0).describe('Offset for pagination'),
});

// Schema for estimate_he_swap tool
export const estimateHESwapSchema = z.object({
  tokenPair: z.string().describe('Token pair (e.g., "SWAP.HIVE:LEO")'),
  tokenSymbol: z.string().describe('Token you are swapping FROM'),
  tokenAmount: z.string().describe('Amount to swap'),
});

// Schema for swap_he_tokens tool
export const swapHETokensSchema = z.object({
  tokenPair: z.string().describe('Token pair (e.g., "SWAP.HIVE:LEO")'),
  tokenSymbol: z.string().describe('Token you are swapping FROM'),
  tokenAmount: z.string().describe('Amount to swap'),
  minAmountOut: z.string().optional().describe('Minimum output amount (slippage protection)'),
});

// Schema for add_he_liquidity tool
export const addHELiquiditySchema = z.object({
  tokenPair: z.string().describe('Token pair to add liquidity to'),
  baseQuantity: z.string().describe('Amount of base token to add'),
  quoteQuantity: z.string().describe('Amount of quote token to add'),
  maxSlippage: z.string().optional().default('0.005').describe('Maximum slippage (default 0.5%)'),
  maxDeviation: z.string().optional().default('0.01').describe('Maximum price deviation (default 1%)'),
});

// Schema for remove_he_liquidity tool
export const removeHELiquiditySchema = z.object({
  tokenPair: z.string().describe('Token pair to remove liquidity from'),
  shares: z.string().describe('Amount of LP shares to remove'),
});

