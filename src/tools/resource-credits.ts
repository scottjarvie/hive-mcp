/**
 * Resource Credits Tools Implementation
 * 
 * Summary: Provides tools for Resource Credits operations.
 * Purpose: RC delegation and balance queries.
 * Key elements: resourceCredits (consolidated dispatcher)
 * Dependencies: @hiveio/wax, config/client, utils/api, utils/response, utils/error, utils/date
 * Last update: Added date formatting for improved readability
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { jsonRpcCall } from '../utils/api.js';
import { formatTimestamp } from '../utils/date.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for Resource Credits operations
 * Handles: get_rc, delegate_rc
 */
export async function resourceCredits(
  params: {
    action: 'get_rc' | 'delegate_rc';
    accounts?: string[];
    to?: string;
    max_rc?: number;
  }
): Promise<Response> {
  switch (params.action) {
    case 'get_rc':
      if (!params.accounts || params.accounts.length === 0) {
        return errorResponse('Error: Accounts array is required for get_rc action');
      }
      return getRcAccounts({ accounts: params.accounts });
    case 'delegate_rc':
      if (!params.to || params.max_rc === undefined) {
        return errorResponse('Error: "to" account and max_rc are required for delegate_rc action');
      }
      return delegateRc({ to: params.to, max_rc: params.max_rc });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

// Interface for RC account info from API
interface RcAccount {
  account: string;
  rc_manabar: {
    current_mana: string;
    last_update_time: number;
  };
  max_rc_creation_adjustment: {
    amount: string;
    precision: number;
    nai: string;
  };
  max_rc: string;
  delegated_rc: string;
  received_delegated_rc: string;
}

// Interface for RC API response
interface FindRcAccountsResponse {
  rc_accounts: RcAccount[];
}

/**
 * Get Resource Credits information for accounts
 * Uses rc_api.find_rc_accounts
 */
export async function getRcAccounts(
  params: { accounts: string[] }
): Promise<Response> {
  try {
    const response = await jsonRpcCall<FindRcAccountsResponse>(
      'rc_api.find_rc_accounts',
      { accounts: params.accounts }
    );

    const rcAccounts = response.rc_accounts.map((rc) => {
      // Calculate current RC percentage
      const maxRc = BigInt(rc.max_rc);
      const currentMana = BigInt(rc.rc_manabar.current_mana);
      const rcPercent = maxRc > 0n 
        ? Number((currentMana * 10000n) / maxRc) / 100 
        : 0;

      return {
        account: rc.account,
        max_rc: rc.max_rc,
        current_rc: rc.rc_manabar.current_mana,
        rc_percent: rcPercent.toFixed(2),
        delegated_rc: rc.delegated_rc,
        received_delegated_rc: rc.received_delegated_rc,
        last_update: formatTimestamp(rc.rc_manabar.last_update_time),
      };
    });

    return successJson({
      accounts_count: rcAccounts.length,
      rc_accounts: rcAccounts,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_rc_accounts'));
  }
}

/**
 * Delegate Resource Credits to another account
 * Broadcasts a custom_json RC delegation operation
 */
export async function delegateRc(
  params: { to: string; max_rc: number }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const privateKey = config.hive.postingKey;

    if (!username || !privateKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set');
    }

    // Validate max_rc is a positive number
    if (params.max_rc < 0) {
      return errorResponse('Error: max_rc must be a non-negative number');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // RC delegation custom_json format
    // Setting max_rc to 0 revokes the delegation
    const rcDelegationJson = JSON.stringify([
      'delegate_rc',
      {
        from: username,
        delegatees: [params.to],
        max_rc: params.max_rc,
      },
    ]);

    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'rc',
        json: rcDelegationJson,
      },
    });

    tx.sign(privateKey);
    await chain.broadcast(tx);

    const txId = tx.id;
    const action = params.max_rc > 0 ? 'delegated' : 'revoked delegation';

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      from: username,
      to: params.to,
      max_rc: params.max_rc,
      action,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'delegate_rc'));
  }
}

