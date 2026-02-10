'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Finding {
    ruleId: string
    description: string
    level: 'Mandatory' | 'Advisory' | 'Acceptable'
    status: 'pass' | 'warning' | 'fail'
    details: string
    recommendation?: string
    impact: string
}

interface FindingsTableProps {
    findings: Finding[]
    title?: string
}

type FilterStatus = 'all' | 'pass' | 'warning' | 'fail'

export function FindingsTable({ findings, title }: FindingsTableProps) {
    const [filter, setFilter] = useState<FilterStatus>('all')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const filteredFindings = findings.filter(finding => {
        if (filter === 'all') return true
        return finding.status === filter
    })

    const toggleRow = (ruleId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(ruleId)) {
            newExpanded.delete(ruleId)
        } else {
            newExpanded.add(ruleId)
        }
        setExpandedRows(newExpanded)
    }

    const getStatusIcon = (status: Finding['status']) => {
        switch (status) {
            case 'pass':
                return <CheckCircle2 className="h-5 w-5 text-green-400" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-400" />
            case 'fail':
                return <AlertCircle className="h-5 w-5 text-red-400" />
        }
    }

    const getStatusBadge = (status: Finding['status']) => {
        switch (status) {
            case 'pass':
                return <Badge variant="success">Pass</Badge>
            case 'warning':
                return <Badge variant="warning">Warning</Badge>
            case 'fail':
                return <Badge variant="destructive">Fail</Badge>
        }
    }

    const getLevelBadge = (level: Finding['level']) => {
        const variants = {
            Mandatory: 'destructive',
            Advisory: 'warning',
            Acceptable: 'default'
        } as const
        return <Badge variant={variants[level]}>{level}</Badge>
    }

    const counts = {
        all: findings.length,
        pass: findings.filter(f => f.status === 'pass').length,
        warning: findings.filter(f => f.status === 'warning').length,
        fail: findings.filter(f => f.status === 'fail').length
    }

    return (
        <div className="space-y-6">
            {title && (
                <h3 className="text-xl font-semibold text-white">{title}</h3>
            )}

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                        filter === 'all'
                            ? "bg-primary-500 text-white"
                            : "glass text-neutral-300 hover:text-white hover:border-primary-500/50"
                    )}
                >
                    All ({counts.all})
                </button>
                <button
                    onClick={() => setFilter('pass')}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                        filter === 'pass'
                            ? "bg-green-500 text-white"
                            : "glass text-neutral-300 hover:text-white hover:border-green-500/50"
                    )}
                >
                    Passed ({counts.pass})
                </button>
                <button
                    onClick={() => setFilter('warning')}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                        filter === 'warning'
                            ? "bg-yellow-500 text-white"
                            : "glass text-neutral-300 hover:text-white hover:border-yellow-500/50"
                    )}
                >
                    Warnings ({counts.warning})
                </button>
                <button
                    onClick={() => setFilter('fail')}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                        filter === 'fail'
                            ? "bg-red-500 text-white"
                            : "glass text-neutral-300 hover:text-white hover:border-red-500/50"
                    )}
                >
                    Failed ({counts.fail})
                </button>
            </div>

            {/* Findings Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-400">Rule ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-400">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-400">Level</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-400">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredFindings.map((finding) => {
                                    const isExpanded = expandedRows.has(finding.ruleId)
                                    return (
                                        <motion.tr
                                            key={finding.ruleId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td colSpan={5} className="p-0">
                                                <div>
                                                    {/* Main Row */}
                                                    <div
                                                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 cursor-pointer"
                                                        onClick={() => toggleRow(finding.ruleId)}
                                                    >
                                                        <div className="font-mono text-sm text-primary-400">
                                                            {finding.ruleId}
                                                        </div>
                                                        <div className="text-sm text-white">
                                                            {finding.description}
                                                        </div>
                                                        <div>
                                                            {getLevelBadge(finding.level)}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(finding.status)}
                                                            {getStatusBadge(finding.status)}
                                                        </div>
                                                        <div className="flex items-center">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4 text-neutral-400" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 text-neutral-400" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-4 pb-4 pt-2 bg-white/5 space-y-3">
                                                                    <div>
                                                                        <div className="text-xs font-semibold text-neutral-400 uppercase mb-1">
                                                                            Details
                                                                        </div>
                                                                        <div className="text-sm text-neutral-300">
                                                                            {finding.details}
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <div className="text-xs font-semibold text-neutral-400 uppercase mb-1">
                                                                            Impact
                                                                        </div>
                                                                        <div className="text-sm text-neutral-300">
                                                                            {finding.impact}
                                                                        </div>
                                                                    </div>

                                                                    {finding.recommendation && (
                                                                        <div className="glass rounded-lg p-3 border border-primary-500/30">
                                                                            <div className="text-xs font-semibold text-primary-400 uppercase mb-1">
                                                                                Recommendation
                                                                            </div>
                                                                            <div className="text-sm text-white">
                                                                                {finding.recommendation}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredFindings.length === 0 && (
                        <div className="text-center py-12 text-neutral-400">
                            No findings match the selected filter
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
