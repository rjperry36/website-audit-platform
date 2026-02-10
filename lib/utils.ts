import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number): string {
    return `${Math.round(value)}%`
}

/**
 * Get color class based on score (dark theme)
 */
export function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
}

/**
 * Get background color class based on score (dark theme)
 */
export function getScoreBgColor(score: number): string {
    if (score >= 90) return 'bg-green-500/10 border-green-500/30'
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-red-500/10 border-red-500/30'
}

/**
 * Get badge variant based on finding status
 */
export function getStatusVariant(status: 'pass' | 'warning' | 'fail'): 'success' | 'warning' | 'destructive' {
    if (status === 'pass') return 'success'
    if (status === 'warning') return 'warning'
    return 'destructive'
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
}
