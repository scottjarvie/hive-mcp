/**
 * Staking Tools Implementation
 * 
 * Summary: Provides tools for Hive Power staking operations.
 * Purpose: Power up/down HIVE and delegate HP using WAX transaction builder.
 * Key elements: staking (consolidated dispatcher)
 * Dependencies: @hiveio/wax (via config/client), config, utils/response, utils/error, utils/api
 * Last update: Tool consolidation - added dispatcher function
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { getGlobalProperties, hpToVests } from '../utils/api.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for all staking operations
 * Handles: power_up, power_down, cancel_power_down, delegate_hp, undelegate_hp
 */
export async function staking(
  params: {
    action: 'power_up' | 'power_down' | 'cancel_power_down' | 'delegate_hp' | 'undelegate_hp';
    amount?: number;
    to?: string;
    delegatee?: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'power_up':
      if (!params.amount) {
        return errorResponse('Error: Amount is required for power_up action');
      }
      return powerUp({ amount: params.amount, to: params.to });
    case 'power_down':
      if (!params.amount) {
        return errorResponse('Error: Amount is required for power_down action');
      }
      return powerDown({ amount: params.amount });
    case 'cancel_power_down':
      return cancelPowerDown({});
    case 'delegate_hp':
      if (!params.delegatee || !params.amount) {
        return errorResponse('Error: Delegatee and amount are required for delegate_hp action');
      }
      return delegateHp({ delegatee: params.delegatee, amount: params.amount });
    case 'undelegate_hp':
      if (!params.delegatee) {
        return errorResponse('Error: Delegatee is required for undelegate_hp action');
      }
      return undelegateHp({ delegatee: params.delegatee });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

/**
 * Power Up - Convert HIVE to Hive Power (HP)
 * Uses transfer_to_vesting_operation
 */
export async function powerUp(
  params: {
    amount: number;
    to?: string;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Power up requires an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Target account (self if not specified)
    const targetAccount = params.to || username;

    // Create the asset
    const amountAsset = chain.hiveCoins(params.amount);

    tx.pushOperation({
      transfer_to_vesting_operation: {
        from: username,
        to: targetAccount,
        amount: amountAsset,
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
      amount: `${params.amount.toFixed(3)} HIVE`,
      action: 'power_up',
      note: 'HIVE has been converted to Hive Power (HP)',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'power_up'));
  }
}

/**
 * Power Down - Start withdrawing Hive Power to liquid HIVE
 * Uses withdraw_vesting_operation
 * Power down takes 13 weeks (1/13th released per week)
 */
export async function powerDown(
  params: {
    amount: number;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Power down requires an active key.');
    }

    const chain = await getChain();

    // Get global properties to convert HP to VESTS
    const globals = await getGlobalProperties();
    const vestsAmount = hpToVests(params.amount, globals);

    const tx = await chain.createTransaction();

    // Create VESTS asset
    const vestsAsset = chain.vestsSatoshis(Math.round(vestsAmount * 1000000));

    tx.pushOperation({
      withdraw_vesting_operation: {
        account: username,
        vesting_shares: vestsAsset,
      }
    });

    tx.sign(activeKey);
    await chain.broadcast(tx);

    const txId = tx.id;
    const weeklyAmount = params.amount / 13;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      account: username,
      total_hp: `${params.amount.toFixed(3)} HP`,
      weekly_amount: `${weeklyAmount.toFixed(3)} HP`,
      action: 'power_down',
      note: 'Power down initiated. Takes 13 weeks with weekly payouts.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'power_down'));
  }
}

/**
 * Cancel Power Down - Stop an ongoing power down
 * Uses withdraw_vesting_operation with 0 amount
 */
export async function cancelPowerDown(
  _params: Record<string, never>
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Canceling power down requires an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Setting to 0 cancels the power down
    const zeroVests = chain.vestsSatoshis(0);

    tx.pushOperation({
      withdraw_vesting_operation: {
        account: username,
        vesting_shares: zeroVests,
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
      action: 'cancel_power_down',
      note: 'Power down has been cancelled',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'cancel_power_down'));
  }
}

/**
 * Delegate HP - Delegate Hive Power to another account
 * Uses delegate_vesting_shares_operation
 */
export async function delegateHp(
  params: {
    delegatee: string;
    amount: number;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Delegation requires an active key.');
    }

    const chain = await getChain();

    // Get global properties to convert HP to VESTS
    const globals = await getGlobalProperties();
    const vestsAmount = hpToVests(params.amount, globals);

    const tx = await chain.createTransaction();

    // Create VESTS asset
    const vestsAsset = chain.vestsSatoshis(Math.round(vestsAmount * 1000000));

    tx.pushOperation({
      delegate_vesting_shares_operation: {
        delegator: username,
        delegatee: params.delegatee,
        vesting_shares: vestsAsset,
      }
    });

    tx.sign(activeKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      delegator: username,
      delegatee: params.delegatee,
      amount: `${params.amount.toFixed(3)} HP`,
      action: 'delegate_hp',
      note: 'HP has been delegated. Delegation can be removed after 5 days.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'delegate_hp'));
  }
}

/**
 * Undelegate HP - Remove HP delegation from an account
 * Uses delegate_vesting_shares_operation with 0 amount
 */
export async function undelegateHp(
  params: {
    delegatee: string;
  }
): Promise<Response> {
  try {
    const username = config.hive.username;
    const activeKey = config.hive.activeKey;

    if (!username || !activeKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_ACTIVE_KEY environment variables are not set. Undelegation requires an active key.');
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Setting to 0 removes the delegation
    const zeroVests = chain.vestsSatoshis(0);

    tx.pushOperation({
      delegate_vesting_shares_operation: {
        delegator: username,
        delegatee: params.delegatee,
        vesting_shares: zeroVests,
      }
    });

    tx.sign(activeKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      delegator: username,
      delegatee: params.delegatee,
      action: 'undelegate_hp',
      note: 'Delegation has been removed. HP will return after 5 days.',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'undelegate_hp'));
  }
}

