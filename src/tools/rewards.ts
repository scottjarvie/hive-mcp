/**
 * Rewards Tools Implementation
 * 
 * Summary: Provides tools for claiming rewards and querying reward info.
 * Purpose: Claim pending author/curation rewards and get reward pool data.
 * Key elements: rewards (consolidated dispatcher)
 * Dependencies: @hiveio/wax (via config/client), config, utils/response, utils/error, utils/api
 * Last update: Tool consolidation - added dispatcher function
 */

import { getChain } from '../config/client.js';
import config from '../config/index.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi, callDatabaseApi, vestsToHp, getGlobalProperties } from '../utils/api.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for all rewards operations
 * Handles: claim, get_fund_info, get_pending
 */
export async function rewards(
  params: {
    action: 'claim' | 'get_fund_info' | 'get_pending';
    account?: string;
    fund_name?: string;
  }
): Promise<Response> {
  switch (params.action) {
    case 'claim':
      return claimRewards({});
    case 'get_fund_info':
      return getRewardFund({ fund_name: params.fund_name || 'post' });
    case 'get_pending':
      if (!params.account) {
        return errorResponse('Error: Account is required for get_pending action');
      }
      return getPendingRewards({ account: params.account });
    default:
      return errorResponse(`Unknown action: ${params.action}`);
  }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

/**
 * Claim Rewards - Claim all pending author and curation rewards
 * Uses claim_reward_balance_operation
 */
export async function claimRewards(
  _params: Record<string, never>
): Promise<Response> {
  try {
    const username = config.hive.username;
    const postingKey = config.hive.postingKey;

    if (!username || !postingKey) {
      return errorResponse('Error: HIVE_USERNAME or HIVE_POSTING_KEY environment variables are not set.');
    }

    // First, get the account to see pending rewards
    const accounts = await callCondenserApi<any[]>('get_accounts', [[username]]);
    
    if (!accounts || accounts.length === 0) {
      return errorResponse(`Error: Account ${username} not found`);
    }

    const account = accounts[0];
    const rewardHive = account.reward_hive_balance || '0.000 HIVE';
    const rewardHbd = account.reward_hbd_balance || '0.000 HBD';
    const rewardVests = account.reward_vesting_balance || '0.000000 VESTS';

    // Parse the amounts
    const hiveAmount = parseFloat(rewardHive.split(' ')[0]);
    const hbdAmount = parseFloat(rewardHbd.split(' ')[0]);
    const vestsAmount = parseFloat(rewardVests.split(' ')[0]);

    // Check if there are any rewards to claim
    if (hiveAmount === 0 && hbdAmount === 0 && vestsAmount === 0) {
      return successJson({
        success: true,
        message: 'No rewards to claim',
        account: username,
        reward_hive: rewardHive,
        reward_hbd: rewardHbd,
        reward_vests: rewardVests,
      });
    }

    const chain = await getChain();
    const tx = await chain.createTransaction();

    // Create assets using WAX helpers
    const hiveAsset = chain.hiveCoins(hiveAmount);
    const hbdAsset = chain.hbdCoins(hbdAmount);
    const vestsAsset = chain.vestsSatoshis(Math.round(vestsAmount * 1000000));

    tx.pushOperation({
      claim_reward_balance_operation: {
        account: username,
        reward_hive: hiveAsset,
        reward_hbd: hbdAsset,
        reward_vests: vestsAsset,
      }
    });

    tx.sign(postingKey);
    await chain.broadcast(tx);

    const txId = tx.id;

    // Calculate HP equivalent
    const globals = await getGlobalProperties();
    const hpAmount = vestsToHp(vestsAmount, globals);

    return successJson({
      success: true,
      transaction_id: txId,
      transaction_url: `https://www.hiveblockexplorer.com/tx/${txId}`,
      account: username,
      claimed_hive: rewardHive,
      claimed_hbd: rewardHbd,
      claimed_vests: rewardVests,
      claimed_hp_equivalent: `${hpAmount.toFixed(3)} HP`,
      action: 'claim_rewards',
    });
  } catch (error) {
    return errorResponse(handleError(error, 'claim_rewards'));
  }
}

/**
 * Get Reward Fund - Get information about the reward pool
 * Uses condenser_api.get_reward_fund
 */
export async function getRewardFund(
  params: {
    fund_name: string;
  }
): Promise<Response> {
  try {
    const fundName = params.fund_name || 'post';
    
    const result = await callCondenserApi<any>('get_reward_fund', [fundName]);

    if (!result) {
      return errorResponse(`Error: Reward fund "${fundName}" not found`);
    }

    return successJson({
      fund_name: result.name,
      reward_balance: result.reward_balance,
      recent_claims: result.recent_claims,
      last_update: result.last_update,
      content_constant: result.content_constant,
      percent_curation_rewards: result.percent_curation_rewards,
      percent_content_rewards: result.percent_content_rewards,
      author_reward_curve: result.author_reward_curve,
      curation_reward_curve: result.curation_reward_curve,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_reward_fund'));
  }
}

/**
 * Get Pending Rewards - Get unclaimed rewards for an account
 * Uses condenser_api.get_accounts
 */
export async function getPendingRewards(
  params: {
    account: string;
  }
): Promise<Response> {
  try {
    const accounts = await callCondenserApi<any[]>('get_accounts', [[params.account]]);
    
    if (!accounts || accounts.length === 0) {
      return errorResponse(`Error: Account ${params.account} not found`);
    }

    const account = accounts[0];
    const rewardHive = account.reward_hive_balance || '0.000 HIVE';
    const rewardHbd = account.reward_hbd_balance || '0.000 HBD';
    const rewardVests = account.reward_vesting_balance || '0.000000 VESTS';

    // Calculate HP equivalent
    const vestsAmount = parseFloat(rewardVests.split(' ')[0]);
    const globals = await getGlobalProperties();
    const hpAmount = vestsToHp(vestsAmount, globals);

    // Calculate total value estimate (rough)
    const hiveAmount = parseFloat(rewardHive.split(' ')[0]);
    const hbdAmount = parseFloat(rewardHbd.split(' ')[0]);
    const hasRewards = hiveAmount > 0 || hbdAmount > 0 || vestsAmount > 0;

    return successJson({
      account: params.account,
      pending_rewards: {
        hive: rewardHive,
        hbd: rewardHbd,
        vests: rewardVests,
        hp_equivalent: `${hpAmount.toFixed(3)} HP`,
      },
      has_pending_rewards: hasRewards,
      total_liquid_pending: `${(hiveAmount + hbdAmount).toFixed(3)} (HIVE + HBD)`,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_pending_rewards'));
  }
}

