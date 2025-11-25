/**
 * API Utilities
 * 
 * Summary: Direct JSON-RPC API calls to Hive nodes.
 * Purpose: Provides raw API call functionality for methods not in WAX typed API.
 * Key elements: callCondenserApi, callBridgeApi
 * Dependencies: None (native fetch)
 * Last update: Created for WAX migration
 */

const API_ENDPOINT = 'https://api.hive.blog';

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
 * Make a JSON-RPC call to a Hive node
 */
export async function jsonRpcCall<T>(method: string, params: unknown): Promise<T> {
  const response = await fetch(API_ENDPOINT, {
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

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as JsonRpcResponse<T>;

  if (data.error) {
    throw new Error(`JSON-RPC error: ${data.error.message}`);
  }

  return data.result as T;
}

/**
 * Call condenser_api method
 */
export async function callCondenserApi<T>(method: string, params: unknown[]): Promise<T> {
  return jsonRpcCall<T>(`condenser_api.${method}`, params);
}

/**
 * Call database_api method
 */
export async function callDatabaseApi<T>(method: string, params: Record<string, unknown>): Promise<T> {
  return jsonRpcCall<T>(`database_api.${method}`, params);
}

/**
 * Call bridge method (for Hivemind social data)
 */
export async function callBridgeApi<T>(method: string, params: Record<string, unknown>): Promise<T> {
  return jsonRpcCall<T>(`bridge.${method}`, params);
}

export default {
  jsonRpcCall,
  callCondenserApi,
  callDatabaseApi,
  callBridgeApi,
};

