/**
 * Hive Engine Pool Tools
 * 
 * Summary: Tools for Hive Engine liquidity pool (Diesel Pools) operations.
 * Purpose: Query pools, estimate swaps, execute swaps, manage liquidity.
 * Key elements: getHEPoolInfo, estimateHESwap, swapHETokens, addHELiquidity
 * Dependencies: hive-engine-api, config, WAX client
 * Last update: Phase 5 - Hive Engine integration
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import {
  getPool,
  getPools,
  type HEPool,
} from '../utils/hive-engine-api.js';

// =============================================================================
// Read Operations
// =============================================================================

/**
 * Get liquidity pool information
 */
export async function getHEPoolInfo(
  params: { tokenPair: string }
): Promise<Response> {
  try {
    const pool = await getPool(params.tokenPair);

    if (!pool) {
      return errorResponse(`Error: Pool ${params.tokenPair} not found`);
    }

    // Calculate implied prices
    const baseQty = parseFloat(pool.baseQuantity);
    const quoteQty = parseFloat(pool.quoteQuantity);
    const basePrice = quoteQty / baseQty;
    const quotePrice = baseQty / quoteQty;

    return successJson({
      tokenPair: pool.tokenPair,
      baseQuantity: pool.baseQuantity,
      quoteQuantity: pool.quoteQuantity,
      totalShares: pool.totalShares,
      precision: pool.precision,
      creator: pool.creator,
      base_price: basePrice.toFixed(8),
      quote_price: quotePrice.toFixed(8),
      base_volume: pool.baseVolume,
      quote_volume: pool.quoteVolume,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_pool_info'));
  }
}

/**
 * List all liquidity pools
 */
export async function getHEPoolsList(
  params: { limit: number; offset: number }
): Promise<Response> {
  try {
    const pools = await getPools(params.limit);

    const formattedPools = pools.map(pool => {
      const baseQty = parseFloat(pool.baseQuantity);
      const quoteQty = parseFloat(pool.quoteQuantity);
      const price = baseQty > 0 ? (quoteQty / baseQty).toFixed(8) : '0';

      return {
        tokenPair: pool.tokenPair,
        baseQuantity: pool.baseQuantity,
        quoteQuantity: pool.quoteQuantity,
        totalShares: pool.totalShares,
        price,
        creator: pool.creator,
      };
    });

    return successJson({
      pool_count: formattedPools.length,
      offset: params.offset,
      pools: formattedPools,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_pools_list'));
  }
}

/**
 * Estimate swap output
 */
export async function estimateHESwap(
  params: { tokenPair: string; tokenSymbol: string; tokenAmount: string }
): Promise<Response> {
  try {
    const pool = await getPool(params.tokenPair);

    if (!pool) {
      return errorResponse(`Error: Pool ${params.tokenPair} not found`);
    }

    // Parse the token pair
    const [baseSymbol, quoteSymbol] = params.tokenPair.split(':');
    const inputAmount = parseFloat(params.tokenAmount);
    
    let baseQty = parseFloat(pool.baseQuantity);
    let quoteQty = parseFloat(pool.quoteQuantity);
    
    // Determine if swapping base -> quote or quote -> base
    const isBaseToQuote = params.tokenSymbol === baseSymbol;
    
    let outputAmount: number;
    let outputSymbol: string;
    let priceImpact: number;
    
    if (isBaseToQuote) {
      // Swap base for quote (constant product formula)
      // output = quoteQty - (baseQty * quoteQty) / (baseQty + input)
      const newBaseQty = baseQty + inputAmount;
      const newQuoteQty = (baseQty * quoteQty) / newBaseQty;
      outputAmount = quoteQty - newQuoteQty;
      outputSymbol = quoteSymbol;
      
      // Price impact: how much the price moved
      const spotPrice = quoteQty / baseQty;
      const executionPrice = outputAmount / inputAmount;
      priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice) * 100;
    } else {
      // Swap quote for base
      const newQuoteQty = quoteQty + inputAmount;
      const newBaseQty = (baseQty * quoteQty) / newQuoteQty;
      outputAmount = baseQty - newBaseQty;
      outputSymbol = baseSymbol;
      
      const spotPrice = baseQty / quoteQty;
      const executionPrice = outputAmount / inputAmount;
      priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice) * 100;
    }

    // Apply 0.25% swap fee (standard Diesel pool fee)
    const fee = outputAmount * 0.0025;
    const outputAfterFee = outputAmount - fee;

    return successJson({
      tokenPair: params.tokenPair,
      input_token: params.tokenSymbol,
      input_amount: params.tokenAmount,
      output_token: outputSymbol,
      estimated_output: outputAfterFee.toFixed(8),
      fee: fee.toFixed(8),
      fee_percent: '0.25%',
      price_impact: `${priceImpact.toFixed(4)}%`,
      rate: (outputAfterFee / inputAmount).toFixed(8),
      note: 'Estimate based on current pool state. Actual output may vary.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'estimate_he_swap'));
  }
}

// =============================================================================
// Write Operations (require active key)
// =============================================================================

/**
 * Helper to broadcast a Hive Engine pool custom_json operation
 */
async function broadcastHEPoolOperation(
  contractAction: string,
  contractPayload: Record<string, unknown>
): Promise<{ success: boolean; txId: string }> {
  const username = config.hive.username;
  const activeKey = config.hive.activeKey;

  if (!username || !activeKey) {
    throw new Error('HIVE_USERNAME or HIVE_ACTIVE_KEY not set');
  }

  const chain = await getChain();
  const tx = await chain.createTransaction();

  const jsonPayload = JSON.stringify({
    contractName: 'marketpools',
    contractAction,
    contractPayload,
  });

  tx.pushOperation({
    custom_json_operation: {
      required_auths: [username],
      required_posting_auths: [],
      id: 'ssc-mainnet-hive',
      json: jsonPayload,
    }
  });

  tx.sign(activeKey);
  await chain.broadcast(tx);

  return { success: true, txId: tx.id };
}

/**
 * Swap tokens via a liquidity pool
 */
export async function swapHETokens(
  params: { tokenPair: string; tokenSymbol: string; tokenAmount: string; minAmountOut?: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Swaps require active key.');
    }

    const payload: Record<string, unknown> = {
      tokenPair: params.tokenPair,
      tokenSymbol: params.tokenSymbol,
      tokenAmount: params.tokenAmount,
    };

    if (params.minAmountOut) {
      payload.minAmountOut = params.minAmountOut;
    }

    const result = await broadcastHEPoolOperation('swapTokens', payload);

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      tokenPair: params.tokenPair,
      input_token: params.tokenSymbol,
      input_amount: params.tokenAmount,
      min_output: params.minAmountOut || '(no minimum set)',
      action: 'swap_he_tokens',
      note: 'Swap submitted. Check transaction for actual output amount.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'swap_he_tokens'));
  }
}

/**
 * Add liquidity to a pool
 */
export async function addHELiquidity(
  params: { 
    tokenPair: string; 
    baseQuantity: string; 
    quoteQuantity: string;
    maxSlippage?: string;
    maxDeviation?: string;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Adding liquidity requires active key.');
    }

    const result = await broadcastHEPoolOperation('addLiquidity', {
      tokenPair: params.tokenPair,
      baseQuantity: params.baseQuantity,
      quoteQuantity: params.quoteQuantity,
      maxSlippage: params.maxSlippage || '0.005',
      maxDeviation: params.maxDeviation || '0.01',
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      tokenPair: params.tokenPair,
      baseQuantity: params.baseQuantity,
      quoteQuantity: params.quoteQuantity,
      action: 'add_he_liquidity',
      note: 'Liquidity added. You will receive LP shares representing your pool position.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'add_he_liquidity'));
  }
}

/**
 * Remove liquidity from a pool
 */
export async function removeHELiquidity(
  params: { tokenPair: string; shares: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Removing liquidity requires active key.');
    }

    const result = await broadcastHEPoolOperation('removeLiquidity', {
      tokenPair: params.tokenPair,
      sharesOut: params.shares,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      tokenPair: params.tokenPair,
      shares_removed: params.shares,
      action: 'remove_he_liquidity',
      note: 'Liquidity removal submitted. You will receive your proportional share of pool tokens.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'remove_he_liquidity'));
  }
}

