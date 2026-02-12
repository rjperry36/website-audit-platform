'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/ui/skeleton'
import { staggerContainer, fadeIn } from '@/lib/animations'
import { TEST_SITE_CONFIG } from '@/lib/client-config'
import { ArrowLeft, Brain, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CialdiniAuditPage() {
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

    if (isLoading) return <SkeletonCard />
    if (!data) return null

    const findings = data.findings.ux.cialdini || []
    const passed = findings.filter((f: any) => f.status === 'pass').length
    const score = findings.length > 0 ? Math.round((passed / findings.length) * 100) : 0

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 content-layer">
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href="/ux">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Brain className="h-8 w-8 text-indigo-500" />
                                Cialdini's Persuasion Principles
                            </h1>
                            <p className="text-neutral-400 mt-2">
                                Evaluating the site's ability to influence and persuade users.
                            </p>
                        </div>
                    </div>

                    {/* Score Card */}
                    <motion.div variants={fadeIn} className="glass rounded-xl border border-white/10 p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Persuasion Score</h2>
                                <p className="text-sm text-neutral-400">Alignment with psychological principles</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-indigo-500">{score}/100</div>
                                <div className="text-sm text-neutral-400">{findings.length} principles analyzed</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Findings */}
                    <div className="grid gap-6">
                        {findings.map((finding: any, index: number) => (
                            <motion.div
                                key={index}
                                variants={fadeIn}
                                className={cn(
                                    "glass rounded-xl border p-6 transition-all duration-300 hover:border-opacity-50",
                                    finding.status === 'pass' ? "border-green-500/30" :
                                        finding.status === 'warning' ? "border-yellow-500/30" : "border-red-500/30"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 rounded-full p-2 ${finding.status === 'pass' ? 'bg-green-500/20 text-green-400' :
                                        finding.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {finding.status === 'pass' ? <CheckCircle className="h-5 w-5" /> :
                                            finding.status === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                                                <XCircle className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{finding.description}</h3>
                                                <p className="text-sm text-neutral-400 mt-1">{finding.details}</p>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "capitalize",
                                                finding.status === 'pass' ? "border-green-500 text-green-400" :
                                                    finding.status === 'warning' ? "border-yellow-500 text-yellow-400" :
                                                        "border-red-500 text-red-400"
                                            )}>
                                                {finding.status}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-white/5">
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Impact</span>
                                                <p className="text-sm text-neutral-300 flex items-start gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                                                    {finding.impact}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Recommendation</span>
                                                <p className="text-sm text-neutral-300 flex items-start gap-2">
                                                    <Info className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                                                    {finding.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
