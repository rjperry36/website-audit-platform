'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AuditCategoryCard } from '@/components/dashboard/audit-category-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { AuditEmptyState } from '@/components/ui/audit-empty-state'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import { TEST_SITE_CONFIG } from '@/lib/client-config'
import { Palette, ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function VisualAuditPage() {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/sites/${TEST_SITE_CONFIG.id}/latest-crawl`)
                if (!res.ok) throw new Error('Failed to fetch data')
                const report = await res.json()
                setData(report)
            } catch (error) {
                console.error('Error fetching UX data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <main className="container mx-auto px-4 py-8 content-layer">
                    <div className="space-y-6">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </main>
            </div>
        )
    }

    if (!data) return <AuditEmptyState />

    const findings = data.findings.ux.visualDesign || []

    // Calculate passing score
    const passed = findings.filter((f: any) => f.status === 'pass').length
    const score = findings.length > 0 ? Math.round((passed / findings.length) * 100) : 0

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 content-layer">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href="/ux">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Palette className="h-8 w-8 text-purple-500" />
                                Visual Design Audit
                            </h1>
                            <p className="text-neutral-400 mt-1">
                                AI-powered analysis of visual hierarchy, whitespace, and aesthetics
                            </p>
                        </div>
                        <div className="ml-auto">
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{score}/100</div>
                                <div className="text-sm text-neutral-400">Category Score</div>
                            </div>
                        </div>
                    </div>

                    {/* Findings List */}
                    <div className="grid gap-4">
                        {findings.map((finding: any, index: number) => (
                            <motion.div
                                key={finding.ruleId}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-white/10 bg-neutral-900/50 backdrop-blur-sm">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-medium text-white">
                                                {finding.description}
                                            </CardTitle>
                                            <CardDescription className="text-neutral-400">
                                                {finding.ruleId}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                finding.status === 'pass' ? 'success' :
                                                    finding.status === 'warning' ? 'warning' : 'destructive'
                                            }
                                            className="ml-auto"
                                        >
                                            {finding.status === 'pass' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                            {finding.status === 'warning' && <AlertTriangle className="mr-1 h-3 w-3" />}
                                            {finding.status === 'fail' && <XCircle className="mr-1 h-3 w-3" />}
                                            {finding.status.toUpperCase()}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="rounded-lg bg-neutral-950 p-4 border border-white/5">
                                                <p className="text-sm text-neutral-300">
                                                    {finding.details}
                                                </p>
                                            </div>

                                            {finding.status !== 'pass' && (
                                                <div className="flex gap-4 text-sm">
                                                    <div>
                                                        <span className="font-semibold text-neutral-400">Impact: </span>
                                                        <span className="text-neutral-300">{finding.impact}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {finding.recommendation && (
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                    <p className="text-sm text-blue-200">
                                                        <span className="font-semibold">Recommendation: </span>
                                                        {finding.recommendation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {findings.length === 0 && (
                            <div className="text-center py-12 text-neutral-500">
                                No visual audit findings available. Run a crawl to generate data.
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
