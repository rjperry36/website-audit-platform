'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FindingsTable } from '@/components/search/findings-table'
import { mockGEOFindings } from '@/lib/mock-data/seo-findings'
import { staggerContainer } from '@/lib/animations'

export default function GEODetailPage() {
    const findings = mockGEOFindings

    const passedCount = findings.filter(f => f.status === 'pass').length
    const warningCount = findings.filter(f => f.status === 'warning').length
    const failedCount = findings.filter(f => f.status === 'fail').length

    const score = 82 // Mock score
    const trend = '+9.3%' // Mock trend

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
                            Generative Engine Optimization (GEO)
                        </h1>
                        <p className="text-neutral-400">
                            AI-ready content, citations, and E-E-A-T signals for LLMs
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-yellow-400">{score}</span>
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
                        <CardTitle>GEO Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-white mb-2">AI Crawler Access</h4>
                            <p className="text-sm text-neutral-400">
                                Ensure GPTBot, OAI-SearchBot, Claude-Web, and other AI crawlers are not blocked in robots.txt. Consider creating an llms.txt file for AI-specific guidance.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">Citation-Ready Content</h4>
                            <p className="text-sm text-neutral-400">
                                Write paragraphs of 30-150 words that can be easily extracted and cited by LLMs. Include statistics with proper context and sources.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">Author Credentials</h4>
                            <p className="text-sm text-neutral-400">
                                Provide detailed author bios with credentials and expertise areas. This builds E-E-A-T signals that AI systems use to assess content trustworthiness.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">Conversational Language</h4>
                            <p className="text-sm text-neutral-400">
                                Use natural, conversational language in headings and content. This helps AI match user queries more effectively when generating answers.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
