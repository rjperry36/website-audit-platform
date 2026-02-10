'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
    value: number
    previousValue?: number
    className?: string
}

export function TrendIndicator({ value, previousValue, className }: TrendIndicatorProps) {
    if (!previousValue) {
        return null
    }

    const change = value - previousValue
    const percentChange = ((change / previousValue) * 100).toFixed(1)

    const isPositive = change > 0
    const isNeutral = change === 0

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                isNeutral && "bg-gray-100 text-gray-600",
                isPositive && "bg-green-100 text-green-700",
                !isPositive && !isNeutral && "bg-red-100 text-red-700",
                className
            )}
        >
            {isNeutral ? (
                <Minus className="h-3 w-3" />
            ) : isPositive ? (
                <TrendingUp className="h-3 w-3" />
            ) : (
                <TrendingDown className="h-3 w-3" />
            )}
            <span>{isPositive && '+'}{percentChange}%</span>
        </motion.div>
    )
}
