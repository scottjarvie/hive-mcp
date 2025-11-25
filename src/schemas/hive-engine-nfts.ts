/**
 * Hive Engine NFT Schemas
 * 
 * Summary: Zod schemas for Hive Engine NFT operations.
 * Purpose: Input validation for NFT queries and transfers.
 * Key elements: heNftsSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related HE NFT operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all Hive Engine NFT operations
 * Combines: collection, info, properties, sell_orders, transfer, sell, cancel_sale, buy
 */
export const heNftsSchema = z.object({
  action: z.enum(['collection', 'info', 'properties', 'sell_orders', 'transfer', 'sell', 'cancel_sale', 'buy']).describe(
    'Action: collection, info, properties, sell_orders, transfer, sell, cancel_sale, or buy'
  ),
  // Common
  symbol: z.string().optional().describe('NFT collection symbol'),
  // For collection
  account: z.string().optional().describe('Account to get NFT collection for'),
  // For info
  id: z.string().optional().describe('Specific NFT instance ID (for info)'),
  // For transfer, sell, cancel_sale, buy
  ids: z.array(z.string()).optional().describe('Array of NFT instance IDs'),
  to: z.string().optional().describe('Recipient account (for transfer)'),
  memo: z.string().optional().default('').describe('Optional memo (for transfer)'),
  // For sell
  price: z.string().optional().describe('Price per NFT (for sell)'),
  priceSymbol: z.string().optional().default('SWAP.HIVE').describe('Price token symbol (for sell)'),
  // For buy
  marketAccount: z.string().optional().default('nftmarket').describe('NFT market account (for buy)'),
  // For sell_orders
  limit: z.number().min(1).max(500).optional().default(100).describe('Max results (for sell_orders)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for get_he_nft_collection tool
export const getHENFTCollectionSchema = z.object({
  account: z.string().describe('Hive account name'),
  symbol: z.string().optional().describe('NFT collection symbol (if not provided, returns all NFTs)'),
});

// Schema for get_he_nft_info tool
export const getHENFTInfoSchema = z.object({
  symbol: z.string().describe('NFT collection symbol'),
  id: z.string().optional().describe('Specific NFT instance ID'),
});

// Schema for get_he_nft_properties tool
export const getHENFTPropertiesSchema = z.object({
  symbol: z.string().describe('NFT collection symbol'),
});

// Schema for get_he_nft_sell_orders tool
export const getHENFTSellOrdersSchema = z.object({
  symbol: z.string().describe('NFT collection symbol'),
  limit: z.number().min(1).max(500).default(100).describe('Maximum orders to return'),
});

// Schema for transfer_he_nft tool
export const transferHENFTSchema = z.object({
  symbol: z.string().describe('NFT collection symbol'),
  ids: z.array(z.string()).describe('Array of NFT instance IDs to transfer'),
  to: z.string().describe('Recipient Hive account'),
  memo: z.string().optional().default('').describe('Optional memo'),
});

// Schema for sell_he_nft tool
export const sellHENFTSchema = z.object({
  symbol: z.string().describe('NFT collection symbol'),
  ids: z.array(z.string()).describe('Array of NFT instance IDs to sell'),
  price: z.string().describe('Price per NFT'),
  priceSymbol: z.string().default('SWAP.HIVE').describe('Price token symbol'),
});

// Schema for cancel_he_nft_sale tool (removed buy - using cancel instead)
export const cancelHENFTSaleSchema = z.object({
  symbol: z.string().describe('NFT collection symbol'),
  ids: z.array(z.string()).describe('Array of NFT instance IDs to cancel sale for'),
});

// Schema for buy_he_nft tool
export const buyHENFTSchema = z.object({
  symbol: z.string().describe('NFT collection symbol'),
  ids: z.array(z.string()).describe('Array of NFT instance IDs to buy'),
  marketAccount: z.string().default('nftmarket').describe('NFT market account'),
});

