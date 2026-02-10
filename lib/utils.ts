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
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
}

/**
 * Get background color class based on score
 */
export function getScoreBgColor(score: number): string {
    if (score >= 90) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
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
