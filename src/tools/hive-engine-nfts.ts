/**
 * Hive Engine NFT Tools
 * 
 * Summary: Tools for Hive Engine NFT operations.
 * Purpose: Query NFT collections, transfer, buy/sell NFTs.
 * Key elements: heNfts (consolidated dispatcher)
 * Dependencies: hive-engine-api, config, WAX client
 * Last update: Tool consolidation - added dispatcher function
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import {
  getNFTInstances,
  getNFTDefinition,
  getNFTSellOrders,
  findOne,
  type HENFTInstance,
} from '../utils/hive-engine-api.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for all Hive Engine NFT operations
 * Handles: collection, info, properties, sell_orders, transfer, sell, cancel_sale, buy
 */
export async function heNfts(
  params: {
    action: 'collection' | 'info' | 'properties' | 'sell_orders' | 'transfer' | 'sell' | 'cancel_sale' | 'buy';
    symbol?: string;
    account?: string;
    id?: string;
    ids?: string[];
    to?: string;
    memo?: string;
    price?: string;
    priceSymbol?: string;
    marketAccount?: string;
    limit?: number;
  }
): Promise<Response> {
  switch (params.action) {
    case 'collection':
      if (!params.account) {
        return errorResponse('Error: Account is required for collection action');
      }
      return getHENFTCollection({ account: params.account, symbol: params.symbol });
    case 'info':
      if (!params.symbol) {
        return errorResponse('Error: Symbol is required for info action');
      }
      return getHENFTInfo({ symbol: params.symbol, id: params.id });
    case 'properties':
      if (!params.symbol) {
        return errorResponse('Error: Symbol is required for properties action');
      }
      return getHENFTProperties({ symbol: params.symbol });
    case 'sell_orders':
      if (!params.symbol) {
        return errorResponse('Error: Symbol is required for sell_orders action');
      }
      return getHENFTSellOrders({ symbol: params.symbol, limit: params.limit || 100 });
    case 'transfer':
      if (!params.symbol || !params.ids || !params.to) {
        return errorResponse('Error: Symbol, ids, and to are required for transfer action');
      }
      return transferHENFT({
        symbol: params.symbol,
        ids: params.ids,
        to: params.to,
        memo: params.memo || '',
      });
    case 'sell':
      if (!params.symbol || !params.ids || !params.price) {
        return errorResponse('Error: Symbol, ids, and price are required for sell action');
      }
      return sellHENFT({
        symbol: params.symbol,
        ids: params.ids,
        price: params.price,
        priceSymbol: params.priceSymbol || 'SWAP.HIVE',
      });
    case 'cancel_sale':
      if (!params.symbol || !params.ids) {
        return errorResponse('Error: Symbol and ids are required for cancel_sale action');
      }
      return cancelHENFTSale({ symbol: params.symbol, ids: params.ids });
    case 'buy':
      if (!params.symbol || !params.ids) {
        return errorResponse('Error: Symbol and ids are required for buy action');
      }
      return buyHENFT({
        symbol: params.symbol,
        ids: params.ids,
        marketAccount: params.marketAccount || 'nftmarket',
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// Read Operations
// =============================================================================

/**
 * Get NFTs owned by an account
 */
export async function getHENFTCollection(
  params: { account: string; symbol?: string }
): Promise<Response> {
  try {
    const nfts = await getNFTInstances(params.account, params.symbol);

    const formattedNfts = nfts.map(nft => ({
      id: nft._id,
      symbol: (nft as any).symbol,
      account: nft.account,
      properties: nft.properties,
      delegatedTo: nft.delegatedTo,
    }));

    return successJson({
      account: params.account,
      symbol: params.symbol || 'all',
      nft_count: formattedNfts.length,
      nfts: formattedNfts,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_nft_collection'));
  }
}

/**
 * Get NFT definition/info
 */
export async function getHENFTInfo(
  params: { symbol: string; id?: string }
): Promise<Response> {
  try {
    if (params.id) {
      // Get specific NFT instance
      const nft = await findOne<HENFTInstance>('nft', 'nfts', { 
        _id: params.id,
      });

      if (!nft) {
        return errorResponse(`Error: NFT with ID ${params.id} not found`);
      }

      return successJson({
        id: nft._id,
        account: nft.account,
        ownedBy: nft.ownedBy,
        properties: nft.properties,
        delegatedTo: nft.delegatedTo,
        lockedTokens: nft.lockedTokens,
      });
    } else {
      // Get collection definition
      const definition = await getNFTDefinition(params.symbol);

      if (!definition) {
        return errorResponse(`Error: NFT collection ${params.symbol} not found`);
      }

      // Parse metadata if it's JSON
      let metadata = {};
      try {
        if (definition.metadata) {
          metadata = JSON.parse(definition.metadata);
        }
      } catch {
        metadata = { raw: definition.metadata };
      }

      return successJson({
        symbol: definition.symbol,
        name: definition.name,
        issuer: definition.issuer,
        maxSupply: definition.maxSupply,
        supply: definition.supply,
        circulatingSupply: definition.circulatingSupply,
        delegationEnabled: definition.delegationEnabled,
        undelegationCooldown: definition.undelegationCooldown,
        authorizedIssuingAccounts: definition.authorizedIssuingAccounts,
        properties: definition.properties,
        groupBy: definition.groupBy,
        metadata,
      });
    }
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_nft_info'));
  }
}

/**
 * Get NFT collection properties/schema
 */
export async function getHENFTProperties(
  params: { symbol: string }
): Promise<Response> {
  try {
    const definition = await getNFTDefinition(params.symbol);

    if (!definition) {
      return errorResponse(`Error: NFT collection ${params.symbol} not found`);
    }

    return successJson({
      symbol: definition.symbol,
      name: definition.name,
      properties: definition.properties,
      groupBy: definition.groupBy,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_nft_properties'));
  }
}

/**
 * Get NFTs listed for sale
 */
export async function getHENFTSellOrders(
  params: { symbol: string; limit: number }
): Promise<Response> {
  try {
    const orders = await getNFTSellOrders(params.symbol, params.limit);

    return successJson({
      symbol: params.symbol,
      order_count: orders.length,
      orders: orders.map(o => ({
        id: o._id,
        nftId: o.nftId,
        account: o.account,
        price: o.price,
        priceSymbol: o.priceSymbol,
        fee: o.fee,
        timestamp: o.timestamp,
        grouping: o.grouping,
      })),
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_nft_sell_orders'));
  }
}

// =============================================================================
// Write Operations (require active key)
// =============================================================================

/**
 * Helper to broadcast a Hive Engine NFT custom_json operation
 */
async function broadcastHENFTOperation(
  contractName: string,
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
    contractName,
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
 * Transfer NFTs to another account
 */
export async function transferHENFT(
  params: { symbol: string; ids: string[]; to: string; memo?: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. NFT transfers require active key.');
    }

    const result = await broadcastHENFTOperation('nft', 'transfer', {
      to: params.to,
      nfts: [{ symbol: params.symbol, ids: params.ids }],
      memo: params.memo || '',
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      from: username,
      to: params.to,
      symbol: params.symbol,
      nft_ids: params.ids,
      nft_count: params.ids.length,
      memo: params.memo || '(no memo)',
      action: 'transfer_he_nft',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'transfer_he_nft'));
  }
}

/**
 * List NFTs for sale on the market
 */
export async function sellHENFT(
  params: { symbol: string; ids: string[]; price: string; priceSymbol: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Selling NFTs requires active key.');
    }

    const result = await broadcastHENFTOperation('nftmarket', 'sell', {
      symbol: params.symbol,
      nfts: params.ids,
      price: params.price,
      priceSymbol: params.priceSymbol,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      symbol: params.symbol,
      nft_ids: params.ids,
      nft_count: params.ids.length,
      price: params.price,
      price_symbol: params.priceSymbol,
      action: 'sell_he_nft',
      note: 'NFTs listed for sale on the market.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'sell_he_nft'));
  }
}

/**
 * Cancel NFT sale listing
 */
export async function cancelHENFTSale(
  params: { symbol: string; ids: string[] }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Canceling NFT sales requires active key.');
    }

    const result = await broadcastHENFTOperation('nftmarket', 'cancel', {
      symbol: params.symbol,
      nfts: params.ids,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      symbol: params.symbol,
      nft_ids: params.ids,
      nft_count: params.ids.length,
      action: 'cancel_he_nft_sale',
      note: 'NFT sale listings cancelled.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'cancel_he_nft_sale'));
  }
}

/**
 * Buy NFTs from the market
 */
export async function buyHENFT(
  params: { symbol: string; ids: string[]; marketAccount: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Buying NFTs requires active key.');
    }

    const result = await broadcastHENFTOperation('nftmarket', 'buy', {
      symbol: params.symbol,
      nfts: params.ids,
      marketAccount: params.marketAccount,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      symbol: params.symbol,
      nft_ids: params.ids,
      nft_count: params.ids.length,
      market_account: params.marketAccount,
      action: 'buy_he_nft',
      note: 'NFT purchase submitted. Check transaction for details.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'buy_he_nft'));
  }
}

