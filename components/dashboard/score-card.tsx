'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { TrendIndicator } from './trend-indicator'
import { fadeInUp } from '@/lib/animations'
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ScoreCardProps {
    title: string
    score: number
    previousScore?: number
    icon: LucideIcon
    description?: string
    delay?: number
}

export function ScoreCard({
    title,
    score,
    previousScore,
    icon: Icon,
    description,
    delay = 0
}: ScoreCardProps) {
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
                    <Icon className="h-4 w-4 text-gray-400" />
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
