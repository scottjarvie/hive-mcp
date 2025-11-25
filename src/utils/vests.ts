/**
 * VESTS to HP Conversion Utility
 * 
 * Summary: Converts VESTS (Vesting Shares) to HP (Hive Power) using blockchain rates.
 * Purpose: Provide human-readable HP values alongside raw VESTS in responses.
 * Key elements: vestsToHP, getVestsConversionRate
 * Dependencies: utils/api
 * Last update: Initial implementation
 */

import { callCondenserApi } from './api.js';

// =============================================================================
// TYPES
// =============================================================================

interface DynamicGlobalProperties {
  total_vesting_fund_hive: string;  // e.g., "123456789.123 HIVE"
  total_vesting_shares: string;      // e.g., "123456789123456.123456 VESTS"
}

interface ConversionRate {
  rate: number;
  timestamp: number;
}

// =============================================================================
// CACHE
// =============================================================================

// Cache the conversion rate for 5 minutes to avoid excessive API calls
const CACHE_DURATION_MS = 5 * 60 * 1000;
let cachedRate: ConversionRate | null = null;

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Parse a Hive asset string (e.g., "123.456 HIVE") to a number
 */
function parseAsset(assetString: string): number {
  const parts = assetString.split(' ');
  return parseFloat(parts[0]);
}

/**
 * Get the current VESTS to HIVE conversion rate
 * Fetches dynamic global properties and calculates rate
 * Results are cached for 5 minutes
 */
export async function getVestsConversionRate(): Promise<number> {
  const now = Date.now();
  
  // Return cached rate if still valid
  if (cachedRate && (now - cachedRate.timestamp) < CACHE_DURATION_MS) {
    return cachedRate.rate;
  }
  
  // Fetch fresh dynamic global properties
  const props = await callCondenserApi<DynamicGlobalProperties>(
    'get_dynamic_global_properties',
    []
  );
  
  const totalVestingFundHive = parseAsset(props.total_vesting_fund_hive);
  const totalVestingShares = parseAsset(props.total_vesting_shares);
  
  // Calculate rate: HP = VESTS * (total_vesting_fund_hive / total_vesting_shares)
  const rate = totalVestingFundHive / totalVestingShares;
  
  // Cache the rate
  cachedRate = {
    rate,
    timestamp: now,
  };
  
  return rate;
}

/**
 * Convert VESTS to HP (Hive Power)
 * 
 * @param vests - VESTS amount (number or string like "123456.123456 VESTS" or "123456.123456")
 * @param rate - Optional pre-fetched conversion rate (to avoid multiple API calls)
 * @returns HP amount as a number rounded to 3 decimal places
 */
export async function vestsToHP(
  vests: number | string,
  rate?: number
): Promise<number> {
  // Parse VESTS if string
  let vestsNum: number;
  if (typeof vests === 'string') {
    vestsNum = parseAsset(vests);
  } else {
    vestsNum = vests;
  }
  
  // Get conversion rate if not provided
  const conversionRate = rate ?? await getVestsConversionRate();
  
  // Convert and round to 3 decimal places
  const hp = vestsNum * conversionRate;
  return Math.round(hp * 1000) / 1000;
}

/**
 * Format VESTS with HP equivalent
 * Returns an object with both values for display
 * 
 * @param vests - VESTS amount (number or string)
 * @param rate - Optional pre-fetched conversion rate
 * @returns Object with vests and hp values
 */
export async function formatVestsWithHP(
  vests: number | string,
  rate?: number
): Promise<{ vests: string; hp: string }> {
  // Parse VESTS
  let vestsNum: number;
  if (typeof vests === 'string') {
    vestsNum = parseAsset(vests);
  } else {
    vestsNum = vests;
  }
  
  const hp = await vestsToHP(vestsNum, rate);
  
  return {
    vests: `${vestsNum.toFixed(6)} VESTS`,
    hp: `${hp.toFixed(3)} HP`,
  };
}

