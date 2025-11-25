/**
 * Account-related Tools Implementation
 * 
 * Summary: Provides tools for fetching Hive account information, history, profile, and delegations.
 * Purpose: Read-only account data retrieval from the Hive blockchain.
 * Key elements: accountInfo (consolidated dispatcher), getAccountProfile (social profile with reputation)
 * Dependencies: @hiveio/wax (via config/client), utils/response, utils/error, utils/api, utils/date, utils/vests, content-advanced.js
 * Last update: Added voting_power calculation with percentage, HP conversion in history operations
 */

import { getChain } from '../config/client.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi, callBridgeApi } from '../utils/api.js';
import { formatDate, formatTimestamp } from '../utils/date.js';
import { vestsToHP, getVestsConversionRate } from '../utils/vests.js';
import { getAccountNotifications } from './content-advanced.js';

// =============================================================================
// CONSOLIDATED DISPATCHER
// =============================================================================

/**
 * Consolidated dispatcher for account info queries
 * Handles: get_info, get_profile, get_history, get_delegations, get_notifications
 */
export async function accountInfo(
  params: {
    action: 'get_info' | 'get_profile' | 'get_history' | 'get_delegations' | 'get_notifications';
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
    case 'get_profile':
      return getAccountProfile({ username: params.username });
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

// Interface for account data with VESTS fields
interface AccountData {
  name: string;
  balance: { amount: string; nai: string; precision: number };
  hbd_balance: { amount: string; nai: string; precision: number };
  savings_balance: { amount: string; nai: string; precision: number };
  savings_hbd_balance: { amount: string; nai: string; precision: number };
  vesting_shares: { amount: string; nai: string; precision: number };
  delegated_vesting_shares: { amount: string; nai: string; precision: number };
  received_vesting_shares: { amount: string; nai: string; precision: number };
  reward_hive_balance: { amount: string; nai: string; precision: number };
  reward_hbd_balance: { amount: string; nai: string; precision: number };
  reward_vesting_balance: { amount: string; nai: string; precision: number };
  reward_vesting_hive: { amount: string; nai: string; precision: number };
  post_count: number;
  created: string;
  last_post: string;
  last_vote_time: string;
  witnesses_voted_for: number;
  posting_rewards: number;
  curation_rewards: number;
  // Voting power manabar fields
  voting_manabar: { current_mana: string | number; last_update_time: number };
  downvote_manabar: { current_mana: string | number; last_update_time: number };
  post_voting_power: { amount: string; nai: string; precision: number };
  [key: string]: unknown;
}

/**
 * Parse a WAX asset object to a readable string
 */
function parseWaxAsset(asset: { amount: string; nai: string; precision: number }): string {
  const amount = parseInt(asset.amount) / Math.pow(10, asset.precision);
  let symbol = 'UNKNOWN';
  if (asset.nai === '@@000000021') symbol = 'HIVE';
  else if (asset.nai === '@@000000013') symbol = 'HBD';
  else if (asset.nai === '@@000000037') symbol = 'VESTS';
  return `${amount.toFixed(asset.precision)} ${symbol}`;
}

/**
 * Get account information
 * Fetches detailed information about a Hive blockchain account
 * Automatically converts VESTS to HP for human-readable values
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
    
    const account = result.accounts[0] as unknown as AccountData;
    
    // Get conversion rate once to use for all VESTS conversions
    const conversionRate = await getVestsConversionRate();
    
    // Parse VESTS amounts
    const vestingShares = parseInt(account.vesting_shares.amount) / Math.pow(10, account.vesting_shares.precision);
    const delegatedVests = parseInt(account.delegated_vesting_shares.amount) / Math.pow(10, account.delegated_vesting_shares.precision);
    const receivedVests = parseInt(account.received_vesting_shares.amount) / Math.pow(10, account.received_vesting_shares.precision);
    const rewardVests = parseInt(account.reward_vesting_balance.amount) / Math.pow(10, account.reward_vesting_balance.precision);
    
    // Calculate effective vesting (own + received - delegated)
    const effectiveVests = vestingShares + receivedVests - delegatedVests;
    
    // Convert all VESTS to HP
    const ownHP = await vestsToHP(vestingShares, conversionRate);
    const delegatedHP = await vestsToHP(delegatedVests, conversionRate);
    const receivedHP = await vestsToHP(receivedVests, conversionRate);
    const effectiveHP = await vestsToHP(effectiveVests, conversionRate);
    const rewardHP = await vestsToHP(rewardVests, conversionRate);
    
    // Calculate voting power percentage
    const currentMana = typeof account.voting_manabar.current_mana === 'string' 
      ? BigInt(account.voting_manabar.current_mana)
      : BigInt(account.voting_manabar.current_mana);
    const maxMana = BigInt(account.post_voting_power.amount);
    const lastUpdateTime = account.voting_manabar.last_update_time;
    
    // Calculate current voting power with mana regeneration (20% per day = 0.0002315% per second)
    const now = Math.floor(Date.now() / 1000);
    const secondsElapsed = now - lastUpdateTime;
    const regenRate = 0.0002315 / 100; // per second as decimal
    const maxManaNum = Number(maxMana);
    const currentManaNum = Number(currentMana);
    
    // Regenerated mana (capped at max)
    const regeneratedMana = Math.min(
      currentManaNum + (maxManaNum * regenRate * secondsElapsed),
      maxManaNum
    );
    
    // Calculate percentage (0-100)
    const votingPowerPercent = maxManaNum > 0 ? (regeneratedMana / maxManaNum) * 100 : 0;
    
    // Estimate time to full recharge
    let fullRechargeAt = 'Already full';
    if (votingPowerPercent < 100) {
      const manaNeeded = maxManaNum - regeneratedMana;
      const secondsToFull = manaNeeded / (maxManaNum * regenRate);
      const rechargeDate = new Date((now + secondsToFull) * 1000);
      fullRechargeAt = rechargeDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      }) + ' UTC';
    }
    
    // Calculate downvote mana percentage
    const dvCurrentMana = typeof account.downvote_manabar.current_mana === 'string'
      ? BigInt(account.downvote_manabar.current_mana)
      : BigInt(account.downvote_manabar.current_mana);
    const dvMaxMana = maxMana / BigInt(4); // Downvote mana is 25% of vote mana
    const dvCurrentNum = Number(dvCurrentMana);
    const dvMaxNum = Number(dvMaxMana);
    const dvSecondsElapsed = now - account.downvote_manabar.last_update_time;
    const dvRegeneratedMana = Math.min(
      dvCurrentNum + (dvMaxNum * regenRate * dvSecondsElapsed),
      dvMaxNum
    );
    const downvotePowerPercent = dvMaxNum > 0 ? (dvRegeneratedMana / dvMaxNum) * 100 : 0;
    
    // Build formatted response with HP values
    return successJson({
      account: account.name,
      
      // Balances (liquid)
      balance: parseWaxAsset(account.balance),
      hbd_balance: parseWaxAsset(account.hbd_balance),
      savings_balance: parseWaxAsset(account.savings_balance),
      savings_hbd_balance: parseWaxAsset(account.savings_hbd_balance),
      
      // Hive Power (with HP conversions)
      hive_power: {
        own: `${ownHP.toFixed(3)} HP`,
        own_vests: `${vestingShares.toFixed(6)} VESTS`,
        delegated_out: `${delegatedHP.toFixed(3)} HP`,
        delegated_out_vests: `${delegatedVests.toFixed(6)} VESTS`,
        received: `${receivedHP.toFixed(3)} HP`,
        received_vests: `${receivedVests.toFixed(6)} VESTS`,
        effective: `${effectiveHP.toFixed(3)} HP`,
        effective_vests: `${effectiveVests.toFixed(6)} VESTS`,
      },
      
      // Pending rewards
      pending_rewards: {
        hive: parseWaxAsset(account.reward_hive_balance),
        hbd: parseWaxAsset(account.reward_hbd_balance),
        hp: `${rewardHP.toFixed(3)} HP`,
        vests: `${rewardVests.toFixed(6)} VESTS`,
      },
      
      // Stats
      post_count: account.post_count,
      witnesses_voted_for: account.witnesses_voted_for,
      curation_rewards_vests: account.curation_rewards,
      posting_rewards_vests: account.posting_rewards,
      
      // Timestamps
      created: formatDate(account.created),
      last_post: formatDate(account.last_post),
      last_vote_time: formatDate(account.last_vote_time),
      
      // Voting power (calculated with mana regeneration)
      voting_power: {
        current_percent: `${votingPowerPercent.toFixed(2)}%`,
        current_mana: regeneratedMana.toFixed(0),
        max_mana: maxManaNum.toFixed(0),
        last_vote: formatTimestamp(lastUpdateTime),
        full_recharge_at: fullRechargeAt,
      },
      
      // Downvote power
      downvote_power: {
        current_percent: `${downvotePowerPercent.toFixed(2)}%`,
      },
      
      // Include raw data for advanced users
      raw: account,
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_account_info'));
  }
}

// Interface for bridge.get_profile response
interface BridgeProfile {
  name: string;
  created: string;
  active: string;
  post_count: number;
  reputation: number;
  blacklists: string[];
  stats: {
    followers: number;
    following: number;
    rank: number;
  };
  metadata: {
    profile?: {
      name?: string;
      about?: string;
      location?: string;
      website?: string;
      profile_image?: string;
      cover_image?: string;
    };
  };
}

/**
 * Get account profile
 * Fetches user-friendly profile information including reputation, social stats, and bio
 * Uses bridge.get_profile which returns human-readable reputation scores
 */
export async function getAccountProfile(
  params: { username: string }
): Promise<Response> {
  try {
    const profile = await callBridgeApi<BridgeProfile>('get_profile', {
      account: params.username,
    });

    if (!profile || !profile.name) {
      return errorResponse(`Error: Account ${params.username} not found`);
    }

    // Extract profile metadata (may be nested or empty)
    const profileMeta = profile.metadata?.profile || {};

    return successJson({
      username: profile.name,
      reputation: profile.reputation,
      post_count: profile.post_count,
      profile: {
        name: profileMeta.name || null,
        about: profileMeta.about || null,
        location: profileMeta.location || null,
        website: profileMeta.website || null,
        profile_image: profileMeta.profile_image || null,
        cover_image: profileMeta.cover_image || null,
      },
      stats: {
        followers: profile.stats?.followers || 0,
        following: profile.stats?.following || 0,
        rank: profile.stats?.rank || 0,
      },
      created: formatDate(profile.created),
      last_active: formatDate(profile.active),
      blacklists: profile.blacklists || [],
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_account_profile'));
  }
}

/**
 * Helper to extract and convert VESTS to HP in operation data
 * Returns enhanced operation data with HP equivalents where applicable
 */
async function enhanceOperationWithHP(
  opData: Record<string, unknown>,
  conversionRate: number
): Promise<Record<string, unknown>> {
  const enhanced = { ...opData };
  
  // Fields that commonly contain VESTS values
  const vestsFields = ['vesting_shares', 'vesting_payout', 'reward'];
  
  for (const field of vestsFields) {
    if (enhanced[field] && typeof enhanced[field] === 'string') {
      const vestsStr = enhanced[field] as string;
      // Check if it's a VESTS value (contains "VESTS" or is numeric)
      if (vestsStr.includes('VESTS') || /^\d+(\.\d+)?$/.test(vestsStr)) {
        try {
          const hp = await vestsToHP(vestsStr, conversionRate);
          enhanced[`${field}_hp`] = `${hp.toFixed(3)} HP`;
        } catch {
          // Skip if conversion fails
        }
      }
    }
  }
  
  return enhanced;
}

/**
 * Get account history
 * Retrieves transaction history for a Hive account with optional operation filtering
 * Automatically converts VESTS to HP equivalents in operation details
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

    // Get conversion rate once for all operations
    const conversionRate = await getVestsConversionRate();

    // Format the history into a structured object
    const formattedHistory = await Promise.all(
      result.map(async ([index, operation]) => {
        const { timestamp, op, trx_id } = operation;
        const opType = op[0];
        const opData = op[1] as Record<string, unknown>;

        // Filter operations if needed
        if (
          params.operation_filter &&
          params.operation_filter.length > 0 &&
          !params.operation_filter.includes(opType)
        ) {
          return null;
        }

        // Enhance operation data with HP conversions where applicable
        const enhancedDetails = await enhanceOperationWithHP(opData, conversionRate);

        return {
          index,
          type: opType,
          timestamp: formatDate(timestamp),
          transaction_id: trx_id,
          details: enhancedDetails,
        };
      })
    );

    return successJson({
      account: params.username,
      operations_count: formattedHistory.filter(Boolean).length,
      operations: formattedHistory.filter(Boolean),
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_account_history'));
  }
}

/**
 * Get vesting delegations
 * Retrieves a list of vesting delegations made by a specific Hive account
 * Includes HP equivalents for each delegation
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
        total_delegated_hp: '0.000 HP',
        delegations: []
      });
    }
    
    // Get conversion rate once for all delegations
    const conversionRate = await getVestsConversionRate();
    
    // Format delegations with HP equivalents
    const formattedDelegations = await Promise.all(
      result.map(async (delegation) => {
        const hp = await vestsToHP(delegation.vesting_shares, conversionRate);
        return {
          delegator: delegation.delegator,
          delegatee: delegation.delegatee,
          hp: `${hp.toFixed(3)} HP`,
          vesting_shares: delegation.vesting_shares,
          min_delegation_time: formatDate(delegation.min_delegation_time),
        };
      })
    );
    
    // Calculate total delegated HP
    let totalHP = 0;
    for (const del of formattedDelegations) {
      totalHP += parseFloat(del.hp);
    }
    
    return successJson({
      account: params.username,
      delegations_count: formattedDelegations.length,
      total_delegated_hp: `${totalHP.toFixed(3)} HP`,
      delegations: formattedDelegations
    });
  } catch (error) {
    return errorResponse(handleError(error, 'get_vesting_delegations'));
  }
}
