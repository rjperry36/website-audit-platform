'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FindingsTable } from '@/components/search/findings-table'
import { mockAEOFindings } from '@/lib/mock-data/seo-findings'
import { staggerContainer } from '@/lib/animations'

export default function AEODetailPage() {
    const findings = mockAEOFindings

    const passedCount = findings.filter(f => f.status === 'pass').length
    const warningCount = findings.filter(f => f.status === 'warning').length
    const failedCount = findings.filter(f => f.status === 'fail').length

    const score = 100 // Mock score
    const trend = '+13.6%' // Mock trend

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Back Button */}
                <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Search Dashboard</span>
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Answer Engine Optimization (AEO)
                        </h1>
                        <p className="text-neutral-400">
                            Schema markup, FAQ structure, and direct answer optimization
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-green-400">{score}</span>
                            <span className="text-xl text-neutral-400">/100</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-sm mt-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{trend}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-500/20 p-2 border border-green-500/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                </div>
                                <CardTitle className="text-lg">Passed</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">{passedCount}</div>
                            <p className="text-sm text-neutral-400 mt-1">
                                Checks passed successfully
                            </p>
                        </CardContent>
                    </Card>

                    <Card variant="elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-yellow-500/20 p-2 border border-yellow-500/30">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <CardTitle className="text-lg">Warnings</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
                            <p className="text-sm text-neutral-400 mt-1">
                                Issues requiring attention
                            </p>
                        </CardContent>
                    </Card>

                    <Card variant="elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-500/20 p-2 border border-red-500/30">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <CardTitle className="text-lg">Failed</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-400">{failedCount}</div>
                            <p className="text-sm text-neutral-400 mt-1">
                                Critical issues found
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Findings Table */}
                <FindingsTable
                    findings={findings}
                    title="Detailed Findings"
                />

                {/* Best Practices */}
                <Card>
                    <CardHeader>
                        <CardTitle>AEO Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-white mb-2">Schema Markup</h4>
                            <p className="text-sm text-neutral-400">
                                Implement JSON-LD schema for Article, FAQPage, HowTo, or other relevant types. Multiple schema types provide richer context for AI systems.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">FAQ Structure</h4>
                            <p className="text-sm text-neutral-400">
                                Use question-based headings and FAQPage schema to optimize for featured snippets and AI answer extraction.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">Direct Answers</h4>
                            <p className="text-sm text-neutral-400">
                                Start sections with concise 40-60 word answers that directly address the topic before expanding with details.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">E-E-A-T Signals</h4>
                            <p className="text-sm text-neutral-400">
                                Include author bylines, credentials, and expertise indicators to build trust with AI answer engines like ChatGPT and Perplexity.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
