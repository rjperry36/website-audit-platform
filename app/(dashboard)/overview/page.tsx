'use client'

import { motion } from 'framer-motion'
import { CBBEPyramid } from '@/components/brand/cbbe-pyramid'
import { ScoreCard } from '@/components/dashboard/score-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { staggerContainer } from '@/lib/animations'
import {
    TrendingUp,
    Users,
    Heart,
    Star,
    Target,
    Zap,
    Search,
    Mail,
    Share2,
    ShoppingCart,
    Store
} from 'lucide-react'

// Mock data - will be replaced with real API data
const mockData = {
    brandEquityScore: 87,
    previousScore: 82,
    cbbeLevels: {
        resonance: 85,
        judgments: 88,
        feelings: 82,
        performance: 90,
        imagery: 86,
        salience: 92,
    },
    channelScores: {
        search: 96,
        ecrm: 0,
        social: 0,
        ecommerce: 0,
        pos: 0,
    },
    keyMetrics: {
        brandAwareness: 78,
        nps: 65,
        customerSatisfaction: 4.2,
        repeatPurchaseRate: 42,
    }
}

export default function OverviewPage() {
    return (
        <div className="container mx-auto px-4 py-8 content-layer">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Brand Equity Score */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold text-white">
                        Overall Brand Health
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <ScoreCard
                            title="Brand Equity"
                            score={mockData.brandEquityScore}
                            previousScore={mockData.previousScore}
                            icon={TrendingUp}
                            description="Keller's CBBE Framework"
                            delay={0}
                        />
                        <ScoreCard
                            title="Brand Awareness"
                            score={mockData.keyMetrics.brandAwareness}
                            icon={Users}
                            description="Unaided recall rate"
                            delay={0.1}
                        />
                        <ScoreCard
                            title="Net Promoter Score"
                            score={mockData.keyMetrics.nps}
                            icon={Heart}
                            description="Customer advocacy"
                            delay={0.2}
                        />
                        <ScoreCard
                            title="Repeat Purchase"
                            score={mockData.keyMetrics.repeatPurchaseRate}
                            icon={Target}
                            description="Customer loyalty rate"
                            delay={0.3}
                        />
                    </div>
                </section>

                {/* CBBE Pyramid */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            Customer-Based Brand Equity Pyramid
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">
                            Kevin Lane Keller's framework for building strong brands through deep customer relationships
                        </p>
                    </div>
                    <CBBEPyramid levels={mockData.cbbeLevels} />
                </section>

                {/* Channel Contribution */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold text-white">
                        Channel Performance
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card variant="elevated" className="relative overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary-500/20 p-2 border border-primary-500/30">
                                        <Search className="h-5 w-5 text-primary-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Search</CardTitle>
                                        <CardDescription>SEO, AEO, GEO</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-green-400">{mockData.channelScores.search}</span>
                                    <span className="text-sm text-neutral-500">/100</span>
                                </div>
                                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                        style={{ width: `${mockData.channelScores.search}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="elevated" className="relative overflow-hidden opacity-60">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-500/20 p-2 border border-purple-500/30">
                                        <Mail className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">eCRM</CardTitle>
                                        <CardDescription>Email Marketing</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-neutral-400">Coming Soon</div>
                            </CardContent>
                        </Card>

                        <Card variant="elevated" className="relative overflow-hidden opacity-60">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-pink-500/20 p-2 border border-pink-500/30">
                                        <Share2 className="h-5 w-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Social</CardTitle>
                                        <CardDescription>Social Media</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-neutral-400">Coming Soon</div>
                            </CardContent>
                        </Card>

                        <Card variant="elevated" className="relative overflow-hidden opacity-60">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-500/20 p-2 border border-blue-500/30">
                                        <ShoppingCart className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">eCommerce</CardTitle>
                                        <CardDescription>Online Stores</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-neutral-400">Coming Soon</div>
                            </CardContent>
                        </Card>

                        <Card variant="elevated" className="relative overflow-hidden opacity-60">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-500/20 p-2 border border-orange-500/30">
                                        <Store className="h-5 w-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Point of Sale</CardTitle>
                                        <CardDescription>In-Store</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-neutral-400">Coming Soon</div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Key Insights */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold text-white">
                        Strategic Insights
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card variant="elevated">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                    <CardTitle>Strengths</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400" />
                                    <p className="text-sm text-neutral-300">
                                        <span className="font-semibold text-white">High Salience:</span> Strong brand awareness (92/100) indicates excellent market presence
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400" />
                                    <p className="text-sm text-neutral-300">
                                        <span className="font-semibold text-white">Performance Excellence:</span> Functional benefits score (90/100) shows product quality
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400" />
                                    <p className="text-sm text-neutral-300">
                                        <span className="font-semibold text-white">Search Dominance:</span> SEO/AEO/GEO score (96/100) demonstrates digital excellence
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="elevated">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-red-400" />
                                    <CardTitle>Opportunities</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-400" />
                                    <p className="text-sm text-neutral-300">
                                        <span className="font-semibold text-white">Emotional Connection:</span> Feelings score (82/100) suggests room for deeper emotional bonds
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-400" />
                                    <p className="text-sm text-neutral-300">
                                        <span className="font-semibold text-white">Channel Expansion:</span> Activate eCRM, Social, and eCommerce monitoring for complete view
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-400" />
                                    <p className="text-sm text-neutral-300">
                                        <span className="font-semibold text-white">Resonance Building:</span> Focus on loyalty programs to increase resonance from 85 to 90+
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </motion.div>
        </div>
    )
}
