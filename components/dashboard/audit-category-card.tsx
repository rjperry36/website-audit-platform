'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { fadeInUp } from '@/lib/animations'
import { cn, getScoreColor, getStatusVariant } from '@/lib/utils'
import { LucideIcon, ChevronRight } from 'lucide-react'
import { Finding } from '@/lib/types'

interface AuditCategoryCardProps {
    title: string
    description: string
    score: number
    findings: Finding[]
    icon: LucideIcon
    color: string
    delay?: number
    onClick?: () => void
}

export function AuditCategoryCard({
    title,
    description,
    score,
    findings,
    icon: Icon,
    color,
    delay = 0,
    onClick
}: AuditCategoryCardProps) {
    const passedCount = findings.filter(f => f.status === 'pass').length
    const warningCount = findings.filter(f => f.status === 'warning').length
    const failedCount = findings.filter(f => f.status === 'fail').length

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay }}
            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
            onClick={onClick}
        >
            <Card
                variant={onClick ? "interactive" : "elevated"}
                className={cn("h-full cursor-pointer", onClick && "hover:shadow-xl")}
            >
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("rounded-lg p-2", color)}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{title}</CardTitle>
                                <CardDescription className="mt-1">{description}</CardDescription>
                            </div>
                        </div>
                        {onClick && <ChevronRight className="h-5 w-5 text-gray-400" />}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Score */}
                    <div className="flex items-baseline gap-2">
                        <AnimatedNumber
                            value={score}
                            className={cn("text-4xl font-bold", getScoreColor(score))}
                        />
                        <span className="text-sm text-gray-500">/100</span>
                    </div>

                    {/* Finding Summary */}
                    <div className="flex flex-wrap gap-2">
                        {passedCount > 0 && (
                            <Badge variant="success">
                                ✓ {passedCount} passed
                            </Badge>
                        )}
                        {warningCount > 0 && (
                            <Badge variant="warning">
                                ⚠ {warningCount} warnings
                            </Badge>
                        )}
                        {failedCount > 0 && (
                            <Badge variant="destructive">
                                ✗ {failedCount} failed
                            </Badge>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                                className={cn("h-full", getScoreColor(score).replace('text-', 'bg-'))}
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            {findings.length} checks performed
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
