/**
 * Conversions Schemas
 * 
 * Summary: Zod schemas for HBD/HIVE conversion operations.
 * Purpose: Input validation for conversions and price feed queries.
 * Key elements: convertHbdSchema, collateralizedConvertSchema, getConversionRequestsSchema
 * Dependencies: zod
 * Last update: Phase 4 - DeFi operations
 */

import { z } from 'zod';

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

