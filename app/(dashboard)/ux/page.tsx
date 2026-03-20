'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ScoreCard } from '@/components/dashboard/score-card'
import { AuditCategoryCard } from '@/components/dashboard/audit-category-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { staggerContainer } from '@/lib/animations'
import { TEST_SITE_CONFIG } from '@/lib/client-config'
import {
    Smartphone,
    Accessibility,
    Eye,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Palette,
    Heart,
    Users,
    Brain
} from 'lucide-react'

export default function UXDashboardPage() {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch latest crawl data
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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </main>
            </div>
        )
    }

    if (!data) return null

    const uxScore = data.scores.ux
    const accessibilityFindings = data.findings.ux.accessibility
    const mobileFindings = data.findings.ux.mobile
    const visualFindings = data.findings.ux.visualDesign || []
    const experienceFindings = data.findings.ux.userExperience || []
    const personaFindings = data.findings.ux.personas || []
    const cialdiniFindings = data.findings.ux.cialdini || []

    // Calculate sub-scores based on passing checks (simplified logic for UI)
    const calcScore = (findings: any[]) => {
        if (!findings || findings.length === 0) return 0
        const passed = findings.filter((f: any) => f.status === 'pass').length
        return Math.round((passed / findings.length) * 100)
    }

    const accessibilityScore = calcScore(accessibilityFindings)
    const mobileScore = calcScore(mobileFindings)
    const visualScore = calcScore(visualFindings)
    const experienceScore = calcScore(experienceFindings)
    const personaScore = calcScore(personaFindings)
    const cialdiniScore = calcScore(cialdiniFindings)

    // Calculate stats
    const allFindings = [...accessibilityFindings, ...mobileFindings, ...visualFindings, ...experienceFindings]
    const passedChecks = allFindings.filter((f: any) => f.status === 'pass').length
    const warnings = allFindings.filter((f: any) => f.status === 'warning').length
    const failures = allFindings.filter((f: any) => f.status === 'fail').length

    // Construct screenshot URLs securely
    const getScreenshotUrl = (path: string) => {
        if (!path) return ''
        return `/api/screenshots?path=${encodeURIComponent(path)}`
    }

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 content-layer">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Executive Summary */}
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-white">
                            Executive Summary
                            <span className="ml-2 text-sm font-normal text-neutral-500">
                                ({new Date(data.crawlDate).toLocaleDateString()})
                            </span>
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <ScoreCard
                                title="Overall UX Score"
                                score={uxScore}
                                previousScore={data.previousScores?.ux || 0}
                                icon={Eye}
                                description="Combined accessibility and mobile usability"
                                delay={0}
                            />

                            <motion.div
                                variants={staggerContainer}
                                className="glass rounded-xl border border-white/10 p-6 content-layer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-500/20 p-2 border border-green-500/30">
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-400">checks Passed</p>
                                        <p className="text-2xl font-bold text-white">{passedChecks}</p>
                                        <p className="text-xs text-neutral-500 mt-1">out of {passedChecks + warnings + failures} total checks</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={staggerContainer}
                                className="glass rounded-xl border border-white/10 p-6 content-layer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-red-500/20 p-2 border border-red-500/30">
                                        <XCircle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-400">Critical Issues</p>
                                        <p className="text-2xl font-bold text-white">{failures}</p>
                                        <p className="text-xs text-neutral-500 mt-1">{warnings} warnings found</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Screenshot Comparison */}
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-white">
                            Visual Comparison
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Desktop Screenshot */}
                            <motion.div
                                variants={staggerContainer}
                                className="glass rounded-xl border border-white/10 p-6 content-layer"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">Desktop View</h3>
                                    <span className="text-sm text-neutral-400">1920×1080</span>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900">
                                    <div className="relative aspect-video w-full">
                                        {data.screenshots?.desktop ? (
                                            <img
                                                src={getScreenshotUrl(data.screenshots.desktop)}
                                                alt="Desktop Screenshot"
                                                className="h-full w-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                                                <p className="text-sm">No screenshot available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Mobile Screenshot */}
                            <motion.div
                                variants={staggerContainer}
                                className="glass rounded-xl border border-white/10 p-6 content-layer"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">Mobile View</h3>
                                    <span className="text-sm text-neutral-400">390×844</span>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900">
                                    <div className="relative aspect-[9/16] max-h-96 mx-auto">
                                        {data.screenshots?.mobile ? (
                                            <img
                                                src={getScreenshotUrl(data.screenshots.mobile)}
                                                alt="Mobile Screenshot"
                                                className="h-full w-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                                                <p className="text-sm">No screenshot available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Audit Categories */}
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-white">
                            UX Audit Categories
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Link href="/ux/accessibility">
                                <AuditCategoryCard
                                    title="Accessibility"
                                    description="WCAG compliance, ARIA landmarks, and screen reader support"
                                    score={accessibilityScore}
                                    findings={accessibilityFindings}
                                    icon={Accessibility}
                                    color="bg-blue-500"
                                    delay={0.1}
                                    onClick={() => { }}
                                />
                            </Link>
                            <Link href="/ux/mobile">
                                <AuditCategoryCard
                                    title="Mobile Usability"
                                    description="Touch targets, viewport settings, and responsive design"
                                    score={mobileScore}
                                    findings={mobileFindings}
                                    icon={Smartphone}
                                    color="bg-green-500"
                                    delay={0.2}
                                    onClick={() => { }}
                                />
                            </Link>
                            <Link href="/ux/visual">
                                <AuditCategoryCard
                                    title="Visual Design"
                                    description="Visual hierarchy, whitespace, typography, and color consistency"
                                    score={visualScore}
                                    findings={visualFindings}
                                    icon={Palette}
                                    color="bg-purple-500"
                                    delay={0.3}
                                    onClick={() => { }}
                                />
                            </Link>
                            <Link href="/ux/experience">
                                <AuditCategoryCard
                                    title="User Experience"
                                    description="Core UX principles, trust indicators, and user flow optimization"
                                    score={experienceScore}
                                    findings={experienceFindings}
                                    icon={Heart}
                                    color="bg-pink-500"
                                    delay={0.4}
                                    onClick={() => { }}
                                />
                            </Link>
                            <Link href="/ux/personas">
                                <AuditCategoryCard
                                    title="User Personas"
                                    description="Analysis from the perspective of The Learner, The Consultant, etc."
                                    score={personaScore}
                                    findings={personaFindings}
                                    icon={Users}
                                    color="bg-orange-500"
                                    delay={0.5}
                                    onClick={() => { }}
                                />
                            </Link>
                            <Link href="/ux/cialdini">
                                <AuditCategoryCard
                                    title="Persuasion Principles"
                                    description="Reciprocity, Social Proof, Authority, and other Cialdini principles"
                                    score={cialdiniScore}
                                    findings={cialdiniFindings}
                                    icon={Brain}
                                    color="bg-indigo-500"
                                    delay={0.6}
                                    onClick={() => { }}
                                />
                            </Link>
                        </div>
                    </section>


                </motion.div>
            </main>
        </div>
    )
}
