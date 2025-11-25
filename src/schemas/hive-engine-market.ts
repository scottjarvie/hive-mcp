/**
 * Hive Engine Market Schemas
 * 
 * Summary: Zod schemas for Hive Engine market/trading operations.
 * Purpose: Input validation for orderbook, orders, and trading.
 * Key elements: heMarketSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related HE market operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all Hive Engine market operations
 * Combines: orderbook, history, metrics, open_orders, buy, sell, cancel
 */
export const heMarketSchema = z.object({
  action: z.enum(['orderbook', 'history', 'metrics', 'open_orders', 'buy', 'sell', 'cancel']).describe(
    'Action: orderbook, history, metrics, open_orders, buy, sell, or cancel'
  ),
  // For most actions
  symbol: z.string().optional().describe('Token symbol (e.g., LEO, POB)'),
  // For open_orders
  account: z.string().optional().describe('Account to get open orders for'),
  // For buy, sell
  quantity: z.string().optional().describe('Amount of tokens to buy/sell'),
  price: z.string().optional().describe('Price per token in SWAP.HIVE'),
  // For cancel
  type: z.enum(['buy', 'sell']).optional().describe('Order type (for cancel)'),
  id: z.string().optional().describe('Order ID (for cancel)'),
  // Common
  limit: z.number().min(1).max(500).optional().default(50).describe('Max results (for orderbook, history)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

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

