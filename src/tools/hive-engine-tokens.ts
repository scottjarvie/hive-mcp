/**
 * Hive Engine Token Tools
 * 
 * Summary: Tools for Hive Engine token operations.
 * Purpose: Query token balances/info, transfer, stake, delegate tokens.
 * Key elements: heTokens (consolidated dispatcher)
 * Dependencies: hive-engine-api, config, WAX client
 * Last update: Tool consolidation - added dispatcher function
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import {
  getToken,
  getTokenBalance,
  getAccountBalances,
  find,
  type HEToken,
  type HEBalance,
} from '../utils/hive-engine-api.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for all Hive Engine token operations
 * Handles: balance, info, list, transfer, stake, unstake, delegate, undelegate
 */
export async function heTokens(
  params: {
    action: 'balance' | 'info' | 'list' | 'transfer' | 'stake' | 'unstake' | 'delegate' | 'undelegate';
    account?: string;
    symbol?: string;
    quantity?: string;
    to?: string;
    from?: string;
    memo?: string;
    limit?: number;
    offset?: number;
    issuer?: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'balance':
      if (!params.account) {
        return errorResponse('Error: Account is required for balance action');
      }
      return getHETokenBalance({ account: params.account, symbol: params.symbol });
    case 'info':
      if (!params.symbol) {
        return errorResponse('Error: Symbol is required for info action');
      }
      return getHETokenInfo({ symbol: params.symbol });
    case 'list':
      return getHETokensList({
        limit: params.limit || 100,
        offset: params.offset || 0,
        issuer: params.issuer,
      });
    case 'transfer':
      if (!params.to || !params.symbol || !params.quantity) {
        return errorResponse('Error: to, symbol, and quantity are required for transfer action');
      }
      return transferHEToken({
        to: params.to,
        symbol: params.symbol,
        quantity: params.quantity,
        memo: params.memo || '',
      });
    case 'stake':
      if (!params.symbol || !params.quantity) {
        return errorResponse('Error: Symbol and quantity are required for stake action');
      }
      return stakeHEToken({
        symbol: params.symbol,
        quantity: params.quantity,
        to: params.to,
      });
    case 'unstake':
      if (!params.symbol || !params.quantity) {
        return errorResponse('Error: Symbol and quantity are required for unstake action');
      }
      return unstakeHEToken({
        symbol: params.symbol,
        quantity: params.quantity,
      });
    case 'delegate':
      if (!params.symbol || !params.quantity || !params.to) {
        return errorResponse('Error: Symbol, quantity, and to are required for delegate action');
      }
      return delegateHEToken({
        symbol: params.symbol,
        quantity: params.quantity,
        to: params.to,
      });
    case 'undelegate':
      if (!params.symbol || !params.quantity || !params.from) {
        return errorResponse('Error: Symbol, quantity, and from are required for undelegate action');
      }
      return undelegateHEToken({
        symbol: params.symbol,
        quantity: params.quantity,
        from: params.from,
      });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// Read Operations
// =============================================================================

/**
 * Get token balance(s) for an account
 */
export async function getHETokenBalance(
  params: { account: string; symbol?: string }
): Promise<Response> {
  try {
    if (params.symbol) {
      // Get specific token balance
      const balance = await getTokenBalance(params.account, params.symbol);
      
      if (!balance) {
        return successJson({
          account: params.account,
          symbol: params.symbol,
          balance: '0',
          stake: '0',
          pendingUnstake: '0',
          delegationsIn: '0',
          delegationsOut: '0',
          message: `No ${params.symbol} balance found for account`,
        });
      }

      return successJson({
        account: params.account,
        symbol: balance.symbol,
        balance: balance.balance,
        stake: balance.stake,
        pendingUnstake: balance.pendingUnstake,
        delegationsIn: balance.delegationsIn,
        delegationsOut: balance.delegationsOut,
        total_liquid: balance.balance,
        total_staked: balance.stake,
      });
    } else {
      // Get all token balances
      const balances = await getAccountBalances(params.account);
      
      const formattedBalances = balances.map(b => ({
        symbol: b.symbol,
        balance: b.balance,
        stake: b.stake,
        pendingUnstake: b.pendingUnstake,
        delegationsIn: b.delegationsIn,
        delegationsOut: b.delegationsOut,
      }));

      return successJson({
        account: params.account,
        token_count: formattedBalances.length,
        balances: formattedBalances,
      });
    }
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_token_balance'));
  }
}

/**
 * Get token information
 */
export async function getHETokenInfo(
  params: { symbol: string }
): Promise<Response> {
  try {
    const token = await getToken(params.symbol);
    
    if (!token) {
      return errorResponse(`Error: Token ${params.symbol} not found`);
    }

    // Parse metadata if it's JSON
    let metadata = {};
    try {
      if (token.metadata) {
        metadata = JSON.parse(token.metadata);
      }
    } catch {
      metadata = { raw: token.metadata };
    }

    return successJson({
      symbol: token.symbol,
      name: token.name,
      issuer: token.issuer,
      precision: token.precision,
      maxSupply: token.maxSupply,
      supply: token.supply,
      circulatingSupply: token.circulatingSupply,
      stakingEnabled: token.stakingEnabled,
      unstakingCooldown: token.unstakingCooldown,
      delegationEnabled: token.delegationEnabled,
      undelegationCooldown: token.undelegationCooldown,
      metadata,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_token_info'));
  }
}

/**
 * List tokens with optional filtering
 */
export async function getHETokensList(
  params: { limit: number; offset: number; issuer?: string }
): Promise<Response> {
  try {
    const query: Record<string, unknown> = {};
    if (params.issuer) {
      query.issuer = params.issuer;
    }

    const tokens = await find<HEToken>('tokens', 'tokens', query, params.limit, params.offset);
    
    const formattedTokens = tokens.map(t => ({
      symbol: t.symbol,
      name: t.name,
      issuer: t.issuer,
      precision: t.precision,
      supply: t.supply,
      stakingEnabled: t.stakingEnabled,
      delegationEnabled: t.delegationEnabled,
    }));

    return successJson({
      tokens_count: formattedTokens.length,
      offset: params.offset,
      tokens: formattedTokens,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_he_tokens_list'));
  }
}

// =============================================================================
// Write Operations (require active key)
// =============================================================================

/**
 * Helper to broadcast a Hive Engine custom_json operation
 */
async function broadcastHEOperation(
  contractName: string,
  contractAction: string,
  contractPayload: Record<string, unknown>,
  useActiveKey: boolean = true
): Promise<{ success: boolean; txId: string }> {
  const username = config.hive.username;
  const key = useActiveKey ? config.hive.activeKey : config.hive.postingKey;

  if (!username || !key) {
    throw new Error(`HIVE_USERNAME or ${useActiveKey ? 'HIVE_ACTIVE_KEY' : 'HIVE_POSTING_KEY'} not set`);
  }

  const chain = await getChain();
  const tx = await chain.createTransaction();

  const jsonPayload = JSON.stringify({
    contractName,
    contractAction,
    contractPayload,
  });

  if (useActiveKey) {
    tx.pushOperation({
      custom_json_operation: {
        required_auths: [username],
        required_posting_auths: [],
        id: 'ssc-mainnet-hive',
        json: jsonPayload,
      }
    });
  } else {
    tx.pushOperation({
      custom_json_operation: {
        required_auths: [],
        required_posting_auths: [username],
        id: 'ssc-mainnet-hive',
        json: jsonPayload,
      }
    });
  }

  tx.sign(key);
  await chain.broadcast(tx);

  return { success: true, txId: tx.id };
}

/**
 * Transfer Hive Engine tokens
 */
export async function transferHEToken(
  params: { to: string; symbol: string; quantity: string; memo?: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Token transfers require active key.');
    }

    const result = await broadcastHEOperation('tokens', 'transfer', {
      symbol: params.symbol,
      to: params.to,
      quantity: params.quantity,
      memo: params.memo || '',
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      from: username,
      to: params.to,
      symbol: params.symbol,
      quantity: params.quantity,
      memo: params.memo || '(no memo)',
      action: 'transfer_he_token',
      note: 'Token transfer broadcast to Hive Engine sidechain',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'transfer_he_token'));
  }
}

/**
 * Stake Hive Engine tokens
 */
export async function stakeHEToken(
  params: { symbol: string; quantity: string; to?: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Token staking requires active key.');
    }

    const targetAccount = params.to || username;

    const result = await broadcastHEOperation('tokens', 'stake', {
      symbol: params.symbol,
      to: targetAccount,
      quantity: params.quantity,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      from: username,
      to: targetAccount,
      symbol: params.symbol,
      quantity: params.quantity,
      action: 'stake_he_token',
      note: 'Tokens staked. Check token info for unstaking cooldown period.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'stake_he_token'));
  }
}

/**
 * Unstake Hive Engine tokens
 */
export async function unstakeHEToken(
  params: { symbol: string; quantity: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Token unstaking requires active key.');
    }

    const result = await broadcastHEOperation('tokens', 'unstake', {
      symbol: params.symbol,
      quantity: params.quantity,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      account: username,
      symbol: params.symbol,
      quantity: params.quantity,
      action: 'unstake_he_token',
      note: 'Unstaking initiated. Tokens will be released after cooldown period.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'unstake_he_token'));
  }
}

/**
 * Delegate Hive Engine tokens
 */
export async function delegateHEToken(
  params: { symbol: string; quantity: string; to: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Token delegation requires active key.');
    }

    const result = await broadcastHEOperation('tokens', 'delegate', {
      symbol: params.symbol,
      to: params.to,
      quantity: params.quantity,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      from: username,
      to: params.to,
      symbol: params.symbol,
      quantity: params.quantity,
      action: 'delegate_he_token',
      note: 'Tokens delegated. Check token info for undelegation cooldown.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'delegate_he_token'));
  }
}

/**
 * Undelegate Hive Engine tokens
 */
export async function undelegateHEToken(
  params: { symbol: string; quantity: string; from: string }
): Promise<Response> {
  try {
    const username = config.hive.username;

    if (!username || !config.hive.activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY not set. Token undelegation requires active key.');
    }

    const result = await broadcastHEOperation('tokens', 'undelegate', {
      symbol: params.symbol,
      from: params.from,
      quantity: params.quantity,
    });

    return successJson({
      success: true,
      transaction_id: result.txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${result.txId}`,
      delegator: username,
      delegatee: params.from,
      symbol: params.symbol,
      quantity: params.quantity,
      action: 'undelegate_he_token',
      note: 'Undelegation initiated. Tokens will return after cooldown period.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'undelegate_he_token'));
  }
}

