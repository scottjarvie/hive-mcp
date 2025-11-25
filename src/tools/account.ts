/**
 * Account-related Tools Implementation
 * 
 * Summary: Provides tools for fetching Hive account information, history, and delegations.
 * Purpose: Read-only account data retrieval from the Hive blockchain.
 * Key elements: accountInfo (consolidated dispatcher)
 * Dependencies: @hiveio/wax (via config/client), utils/response, utils/error, utils/api, content-advanced.js
 * Last update: Tool consolidation - added dispatcher function
 */

import { getChain } from '../config/client.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi } from '../utils/api.js';
import { getAccountNotifications } from './content-advanced.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for account info queries
 * Handles: get_info, get_history, get_delegations, get_notifications
 */
export async function accountInfo(
  params: {
    action: 'get_info' | 'get_history' | 'get_delegations' | 'get_notifications';
    username?: string;
    limit?: number;
    operation_filter?: string[];
    from?: string;
    last_id?: number;
  }
): Promise<Response> {
  if (!params.username) {
    return errorResponse('Error: Username is required');
  }

  switch (params.action) {
    case 'get_info':
      return getAccountInfo({ username: params.username });
    case 'get_history':
      return getAccountHistory({
        username: params.username,
        limit: params.limit || 10,
        operation_filter: params.operation_filter,
      });
    case 'get_delegations':
      return getVestingDelegations({
        username: params.username,
        limit: params.limit || 100,
        from: params.from,
      });
    case 'get_notifications':
      return getAccountNotifications({
        account: params.username,
        limit: params.limit || 50,
        last_id: params.last_id,
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

/**
 * Get account information
 * Fetches detailed information about a Hive blockchain account
 */
export async function getAccountInfo(
  params: { username: string }
): Promise<Response> {
  try {
    const chain = await getChain();
    
    // Use WAX database_api to get account info
    const result = await chain.api.database_api.find_accounts({
      accounts: [params.username]
    });
    
    if (!result.accounts || result.accounts.length === 0) {
      return errorResponse(`Error: Account ${params.username} not found`);
    }
    
    const accountData = result.accounts[0];
    return successJson(accountData);
  } catch (error) {
    return errorResponse(handleError(error, 'get_account_info'));
  }
}

/**
 * Get account history
 * Retrieves transaction history for a Hive account with optional operation filtering
 */
export async function getAccountHistory(
  params: { 
    username: string; 
    limit: number; 
    operation_filter?: string[] | undefined;
  }
): Promise<Response> {
  try {
    // Use direct API call for account history
    const result = await callCondenserApi<Array<[number, { timestamp: string; op: [string, unknown]; trx_id: string }]>>(
      'get_account_history',
      [params.username, -1, params.limit]
    );

    if (!result || !Array.isArray(result)) {
      return successJson({
        account: params.username,
        operations_count: 0,
        operations: [],
      });
    }

    // Format the history into a structured object
    const formattedHistory = result
      .map(([index, operation]) => {
        const { timestamp, op, trx_id } = operation;
        const opType = op[0];
        const opData = op[1];

        // Filter operations if needed
        if (
          params.operation_filter &&
          params.operation_filter.length > 0 &&
          !params.operation_filter.includes(opType)
        ) {
          return null;
        }

        return {
          index,
          type: opType,
          timestamp,
          transaction_id: trx_id,
          details: opData,
        };
      })
      .filter(Boolean);

    return successJson({
      account: params.username,
      operations_count: formattedHistory.length,
      operations: formattedHistory,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_account_history'));
  }
}

/**
 * Get vesting delegations
 * Retrieves a list of vesting delegations made by a specific Hive account
 */
export async function getVestingDelegations(
  params: { 
    username: string; 
    limit: number; 
    from?: string;
  }
): Promise<Response> {
  try {
    // Use direct API call for vesting delegations
    const result = await callCondenserApi<Array<{
      delegator: string;
      delegatee: string;
      vesting_shares: string;
      min_delegation_time: string;
    }>>(
      'get_vesting_delegations',
      [params.username, params.from || '', params.limit]
    );
    
    if (!result || !Array.isArray(result)) {
      return successJson({
        account: params.username,
        delegations_count: 0,
        delegations: []
      });
    }
    
    const formattedDelegations = result.map(delegation => ({
      delegator: delegation.delegator,
      delegatee: delegation.delegatee,
      vesting_shares: delegation.vesting_shares,
      min_delegation_time: delegation.min_delegation_time,
    }));
    
    return successJson({
      account: params.username,
      delegations_count: formattedDelegations.length,
      delegations: formattedDelegations
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_vesting_delegations'));
  }
}
