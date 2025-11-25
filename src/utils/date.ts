/**
 * Date Formatting Utilities
 * 
 * Summary: Utilities for formatting blockchain timestamps to human-readable formats.
 * Purpose: Convert raw ISO dates to readable format with relative time.
 * Key elements: formatDate, formatRelativeTime, formatTimestamp
 * Dependencies: none
 * Last update: Initial creation for improved date readability in MCP responses
 */

/**
 * Format a blockchain timestamp to human-readable format with relative time
 * Output: "Nov 25, 2025 4:15 PM (2h ago)"
 * @param isoDate - ISO date string from blockchain (UTC, without Z suffix)
 * @returns Formatted date string with relative time
 */
export function formatDate(isoDate: string | undefined | null): string {
  if (!isoDate) return 'N/A';
  
  // Blockchain times are UTC but often don't have Z suffix
  const dateStr = isoDate.endsWith('Z') ? isoDate : isoDate + 'Z';
  const date = new Date(dateStr);
  
  // Check for invalid date
  if (isNaN(date.getTime())) return isoDate;
  
  const now = new Date();
  const relative = getRelativeTime(date, now);
  
  // Format absolute date
  const formatted = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
  
  return `${formatted} UTC (${relative})`;
}

/**
 * Format a Unix timestamp (seconds) to human-readable format
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string with relative time
 */
export function formatTimestamp(timestamp: number | undefined | null): string {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  
  // Check for invalid date
  if (isNaN(date.getTime())) return String(timestamp);
  
  const now = new Date();
  const relative = getRelativeTime(date, now);
  
  const formatted = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
  
  return `${formatted} UTC (${relative})`;
}

/**
 * Get relative time string (e.g., "2h ago", "3d ago")
 * @param date - The date to compare
 * @param now - Current date (defaults to now)
 * @returns Relative time string
 */
function getRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  
  // Handle future dates
  if (diffMs < 0) {
    const futureDiffMs = Math.abs(diffMs);
    const futureMins = Math.floor(futureDiffMs / 60000);
    const futureHours = Math.floor(futureDiffMs / 3600000);
    const futureDays = Math.floor(futureDiffMs / 86400000);
    
    if (futureMins < 1) return 'in moments';
    if (futureMins < 60) return `in ${futureMins}m`;
    if (futureHours < 24) return `in ${futureHours}h`;
    return `in ${futureDays}d`;
  }
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

/**
 * Format date as simple relative time only
 * @param isoDate - ISO date string from blockchain
 * @returns Relative time string only
 */
export function formatRelativeTime(isoDate: string | undefined | null): string {
  if (!isoDate) return 'N/A';
  
  const dateStr = isoDate.endsWith('Z') ? isoDate : isoDate + 'Z';
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) return isoDate;
  
  return getRelativeTime(date);
}

export default { formatDate, formatTimestamp, formatRelativeTime };

