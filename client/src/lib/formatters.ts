/**
 * Utility functions for formatting data values
 */

/**
 * Format a number as currency 
 * @param value Number to format as currency
 * @param decimals Number of decimal places (default: 2)
 * @param currency Currency symbol (default: '$')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, decimals: number = 2, currency: string = '$'): string {
  if (value === null || value === undefined) return '-';
  
  // Handle exponentially small numbers
  if (value > 0 && value < 0.000001) {
    return `${currency}~0`;
  }

  // For large values, reduce decimal places
  if (value > 1000000) {
    decimals = Math.min(decimals, 0);
  } else if (value > 1000) {
    decimals = Math.min(decimals, 1);
  }
  
  return `${currency}${formatNumber(value, decimals)}`;
}

/**
 * Format a number with thousands separators and decimal places
 * @param value Number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === null || value === undefined) return '-';
  
  // Format large numbers with abbreviations
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  
  // Format to specified decimal places
  let formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return formatted;
}

/**
 * Format a percentage value
 * @param value Number to format as percentage
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (value === null || value === undefined) return '-';
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date or timestamp
 * @param date Date object or timestamp
 * @param format Format string (default: 'short')
 * @returns Formatted date string
 */
export function formatDate(date: Date | number | string, format: 'short' | 'medium' | 'long' = 'short'): string {
  if (!date) return '-';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (format === 'short') {
    return dateObj.toLocaleDateString();
  } else if (format === 'medium') {
    return dateObj.toLocaleString();
  } else {
    return dateObj.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Format a time duration in seconds
 * @param seconds Duration in seconds
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export function formatDuration(seconds: number): string {
  if (seconds === null || seconds === undefined) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes}m `;
  }
  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
    result += `${remainingSeconds}s`;
  }
  
  return result.trim();
}