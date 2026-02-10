'use client'

import { motion } from 'framer-motion'
import { ScoreCard } from '@/components/dashboard/score-card'
import { AuditCategoryCard } from '@/components/dashboard/audit-category-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { staggerContainer } from '@/lib/animations'
import {
    Activity,
    Search,
    Bot,
    Sparkles,
    TrendingUp,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'

// Mock data - will be replaced with real data from API
const mockData = {
    overall: {
        score: 96,
        previousScore: 89,
        findings: []
    },
    traditional: {
        score: 100,
        previousScore: 95,
        findings: [
            { ruleId: 'SEO-001', description: 'Title tag length', level: 'mandatory' as const, status: 'pass' as const, value: '48 chars' },
            { ruleId: 'SEO-002', description: 'Meta description', level: 'mandatory' as const, status: 'pass' as const, value: '141 chars' },
            { ruleId: 'SEO-003', description: 'Canonical URL', level: 'mandatory' as const, status: 'pass' as const, value: 'Set' },
        ]
    },
    aeo: {
        score: 100,
        previousScore: 88,
        findings: [
            { ruleId: 'AEO-001', description: 'Schema markup', level: 'mandatory' as const, status: 'pass' as const, value: 'Article, FAQPage' },
            { ruleId: 'AEO-002', description: 'FAQ structure', level: 'advisory' as const, status: 'pass' as const, value: 'Found' },
        ]
    },
    geo: {
        score: 82,
        previousScore: 75,
        findings: [
            { ruleId: 'GEO-001', description: 'AI crawler access', level: 'mandatory' as const, status: 'pass' as const, value: 'Allowed' },
            { ruleId: 'GEO-004', description: 'Statistics', level: 'advisory' as const, status: 'warning' as const, value: 'Few detected' },
            { ruleId: 'GEO-005', description: 'External citations', level: 'advisory' as const, status: 'warning' as const, value: '0 links' },
        ]
    }
}

export default function DashboardPage() {
    const isLoading = false // Will be controlled by data fetching

    return (
        <div className="min-h-screen">
            {/* Glass Header */}
            <header className="border-b border-white/10 glass sticky top-0 z-50 content-layer">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                SEO Audit Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-neutral-400">
                                Comprehensive analysis of your website's SEO, AEO, and GEO performance
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <select className="glass rounded-lg border border-white/20 px-4 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                                <option className="bg-slate-900">example.com</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 content-layer">
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        {/* Score Overview */}
                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-white">
                                Score Overview
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <ScoreCard
                                    title="Overall Score"
                                    score={mockData.overall.score}
                                    previousScore={mockData.overall.previousScore}
                                    icon={Activity}
                                    description="Combined SEO, AEO, and GEO"
                                    delay={0}
                                />
                                <ScoreCard
                                    title="Traditional SEO"
                                    score={mockData.traditional.score}
                                    previousScore={mockData.traditional.previousScore}
                                    icon={Search}
                                    description="Meta tags, headings, structure"
                                    delay={0.1}
                                />
                                <ScoreCard
                                    title="AEO Score"
                                    score={mockData.aeo.score}
                                    previousScore={mockData.aeo.previousScore}
                                    icon={Bot}
                                    description="Answer Engine Optimization"
                                    delay={0.2}
                                />
                                <ScoreCard
                                    title="GEO Score"
                                    score={mockData.geo.score}
                                    previousScore={mockData.geo.previousScore}
                                    icon={Sparkles}
                                    description="Generative Engine Optimization"
                                    delay={0.3}
                                />
                            </div>
                        </section>

                        {/* Audit Categories */}
                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-white">
                                Audit Categories
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <AuditCategoryCard
                                    title="Traditional SEO"
                                    description="Meta tags, headings, and URL structure"
                                    score={mockData.traditional.score}
                                    findings={mockData.traditional.findings}
                                    icon={Search}
                                    color="bg-primary-500"
                                    delay={0.1}
                                    onClick={() => console.log('View Traditional SEO details')}
                                />
                                <AuditCategoryCard
                                    title="Answer Engine Optimization"
                                    description="Schema markup, FAQ structure, and direct answers"
                                    score={mockData.aeo.score}
                                    findings={mockData.aeo.findings}
                                    icon={Bot}
                                    color="bg-purple-500"
                                    delay={0.2}
                                    onClick={() => console.log('View AEO details')}
                                />
                                <AuditCategoryCard
                                    title="Generative Engine Optimization"
                                    description="AI-ready content, citations, and E-E-A-T signals"
                                    score={mockData.geo.score}
                                    findings={mockData.geo.findings}
                                    icon={Sparkles}
                                    color="bg-pink-500"
                                    delay={0.3}
                                    onClick={() => console.log('View GEO details')}
                                />
                            </div>
                        </section>

                        {/* Quick Stats */}
                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-white">
                                Quick Stats
                            </h2>
                            <div className="grid gap-6 md:grid-cols-3">
                                <motion.div
                                    variants={staggerContainer}
                                    className="glass rounded-xl border border-white/10 p-6 content-layer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-green-500/20 p-2 border border-green-500/30">
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-400">Checks Passed</p>
                                            <p className="text-2xl font-bold text-white">25</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={staggerContainer}
                                    className="glass rounded-xl border border-white/10 p-6 content-layer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-yellow-500/20 p-2 border border-yellow-500/30">
                                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-400">Warnings</p>
                                            <p className="text-2xl font-bold text-white">4</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={staggerContainer}
                                    className="glass rounded-xl border border-white/10 p-6 content-layer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary-500/20 p-2 border border-primary-500/30">
                                            <TrendingUp className="h-5 w-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-400">Improvement</p>
                                            <p className="text-2xl font-bold text-white">+7%</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
