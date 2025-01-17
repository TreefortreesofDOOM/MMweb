/**
 * Formats a number as USD currency.
 * @param amount - The amount to format (can be in cents or dollars)
 * @param inCents - Whether the amount is in cents (defaults to true)
 * @returns Formatted currency string (e.g., "$10.00")
 */
export function formatCurrency(amount: number, inCents: boolean = true): string {
  const dollars = inCents ? amount / 100 : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(dollars)
}

/**
 * Formats a date string or Date object into a human-readable date.
 * @param date - The date to format
 * @returns Formatted date string (e.g., "January 1, 2024")
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats a date string or Date object into a human-readable date and time.
 * @param date - The date to format
 * @returns Formatted date and time string (e.g., "January 1, 2024 at 12:00 PM")
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
} 