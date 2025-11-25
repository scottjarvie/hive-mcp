/**
 * Error Handling Utilities
 * 
 * Summary: Utilities for consistent error handling.
 * Purpose: Provides standardized error message formatting.
 * Key elements: handleError
 * Dependencies: None
 * Last update: Migration to ESM
 */

// Handle errors consistently
export function handleError(error: unknown, context: string): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `Error in ${context}: ${errorMessage}`;
}

export default {
  handleError,
};
