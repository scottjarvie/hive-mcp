/**
 * Hive Engine API Utilities
 * 
 * Summary: API calls to Hive Engine sidechain with multi-node failover.
 * Purpose: Query HE contracts and broadcast transactions via custom_json.
 * Key elements: queryContract, find, findOne, getHENodeHealth
 * Dependencies: logger
 * Last update: Phase 5 - Hive Engine integration
 */

import logger from './logger.js';

// List of known Hive Engine API nodes for failover
const HIVE_ENGINE_NODES = [
  'https://api.hive-engine.com/rpc',
  'https://engine.rishipanthee.com',
  'https://herpc.dtools.dev',
  'https://api.primersion.com',
];

// Track node health for intelligent failover
interface HENodeHealth {
  node: string;
  lastSuccess: number;
  lastFailure: number;
  failureCount: number;
  avgResponseTime: number;
  totalRequests: number;
}

const heNodeHealthMap = new Map<string, HENodeHealth>();

// Initialize node health tracking
HIVE_ENGINE_NODES.forEach(node => {
  heNodeHealthMap.set(node, {
    node,
    lastSuccess: Date.now(),
    lastFailure: 0,
    failureCount: 0,
    avgResponseTime: 0,
    totalRequests: 0,
  });
});

// Current primary node
let currentHEPrimaryNode = HIVE_ENGINE_NODES[0];

interface HEJsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Get ordered list of HE nodes based on health
 */
function getOrderedHENodes(): string[] {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  
  return [...HIVE_ENGINE_NODES].sort((a, b) => {
    const healthA = heNodeHealthMap.get(a)!;
    const healthB = heNodeHealthMap.get(b)!;
    
    // Penalize nodes that failed recently
    const aRecentFailure = (now - healthA.lastFailure) < oneMinute;
    const bRecentFailure = (now - healthB.lastFailure) < oneMinute;
    
    if (aRecentFailure && !bRecentFailure) return 1;
    if (!aRecentFailure && bRecentFailure) return -1;
    
    // Prefer nodes with lower failure count
    if (healthA.failureCount !== healthB.failureCount) {
      return healthA.failureCount - healthB.failureCount;
    }
    
    // Prefer nodes with better response time
    return healthA.avgResponseTime - healthB.avgResponseTime;
  });
}

/**
 * Update HE node health after a request
 */
function updateHENodeHealth(node: string, success: boolean, responseTime?: number): void {
  const health = heNodeHealthMap.get(node);
  if (!health) return;
  
  const now = Date.now();
  health.totalRequests++;
  
  if (success) {
    health.lastSuccess = now;
    health.failureCount = Math.max(0, health.failureCount - 1);
    
    if (responseTime !== undefined) {
      const oldAvg = health.avgResponseTime;
      const count = health.totalRequests;
      health.avgResponseTime = oldAvg + (responseTime - oldAvg) / count;
    }
  } else {
    health.lastFailure = now;
    health.failureCount++;
    
    if (node === currentHEPrimaryNode && health.failureCount >= 2) {
      const orderedNodes = getOrderedHENodes();
      if (orderedNodes[0] !== node) {
        currentHEPrimaryNode = orderedNodes[0];
        logger.info(`Switching HE primary node from ${node} to ${currentHEPrimaryNode}`);
      }
    }
  }
  
  heNodeHealthMap.set(node, health);
}

/**
 * Make a single JSON-RPC call to a specific HE node
 */
async function heRpcCallToNode<T>(node: string, method: string, params: unknown): Promise<T> {
  const startTime = Date.now();
  
  // Hive Engine uses POST with contracts endpoint
  const url = node.endsWith('/rpc') ? node.replace('/rpc', '/contracts') : `${node}/contracts`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  const responseTime = Date.now() - startTime;

  if (!response.ok) {
    updateHENodeHealth(node, false);
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as HEJsonRpcResponse<T>;

  if (data.error) {
    const isNodeError = data.error.code === -32603 || data.error.code === -32000;
    if (isNodeError) {
      updateHENodeHealth(node, false);
    }
    throw new Error(`JSON-RPC error: ${data.error.message}`);
  }

  updateHENodeHealth(node, true, responseTime);
  return data.result as T;
}

/**
 * Make a JSON-RPC call to Hive Engine with automatic failover
 */
export async function heRpcCall<T>(method: string, params: unknown): Promise<T> {
  const orderedNodes = getOrderedHENodes();
  let lastError: Error | null = null;
  
  for (const node of orderedNodes) {
    try {
      return await heRpcCallToNode<T>(node, method, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.debug(`HE Node ${node} failed for ${method}: ${lastError.message}`);
    }
  }
  
  throw new Error(`All Hive Engine API nodes failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Query a single record from a Hive Engine contract table
 */
export async function findOne<T>(
  contract: string,
  table: string,
  query: Record<string, unknown>
): Promise<T | null> {
  const result = await heRpcCall<T[]>('findOne', {
    contract,
    table,
    query,
  });
  return result ? (Array.isArray(result) ? result[0] : result) : null;
}

/**
 * Query multiple records from a Hive Engine contract table
 */
export async function find<T>(
  contract: string,
  table: string,
  query: Record<string, unknown>,
  limit: number = 1000,
  offset: number = 0,
  indexes?: Array<{ index: string; descending: boolean }>
): Promise<T[]> {
  const params: Record<string, unknown> = {
    contract,
    table,
    query,
    limit,
    offset,
  };
  
  if (indexes && indexes.length > 0) {
    params.indexes = indexes;
  }
  
  const result = await heRpcCall<T[]>('find', params);
  return result || [];
}

/**
 * Get token information
 */
export async function getToken(symbol: string): Promise<HEToken | null> {
  return findOne<HEToken>('tokens', 'tokens', { symbol });
}

/**
 * Get token balance for an account
 */
export async function getTokenBalance(account: string, symbol: string): Promise<HEBalance | null> {
  return findOne<HEBalance>('tokens', 'balances', { account, symbol });
}

/**
 * Get all token balances for an account
 */
export async function getAccountBalances(account: string): Promise<HEBalance[]> {
  return find<HEBalance>('tokens', 'balances', { account }, 1000, 0);
}

/**
 * Get market buy orders for a token
 */
export async function getMarketBuyBook(symbol: string, limit: number = 100): Promise<HEMarketOrder[]> {
  return find<HEMarketOrder>('market', 'buyBook', { symbol }, limit, 0, [
    { index: 'priceDec', descending: true }
  ]);
}

/**
 * Get market sell orders for a token
 */
export async function getMarketSellBook(symbol: string, limit: number = 100): Promise<HEMarketOrder[]> {
  return find<HEMarketOrder>('market', 'sellBook', { symbol }, limit, 0, [
    { index: 'priceDec', descending: false }
  ]);
}

/**
 * Get market trade history for a token
 */
export async function getMarketHistory(symbol: string, limit: number = 100): Promise<HETradeHistory[]> {
  return find<HETradeHistory>('market', 'tradesHistory', { symbol }, limit, 0, [
    { index: '_id', descending: true }
  ]);
}

/**
 * Get market metrics for a token
 */
export async function getMarketMetrics(symbol: string): Promise<HEMarketMetrics | null> {
  return findOne<HEMarketMetrics>('market', 'metrics', { symbol });
}

/**
 * Get open orders for an account
 */
export async function getOpenOrders(account: string): Promise<HEMarketOrder[]> {
  const buyOrders = await find<HEMarketOrder>('market', 'buyBook', { account }, 100, 0);
  const sellOrders = await find<HEMarketOrder>('market', 'sellBook', { account }, 100, 0);
  return [...buyOrders, ...sellOrders];
}

/**
 * Get NFTs owned by an account
 */
export async function getNFTInstances(account: string, symbol?: string): Promise<HENFTInstance[]> {
  const query: Record<string, unknown> = { account };
  if (symbol) {
    query.symbol = symbol;
  }
  return find<HENFTInstance>('nft', 'nfts', query, 1000, 0);
}

/**
 * Get NFT definition/properties
 */
export async function getNFTDefinition(symbol: string): Promise<HENFTDefinition | null> {
  return findOne<HENFTDefinition>('nft', 'nfts', { symbol });
}

/**
 * Get NFT sell orders
 */
export async function getNFTSellOrders(symbol: string, limit: number = 100): Promise<HENFTOrder[]> {
  return find<HENFTOrder>('nftmarket', 'sellBook', { symbol }, limit, 0, [
    { index: 'priceDec', descending: false }
  ]);
}

/**
 * Get liquidity pool info
 */
export async function getPool(tokenPair: string): Promise<HEPool | null> {
  return findOne<HEPool>('marketpools', 'pools', { tokenPair });
}

/**
 * Get all liquidity pools
 */
export async function getPools(limit: number = 100): Promise<HEPool[]> {
  return find<HEPool>('marketpools', 'pools', {}, limit, 0);
}

/**
 * Get current HE node health status
 */
export function getHENodeHealthStatus(): Array<{ node: string; health: HENodeHealth }> {
  return HIVE_ENGINE_NODES.map(node => ({
    node,
    health: heNodeHealthMap.get(node)!,
  }));
}

/**
 * Get current primary HE node
 */
export function getCurrentHEPrimaryNode(): string {
  return currentHEPrimaryNode;
}

// =============================================================================
// Type Definitions for Hive Engine Data
// =============================================================================

export interface HEToken {
  _id: number;
  issuer: string;
  symbol: string;
  name: string;
  metadata: string;
  precision: number;
  maxSupply: string;
  supply: string;
  circulatingSupply: string;
  stakingEnabled: boolean;
  unstakingCooldown: number;
  delegationEnabled: boolean;
  undelegationCooldown: number;
}

export interface HEBalance {
  _id: number;
  account: string;
  symbol: string;
  balance: string;
  stake: string;
  pendingUnstake: string;
  delegationsIn: string;
  delegationsOut: string;
  pendingUndelegations: string;
}

export interface HEMarketOrder {
  _id: number;
  txId: string;
  timestamp: number;
  account: string;
  symbol: string;
  quantity: string;
  price: string;
  priceDec: { $numberDecimal: string };
  tokensLocked: string;
  expiration: number;
}

export interface HETradeHistory {
  _id: number;
  type: string;
  buyer: string;
  seller: string;
  symbol: string;
  quantity: string;
  price: string;
  timestamp: number;
  volume: string;
  buyTxId: string;
  sellTxId: string;
}

export interface HEMarketMetrics {
  _id: number;
  symbol: string;
  volume: string;
  volumeExpiration: number;
  lastPrice: string;
  lowestAsk: string;
  highestBid: string;
  lastDayPrice: string;
  lastDayPriceExpiration: number;
  priceChangeHive: string;
  priceChangePercent: string;
}

export interface HENFTInstance {
  _id: string;
  account: string;
  ownedBy: string;
  lockedTokens: string;
  properties: Record<string, unknown>;
  delegatedTo?: {
    account: string;
    ownedBy: string;
  };
}

export interface HENFTDefinition {
  _id: number;
  symbol: string;
  issuer: string;
  name: string;
  metadata: string;
  maxSupply: number;
  supply: number;
  circulatingSupply: number;
  delegationEnabled: boolean;
  undelegationCooldown: number;
  authorizedIssuingAccounts: string[];
  authorizedIssuingContracts: string[];
  properties: Record<string, unknown>;
  groupBy: string[];
}

export interface HENFTOrder {
  _id: string;
  account: string;
  ownedBy: string;
  nftId: string;
  grouping: Record<string, unknown>;
  timestamp: number;
  price: string;
  priceDec: { $numberDecimal: string };
  priceSymbol: string;
  fee: number;
}

export interface HEPool {
  _id: number;
  tokenPair: string;
  baseQuantity: string;
  quoteQuantity: string;
  basePrice: string;
  quotePrice: string;
  baseVolume: string;
  quoteVolume: string;
  totalShares: string;
  precision: number;
  creator: string;
}

export default {
  heRpcCall,
  findOne,
  find,
  getToken,
  getTokenBalance,
  getAccountBalances,
  getMarketBuyBook,
  getMarketSellBook,
  getMarketHistory,
  getMarketMetrics,
  getOpenOrders,
  getNFTInstances,
  getNFTDefinition,
  getNFTSellOrders,
  getPool,
  getPools,
  getHENodeHealthStatus,
  getCurrentHEPrimaryNode,
};

