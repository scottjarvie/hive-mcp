/**
 * Hive Engine Market Schemas
 * 
 * Summary: Zod schemas for Hive Engine market/trading operations.
 * Purpose: Input validation for orderbook, orders, and trading.
 * Key elements: getHEMarketOrderbookSchema, placeHEBuyOrderSchema
 * Dependencies: zod
 * Last update: Phase 5 - Hive Engine integration
 */

import { z } from 'zod';

// Schema for get_he_market_orderbook tool
export const getHEMarketOrderbookSchema = z.object({
  symbol: z.string().describe('Token symbol (e.g., LEO, POB)'),
  limit: z.number().min(1).max(500).default(50).describe('Maximum orders per side'),
});

// Schema for get_he_market_history tool
export const getHEMarketHistorySchema = z.object({
  symbol: z.string().describe('Token symbol'),
  limit: z.number().min(1).max(500).default(100).describe('Maximum trades to return'),
});

// Schema for get_he_market_metrics tool
export const getHEMarketMetricsSchema = z.object({
  symbol: z.string().describe('Token symbol'),
});

// Schema for get_he_open_orders tool
export const getHEOpenOrdersSchema = z.object({
  account: z.string().describe('Hive account name'),
});

// Schema for place_he_buy_order tool
export const placeHEBuyOrderSchema = z.object({
  symbol: z.string().describe('Token symbol to buy'),
  quantity: z.string().describe('Amount of tokens to buy'),
  price: z.string().describe('Price per token in SWAP.HIVE'),
});

// Schema for place_he_sell_order tool
export const placeHESellOrderSchema = z.object({
  symbol: z.string().describe('Token symbol to sell'),
  quantity: z.string().describe('Amount of tokens to sell'),
  price: z.string().describe('Price per token in SWAP.HIVE'),
});

// Schema for cancel_he_order tool
export const cancelHEOrderSchema = z.object({
  type: z.enum(['buy', 'sell']).describe('Order type'),
  id: z.string().describe('Order ID to cancel'),
});

