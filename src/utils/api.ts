/**
 * API Utilities
 * 
 * Summary: Direct JSON-RPC API calls to Hive nodes with failover support.
 * Purpose: Provides raw API call functionality with automatic node failover.
 * Key elements: callCondenserApi, callBridgeApi, jsonRpcCallWithFailover
 * Dependencies: None (native fetch)
 * Last update: Phase 3 - Added multi-node failover
 */

import logger from './logger.js';

// List of reliable Hive API nodes for failover
const API_NODES = [
  'https://api.hive.blog',
  'https://api.deathwing.me',
  'https://anyx.io',
  'https://rpc.ausbit.dev',
  'https://hive-api.arcange.eu',
];

// Track node health for intelligent failover
interface NodeHealth {
  node: string;
  lastSuccess: number;
  lastFailure: number;
  failureCount: number;
  avgResponseTime: number;
  totalRequests: number;
}

const nodeHealthMap = new Map<string, NodeHealth>();

// Initialize node health tracking
API_NODES.forEach(node => {
  nodeHealthMap.set(node, {
    node,
    lastSuccess: Date.now(),
    lastFailure: 0,
    failureCount: 0,
    avgResponseTime: 0,
    totalRequests: 0,
  });
});

// Current primary node (starts with first in list)
let currentPrimaryNode = API_NODES[0];

interface JsonRpcResponse<T> {
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
 * Get ordered list of nodes based on health
 * Prioritizes nodes with recent success and low failure count
 */
function getOrderedNodes(): string[] {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  
  return [...API_NODES].sort((a, b) => {
    const healthA = nodeHealthMap.get(a)!;
    const healthB = nodeHealthMap.get(b)!;
    
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
 * Update node health after a request
 */
function updateNodeHealth(node: string, success: boolean, responseTime?: number): void {
  const health = nodeHealthMap.get(node);
  if (!health) return;
  
  const now = Date.now();
  health.totalRequests++;
  
  if (success) {
    health.lastSuccess = now;
    // Decay failure count on success
    health.failureCount = Math.max(0, health.failureCount - 1);
    
    // Update average response time
    if (responseTime !== undefined) {
      const oldAvg = health.avgResponseTime;
      const count = health.totalRequests;
      health.avgResponseTime = oldAvg + (responseTime - oldAvg) / count;
    }
  } else {
    health.lastFailure = now;
    health.failureCount++;
    
    // If this was the primary node and it failed, switch to next best
    if (node === currentPrimaryNode && health.failureCount >= 2) {
      const orderedNodes = getOrderedNodes();
      if (orderedNodes[0] !== node) {
        currentPrimaryNode = orderedNodes[0];
        logger.info(`Switching primary node from ${node} to ${currentPrimaryNode}`);
      }
    }
  }
  
  nodeHealthMap.set(node, health);
}

/**
 * Make a single JSON-RPC call to a specific node
 */
async function jsonRpcCallToNode<T>(node: string, method: string, params: unknown): Promise<T> {
  const startTime = Date.now();
  
  const response = await fetch(node, {
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
    updateNodeHealth(node, false);
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as JsonRpcResponse<T>;

  if (data.error) {
    // Some errors are user errors, not node errors
    const isNodeError = data.error.code === -32603 || // Internal error
                        data.error.code === -32000;   // Server error
    
    if (isNodeError) {
      updateNodeHealth(node, false);
    }
    
    throw new Error(`JSON-RPC error: ${data.error.message}`);
  }

  updateNodeHealth(node, true, responseTime);
  return data.result as T;
}

/**
 * Make a JSON-RPC call with automatic failover
 * Tries multiple nodes until one succeeds
 */
export async function jsonRpcCall<T>(method: string, params: unknown): Promise<T> {
  const orderedNodes = getOrderedNodes();
  let lastError: Error | null = null;
  
  for (const node of orderedNodes) {
    try {
      return await jsonRpcCallToNode<T>(node, method, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.debug(`Node ${node} failed for ${method}: ${lastError.message}`);
      // Continue to next node
    }
  }
  
  // All nodes failed
  throw new Error(`All API nodes failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Call condenser_api method with failover
 */
export async function callCondenserApi<T>(method: string, params: unknown[]): Promise<T> {
  return jsonRpcCall<T>(`condenser_api.${method}`, params);
}

/**
 * Call database_api method with failover
 */
export async function callDatabaseApi<T>(method: string, params: Record<string, unknown>): Promise<T> {
  return jsonRpcCall<T>(`database_api.${method}`, params);
}

/**
 * Call bridge method (for Hivemind social data) with failover
 */
export async function callBridgeApi<T>(method: string, params: Record<string, unknown>): Promise<T> {
  return jsonRpcCall<T>(`bridge.${method}`, params);
}

/**
 * Get current node health status (useful for debugging/monitoring)
 */
export function getNodeHealthStatus(): Array<{ node: string; health: NodeHealth }> {
  return API_NODES.map(node => ({
    node,
    health: nodeHealthMap.get(node)!,
  }));
}

/**
 * Get the current primary node
 */
export function getCurrentPrimaryNode(): string {
  return currentPrimaryNode;
}

/**
 * Manually set the primary node (useful for testing or configuration)
 */
export function setPrimaryNode(node: string): boolean {
  if (API_NODES.includes(node)) {
    currentPrimaryNode = node;
    return true;
  }
  return false;
}

export default {
  jsonRpcCall,
  callCondenserApi,
  callDatabaseApi,
  callBridgeApi,
  getNodeHealthStatus,
  getCurrentPrimaryNode,
  setPrimaryNode,
};
