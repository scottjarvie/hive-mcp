/**
 * Conversions Tools Implementation
 * 
 * Summary: Provides tools for HBD/HIVE conversion operations.
 * Purpose: Convert between HBD and HIVE using WAX transaction builder.
 * Key elements: conversions (consolidated dispatcher)
 * Dependencies: @hiveio/wax (via config/client), config, utils/response, utils/error, utils/api
 * Last update: Tool consolidation - added dispatcher function
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callDatabaseApi, generateRequestId } from '../utils/api.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for all conversion operations
 * Handles: convert_hbd, collateralized_convert, get_requests, get_price_feed
 */
export async function conversions(
  params: {
    action: 'convert_hbd' | 'collateralized_convert' | 'get_requests' | 'get_price_feed';
    amount?: number;
    account?: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'convert_hbd':
      if (!params.amount) {
        return errorResponse('Error: Amount is required for convert_hbd action');
      }
      return convertHbd({ amount: params.amount });
    case 'collateralized_convert':
      if (!params.amount) {
        return errorResponse('Error: Amount is required for collateralized_convert action');
      }
      return collateralizedConvert({ amount: params.amount });
    case 'get_requests':
      if (!params.account) {
        return errorResponse('Error: Account is required for get_requests action');
      }
      return getConversionRequests({ account: params.account });
    case 'get_price_feed':
      return getCurrentPriceFeed({});
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

/**
 * Convert HBD - Convert HBD to HIVE (3.5 day conversion)
 * Uses convert_operation
 * This is a non-instant conversion that uses the median price feed
 */
export async function convertHbd(
  params: {
    amount: number;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Conversions require an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Create the HBD asset
    const amountAsset = chain.hbdCoins(params.amount);

    // Generate unique request ID
    const requestId = generateRequestId();

    tx.pushOperation({
      convert_operation: {
        owner: username,
        requestid: requestId,
        amount: amountAsset,
      }
    });

    tx.sign(activeKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    // Calculate completion date (3.5 days from now)
    const completionDate = new Date();
    completionDate.setTime(completionDate.getTime() + (3.5 * 24 * 60 * 60 * 1000));

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      account: username,
      amount: `${params.amount.toFixed(3)} HBD`,
      request_id: requestId,
      action: 'convert_hbd',
      estimated_completion: completionDate.toISOString(),
      note: 'HBD will be converted to HIVE at the median price feed rate over 3.5 days.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'convert_hbd'));
  }
}

/**
 * Collateralized Convert - Instant HBD to HIVE conversion (requires HIVE collateral)
 * Uses collateralized_convert_operation
 * This is an instant conversion but requires ~2x collateral in HIVE
 */
export async function collateralizedConvert(
  params: {
    amount: number;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Conversions require an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Create the HIVE asset (collateral)
    const amountAsset = chain.hiveCoins(params.amount);

    // Generate unique request ID
    const requestId = generateRequestId();

    tx.pushOperation({
      collateralized_convert_operation: {
        owner: username,
        requestid: requestId,
        amount: amountAsset,
      }
    });

    tx.sign(activeKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      account: username,
      collateral_amount: `${params.amount.toFixed(3)} HIVE`,
      request_id: requestId,
      action: 'collateralized_convert',
      note: 'Instant HBD conversion initiated. Excess collateral will be returned after price stabilization.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'collateralized_convert'));
  }
}

/**
 * Get Conversion Requests - Get pending HBD conversions for an account
 * Uses database_api.find_hbd_conversion_requests and find_collateralized_conversion_requests
 */
export async function getConversionRequests(
  params: {
    account: string;
  }
): Promise<Response> {
  try {
    // Get regular HBD conversion requests
    const hbdResult = await callDatabaseApi<{ requests: any[] }>('find_hbd_conversion_requests', {
      account: params.account,
    });

    // Get collateralized conversion requests
    const collateralizedResult = await callDatabaseApi<{ requests: any[] }>('find_collateralized_conversion_requests', {
      account: params.account,
    });

    const hbdConversions = hbdResult.requests || [];
    const collateralizedConversions = collateralizedResult.requests || [];

    // Format the conversions
    const formattedHbd = hbdConversions.map((c: any) => ({
      request_id: c.requestid,
      owner: c.owner,
      amount: c.amount,
      conversion_date: c.conversion_date,
      type: 'hbd_conversion',
    }));

    const formattedCollateralized = collateralizedConversions.map((c: any) => ({
      request_id: c.requestid,
      owner: c.owner,
      collateral_amount: c.collateral_amount,
      converted_amount: c.converted_amount,
      conversion_date: c.conversion_date,
      type: 'collateralized_conversion',
    }));

    return successJson({
      account: params.account,
      hbd_conversions: formattedHbd,
      collateralized_conversions: formattedCollateralized,
      total_pending: formattedHbd.length + formattedCollateralized.length,
      note: formattedHbd.length + formattedCollateralized.length > 0
        ? 'HBD conversions take 3.5 days. Collateralized conversions are instant but collateral is locked temporarily.'
        : 'No pending conversion requests.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_conversion_requests'));
  }
}

/**
 * Get Current Price Feed - Get the current HBD/HIVE median price feed
 * Uses database_api.get_current_price_feed
 */
export async function getCurrentPriceFeed(
  _params: Record<string, never>
): Promise<Response> {
  try {
    const result = await callDatabaseApi<any>('get_current_price_feed', {});

    // The price feed returns base and quote in NAI format
    // base is HBD, quote is HIVE - the ratio gives you the exchange rate
    const base = result.base;
    const quote = result.quote;

    if (!base || !quote) {
      return errorResponse('Error: Unable to retrieve price feed data');
    }

    // Parse amounts - handle both NAI format and string format
    let baseAmount: number;
    let quoteAmount: number;
    let baseStr: string;
    let quoteStr: string;
    
    if (typeof base === 'object' && base.amount) {
      // NAI format: { amount: "103", precision: 3, nai: "@@000000013" }
      const basePrecision = base.precision || 3;
      baseAmount = parseInt(base.amount) / Math.pow(10, basePrecision);
      baseStr = `${baseAmount.toFixed(basePrecision)} HBD`;
    } else {
      // String format: "0.103 HBD"
      baseAmount = parseFloat(String(base).split(' ')[0]);
      baseStr = String(base);
    }
    
    if (typeof quote === 'object' && quote.amount) {
      const quotePrecision = quote.precision || 3;
      quoteAmount = parseInt(quote.amount) / Math.pow(10, quotePrecision);
      quoteStr = `${quoteAmount.toFixed(quotePrecision)} HIVE`;
    } else {
      quoteAmount = parseFloat(String(quote).split(' ')[0]);
      quoteStr = String(quote);
    }

    // Calculate rate: how much HIVE per 1 HBD
    const hivePerHbd = quoteAmount / baseAmount;
    // And inverse: how much HBD per 1 HIVE
    const hbdPerHive = baseAmount / quoteAmount;

    return successJson({
      base: baseStr,
      quote: quoteStr,
      hive_per_hbd: hivePerHbd.toFixed(3),
      hbd_per_hive: hbdPerHive.toFixed(6),
      note: 'This is the median price feed used for HBD conversions. Updated by witnesses.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_current_price_feed'));
  }
}

