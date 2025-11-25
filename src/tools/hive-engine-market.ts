/**
 * Hive Engine Market Tools
 * 
 * Summary: Tools for Hive Engine market/trading operations.
 * Purpose: Query orderbook, place/cancel orders, view trade history.
 * Key elements: heMarket (consolidated dispatcher)
 * Dependencies: hive-engine-api, config, WAX client, utils/date
 * Last update: Added date formatting for improved readability
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { formatTimestamp } from '../utils/date.js';
import {
  getMarketBuyBook,
  getMarketSellBook,
  getMarketHistory,
  getMarketMetrics,
  getOpenOrders,
} from '../utils/hive-engine-api.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for all Hive Engine market operations
 * Handles: orderbook, history, metrics, open_orders, buy, sell, cancel
 */
export async function heMarket(
  params: {
    action: 'orderbook' | 'history' | 'metrics' | 'open_orders' | 'buy' | 'sell' | 'cancel';
    symbol?: string;
    account?: string;
    quantity?: string;
    price?: string;
    type?: 'buy' | 'sell';
    id?: string;
    limit?: number;
  }
): Promise<Response> {
  switch (params.action) {
    case 'orderbook':
      if (!params.symbol) {
        return errorResponse('Error: Symbol is required for orderbook action');
      }
      return getHEMarketOrderbook({ symbol: params.symbol, limit: params.limit || 50 });
    case 'history':
      if (!params.symbol) {
        return errorResponse('Error: Symbol is required for history action');
      }
      return getHEMarketHistory({ symbol: params.symbol, limit: params.limit || 100 });
    case 'metrics':
      if (!params.symbol) {
        return errorResponse('Error: Symbol is required for metrics action');
      }
      return getHEMarketMetrics({ symbol: params.symbol });
    case 'open_orders':
      if (!params.account) {
        return errorResponse('Error: Account is required for open_orders action');
      }
      return getHEOpenOrders({ account: params.account });
    case 'buy':
      if (!params.symbol || !params.quantity || !params.price) {
        return errorResponse('Error: Symbol, quantity, and price are required for buy action');
      }
      return placeHEBuyOrder({
        symbol: params.symbol,
        quantity: params.quantity,
        price: params.price,
      });
    case 'sell':
      if (!params.symbol || !params.quantity || !params.price) {
        return errorResponse('Error: Symbol, quantity, and price are required for sell action');
      }
      return placeHESellOrder({
        symbol: params.symbol,
        quantity: params.quantity,
        price: params.price,
      });
    case 'cancel':
      if (!params.type || !params.id) {
        return errorResponse('Error: Type and id are required for cancel action');
      }
      return cancelHEOrder({ type: params.type, id: params.id });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// Read Operations
// =============================================================================

/**
 * Get orderbook for a token
 */
export async function getHEMarketOrderbook(
  params: { symbol: string; limit: number }
): Promise<Response> {
  try {
    const [buyOrders, sellOrders] = await Promise.all([
      getMarketBuyBook(params.symbol, params.limit),
      getMarketSellBook(params.symbol, params.limit),
    ]);

    // Calculate spread if orders exist
    let spread: string | null = null;
    let spreadPercent: string | null = null;
    if (buyOrders.length > 0 && sellOrders.length > 0) {
      const highestBid = parseFloat(buyOrders[0].price);
      const lowestAsk = parseFloat(sellOrders[0].price);
      const spreadValue = lowestAsk - highestBid;
      spread = spreadValue.toFixed(8);
      spreadPercent = ((spreadValue / lowestAsk) * 100).toFixed(2);
    }

    return successJson({
      symbol: params.symbol,
      buy_orders: buyOrders.map(o => ({
        account: o.account,
        quantity: o.quantity,
        price: o.price,
        total: (parseFloat(o.quantity) * parseFloat(o.price)).toFixed(8),
      })),
      sell_orders: sellOrders.map(o => ({
        account: o.account,
        quantity: o.quantity,
        price: o.price,
        total: (parseFloat(o.quantity) * parseFloat(o.price)).toFixed(8),
      })),
      highest_bid: buyOrders.length > 0 ? buyOrders[0].price : null,
      lowest_ask: sellOrders.length > 0 ? sellOrders[0].price : null,
      spread: spread,
      spread_percent: spreadPercent ? `${spreadPercent}%` : null,
      buy_order_count: buyOrders.length,
      sell_order_count: sellOrders.length,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_market_orderbook'));
  }
}

/**
 * Get trade history for a token
 */
export async function getHEMarketHistory(
  params: { symbol: string; limit: number }
): Promise<Response> {
  try {
    const trades = await getMarketHistory(params.symbol, params.limit);

    return successJson({
      symbol: params.symbol,
      trade_count: trades.length,
      trades: trades.map(t => ({
        type: t.type,
        buyer: t.buyer,
        seller: t.seller,
        quantity: t.quantity,
        price: t.price,
        volume: t.volume,
        timestamp: formatTimestamp(t.timestamp),
      })),
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_market_history'));
  }
}

/**
 * Get market metrics for a token
 */
export async function getHEMarketMetrics(
  params: { symbol: string }
): Promise<Response> {
  try {
    const metrics = await getMarketMetrics(params.symbol);

    if (!metrics) {
      return errorResponse(`Error: No market metrics found for ${params.symbol}`);
    }

    return successJson({
      symbol: params.symbol,
      last_price: metrics.lastPrice,
      highest_bid: metrics.highestBid,
      lowest_ask: metrics.lowestAsk,
      volume_24h: metrics.volume,
      price_change_hive: metrics.priceChangeHive,
      price_change_percent: metrics.priceChangePercent,
      last_day_price: metrics.lastDayPrice,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_market_metrics'));
  }
}

/**
 * Get open orders for an account
 */
export async function getHEOpenOrders(
  params: { account: string }
): Promise<Response> {
  try {
    const orders = await getOpenOrders(params.account);

    const buyOrders = orders.filter(o => o.tokensLocked !== undefined);
    const sellOrders = orders.filter(o => o.tokensLocked === undefined);

    return successJson({
      account: params.account,
      total_orders: orders.length,
      buy_orders: buyOrders.map(o => ({
        id: o._id,
        symbol: o.symbol,
        quantity: o.quantity,
        price: o.price,
        total_locked: o.tokensLocked,
        timestamp: formatTimestamp(o.timestamp),
      })),
      sell_orders: sellOrders.map(o => ({
        id: o._id,
        symbol: o.symbol,
        quantity: o.quantity,
        price: o.price,
        timestamp: formatTimestamp(o.timestamp),
      })),
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_open_orders'));
  }
}

// =============================================================================
// Write Operations (require active key)
// =============================================================================

/**
 * Helper to broadcast a Hive Engine custom_json operation
 */
async function broadcastHEMarketOperation(
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
    contractName: 'market',
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
 * Place a buy order on Hive Engine market
 */
export async function placeHEBuyOrder(
  params: { symbol: string; quantity: string; price: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Market orders require active key.');
    }

    const result = await broadcastHEMarketOperation('buy', {
      symbol: params.symbol,
      quantity: params.quantity,
      price: params.price,
    });

    const total = (parseFloat(params.quantity) * parseFloat(params.price)).toFixed(8);

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      order_type: 'buy',
      symbol: params.symbol,
      quantity: params.quantity,
      price: params.price,
      total_cost: `${total} SWAP.HIVE`,
      action: 'place_he_buy_order',
      note: 'Buy order placed. Will execute when a matching sell order is found.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'place_he_buy_order'));
  }
}

/**
 * Place a sell order on Hive Engine market
 */
export async function placeHESellOrder(
  params: { symbol: string; quantity: string; price: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Market orders require active key.');
    }

    const result = await broadcastHEMarketOperation('sell', {
      symbol: params.symbol,
      quantity: params.quantity,
      price: params.price,
    });

    const total = (parseFloat(params.quantity) * parseFloat(params.price)).toFixed(8);

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      order_type: 'sell',
      symbol: params.symbol,
      quantity: params.quantity,
      price: params.price,
      total_proceeds: `${total} SWAP.HIVE`,
      action: 'place_he_sell_order',
      note: 'Sell order placed. Will execute when a matching buy order is found.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'place_he_sell_order'));
  }
}

/**
 * Cancel an open order
 */
export async function cancelHEOrder(
  params: { type: string; id: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Canceling orders requires active key.');
    }

    const result = await broadcastHEMarketOperation('cancel', {
      type: params.type,
      id: params.id,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      order_type: params.type,
      order_id: params.id,
      action: 'cancel_he_order',
      note: 'Order cancelled. Locked tokens will be returned.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'cancel_he_order'));
  }
}

