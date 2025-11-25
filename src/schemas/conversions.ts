/**
 * Conversions Schemas
 * 
 * Summary: Zod schemas for HBD/HIVE conversion operations.
 * Purpose: Input validation for conversions and price feed queries.
 * Key elements: conversionsSchema (consolidated)
 * Dependencies: zod
 * Last update: Tool consolidation - grouped related conversion operations
 */

import { z } from 'zod';

// =========================================================================
// CONSOLIDATED SCHEMA
// =========================================================================

/**
 * Consolidated schema for all conversion operations
 * Combines: convert_hbd, collateralized_convert, get_conversion_requests, get_current_price_feed
 */
export const conversionsSchema = z.object({
  action: z.enum(['convert_hbd', 'collateralized_convert', 'get_requests', 'get_price_feed']).describe(
    'Action to perform: convert_hbd, collateralized_convert, get_requests, or get_price_feed'
  ),
  amount: z.number().positive().optional().describe('Amount for conversion (for convert_hbd, collateralized_convert)'),
  account: z.string().optional().describe('Account to query (for get_requests)'),
});

// =========================================================================
// LEGACY SCHEMAS (kept for internal use by dispatchers)
// =========================================================================

// Schema for convert_hbd tool (3.5 day conversion)
export const convertHbdSchema = z.object({
  amount: z.number().positive().describe('Amount of HBD to convert to HIVE'),
});

// Schema for collateralized_convert tool (instant conversion)
export const collateralizedConvertSchema = z.object({
  amount: z.number().positive().describe('Amount of HIVE to use as collateral for instant HBD conversion'),
});

// Schema for get_conversion_requests tool
export const getConversionRequestsSchema = z.object({
  account: z.string().describe('Account to get pending conversions for'),
});

// Schema for get_current_price_feed tool
export const getCurrentPriceFeedSchema = z.object({});

