/**
 * Savings Tools Implementation
 * 
 * Summary: Provides tools for savings account operations.
 * Purpose: Transfer to/from savings with WAX transaction builder.
 * Key elements: savings (consolidated dispatcher)
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
 * Consolidated dispatcher for all savings operations
 * Handles: deposit, withdraw, cancel_withdraw, get_withdrawals
 */
export async function savings(
  params: {
    action: 'deposit' | 'withdraw' | 'cancel_withdraw' | 'get_withdrawals';
    amount?: number;
    currency?: string;
    to?: string;
    memo?: string;
    request_id?: number;
    account?: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'deposit':
      if (!params.amount || !params.currency) {
        return errorResponse('Error: Amount and currency are required for deposit action');
      }
      return transferToSavings({
        amount: params.amount,
        currency: params.currency,
        to: params.to,
        memo: params.memo,
      });
    case 'withdraw':
      if (!params.amount || !params.currency) {
        return errorResponse('Error: Amount and currency are required for withdraw action');
      }
      return transferFromSavings({
        amount: params.amount,
        currency: params.currency,
        to: params.to,
        memo: params.memo,
      });
    case 'cancel_withdraw':
      if (params.request_id === undefined) {
        return errorResponse('Error: Request ID is required for cancel_withdraw action');
      }
      return cancelSavingsWithdraw({ request_id: params.request_id });
    case 'get_withdrawals':
      if (!params.account) {
        return errorResponse('Error: Account is required for get_withdrawals action');
      }
      return getSavingsWithdrawals({ account: params.account });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

/**
 * Transfer to Savings - Deposit HIVE or HBD to savings account
 * Uses transfer_to_savings_operation
 */
export async function transferToSavings(
  params: {
    amount: number;
    currency: string;
    to?: string;
    memo?: string;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Savings operations require an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Target account (self if not specified)
    const targetAccount = params.to || username;
    const currency = params.currency.toUpperCase();

    // Create the asset
    let amountAsset;
    if (currency === 'HIVE') {
      amountAsset = chain.hiveCoins(params.amount);
    } else if (currency === 'HBD') {
      amountAsset = chain.hbdCoins(params.amount);
    } else {
      return errorResponse(`Error: Invalid currency: ${params.currency}. Must be HIVE or HBD.`);
    }

    tx.pushOperation({
      transfer_to_savings_operation: {
        from: username,
        to: targetAccount,
        amount: amountAsset,
        memo: params.memo || '',
      }
    });

    tx.sign(activeKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      from: username,
      to: targetAccount,
      amount: `${params.amount.toFixed(3)} ${currency}`,
      memo: params.memo || '(no memo)',
      action: 'transfer_to_savings',
      note: 'Funds have been deposited to savings. HBD in savings earns interest.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'transfer_to_savings'));
  }
}

/**
 * Transfer from Savings - Withdraw HIVE or HBD from savings
 * Uses transfer_from_savings_operation
 * Note: There is a 3-day waiting period for withdrawals
 */
export async function transferFromSavings(
  params: {
    amount: number;
    currency: string;
    to?: string;
    memo?: string;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Savings operations require an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Target account (self if not specified)
    const targetAccount = params.to || username;
    const currency = params.currency.toUpperCase();

    // Create the asset
    let amountAsset;
    if (currency === 'HIVE') {
      amountAsset = chain.hiveCoins(params.amount);
    } else if (currency === 'HBD') {
      amountAsset = chain.hbdCoins(params.amount);
    } else {
      return errorResponse(`Error: Invalid currency: ${params.currency}. Must be HIVE or HBD.`);
    }

    // Generate unique request ID
    const requestId = generateRequestId();

    tx.pushOperation({
      transfer_from_savings_operation: {
        from: username,
        to: targetAccount,
        amount: amountAsset,
        memo: params.memo || '',
        request_id: requestId,
      }
    });

    tx.sign(activeKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    // Calculate completion date (3 days from now)
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + 3);

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      from: username,
      to: targetAccount,
      amount: `${params.amount.toFixed(3)} ${currency}`,
      memo: params.memo || '(no memo)',
      request_id: requestId,
      action: 'transfer_from_savings',
      estimated_completion: completionDate.toISOString(),
      note: 'Withdrawal initiated. 3-day waiting period before funds are released.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'transfer_from_savings'));
  }
}

/**
 * Cancel Savings Withdraw - Cancel a pending savings withdrawal
 * Uses cancel_transfer_from_savings_operation
 */
export async function cancelSavingsWithdraw(
  params: {
    request_id: number;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Savings operations require an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    tx.pushOperation({
      cancel_transfer_from_savings_operation: {
        from: username,
        request_id: params.request_id,
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
      request_id: params.request_id,
      action: 'cancel_savings_withdraw',
      note: 'Withdrawal has been cancelled. Funds remain in savings.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'cancel_savings_withdraw'));
  }
}

/**
 * Get Savings Withdrawals - Get pending savings withdrawals for an account
 * Uses database_api.find_savings_withdrawals
 */
export async function getSavingsWithdrawals(
  params: {
    account: string;
  }
): Promise<Response> {
  try {
    const result = await callDatabaseApi<{ withdrawals: any[] }>('find_savings_withdrawals', {
      account: params.account,
    });

    const withdrawals = result.withdrawals || [];

    // Format the withdrawals
    const formattedWithdrawals = withdrawals.map((w: any) => ({
      request_id: w.request_id,
      from: w.from,
      to: w.to,
      amount: w.amount,
      memo: w.memo,
      complete: w.complete,
    }));

    return successJson({
      account: params.account,
      pending_withdrawals: formattedWithdrawals,
      withdrawal_count: formattedWithdrawals.length,
      note: formattedWithdrawals.length > 0 
        ? 'Each withdrawal has a 3-day waiting period before completion.'
        : 'No pending savings withdrawals.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_savings_withdrawals'));
  }
}

