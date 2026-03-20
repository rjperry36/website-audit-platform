'use client'

import { isValidElement } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { TrendIndicator } from './trend-indicator'
import { fadeInUp } from '@/lib/animations'
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils'

interface ScoreCardProps {
    title: string
    score: number
    previousScore?: number
    icon: React.ReactNode | React.ElementType
    description?: string
    delay?: number
}

export function ScoreCard({
    title,
    score,
    previousScore,
    icon,
    description,
    delay = 0
}: ScoreCardProps) {
    // Helper to render icon correctly whether it's an element or component
    const renderIcon = () => {
        if (isValidElement(icon)) {
            return icon
        }

        // It's a component
        const Icon = icon as React.ElementType
        return <Icon className="h-4 w-4 text-gray-400" />
    }

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card variant="elevated" className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        {title}
                    </CardTitle>
                    {renderIcon()}
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <AnimatedNumber
                            value={score}
                            className={cn("text-3xl font-bold", getScoreColor(score))}
                        />
                        <span className="text-sm text-gray-500">/100</span>
                    </div>
                    {previousScore !== undefined && (
                        <div className="mt-2">
                            <TrendIndicator value={score} previousValue={previousScore} />
                        </div>
                    )}
                    {description && (
                        <p className="mt-2 text-xs text-gray-500">{description}</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
