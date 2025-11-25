/**
 * Blockchain-related Tools Implementation
 * 
 * Summary: Provides tools for fetching Hive blockchain properties and statistics.
 * Purpose: Read-only blockchain data retrieval.
 * Key elements: getChainProperties
 * Dependencies: @hiveio/wax (via config/client), utils/response, utils/error, utils/api, utils/date
 * Last update: Added date formatting for improved readability
 */

import { getChain } from '../config/client.js';
import { type Response } from '../utils/response.js';
import { handleError } from '../utils/error.js';
import { successJson, errorResponse } from '../utils/response.js';
import { callCondenserApi } from '../utils/api.js';
import { formatDate } from '../utils/date.js';

/**
 * Get blockchain properties and statistics
 * Fetches dynamic global properties, chain properties, and current price feed
 */
export async function getChainProperties(
  // Using an empty object for the params since the tool doesn't need any inputs
  _params: Record<string, never>
): Promise<Response> {
  try {
    const chain = await getChain();
    
    // Fetch global properties using WAX API
    const dynamicProps = await chain.api.database_api.get_dynamic_global_properties({});
    
    // Fetch price feed using direct API call
    const currentFeed = await callCondenserApi<{ base: string; quote: string }>(
      'get_current_median_history_price',
      []
    );
    
    // Fetch chain properties via direct API call  
    const chainProps = await callCondenserApi<{
      account_creation_fee: string;
      maximum_block_size: number;
      hbd_interest_rate: number;
    }>(
      'get_chain_properties',
      []
    );
    
    // Format the response
    const response = {
      dynamic_properties: dynamicProps,
      chain_properties: chainProps,
      current_median_history_price: currentFeed ? {
        base: currentFeed.base,
        quote: currentFeed.quote,
      } : null,
      timestamp: formatDate(new Date().toISOString()),
    };
    
    return successJson(response);
  } catch (error) {
    return errorResponse(handleError(error, 'get_chain_properties'));
  }
}
