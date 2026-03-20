import { Suspense } from 'react';
import { motion } from 'framer-motion'
import { CBBEPyramid } from '@/components/brand/cbbe-pyramid'
import { ScoreCard } from '@/components/dashboard/score-card'
import { CrawlHistory } from '@/components/dashboard/crawl-history'
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
    Store,
    AlertTriangle
} from 'lucide-react'
import { getCrawlHistory, getCrawlReport } from '@/app/actions/audit'
import { TEST_SITE_CONFIG } from '@/lib/client-config'

// Fallback for missing data
const EMPTY_METRICS = {
    brandEquityScore: 0,
    previousScore: 0,
    cbbeLevels: {
        resonance: 0,
        judgments: 0,
        feelings: 0,
        performance: 0,
        imagery: 0,
        salience: 0,
    },
    channelScores: {
        search: 0,
        ecrm: 0,
        social: 0,
        ecommerce: 0,
        pos: 0,
    },
    keyMetrics: {
        brandAwareness: 0,
        nps: 0,
        customerSatisfaction: 0,
        repeatPurchaseRate: 0,
    }
};

export default async function OverviewPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const siteId = TEST_SITE_CONFIG.id;
    const dates = await getCrawlHistory(siteId);

    // Determine active date
    const selectedDate = typeof searchParams?.date === 'string' ? searchParams.date : undefined;
    const activeDate = selectedDate || dates[0];

    // Fetch report if we have a date
    const report = activeDate ? await getCrawlReport(siteId, activeDate) : null;

    // Transform report data for UI, or use empty state
    // Note: In a real implementation, we'd map specific findings to CBBE levels.
    // For now, we'll map the available category scores to relevant sections.
    const data = report ? {
        brandEquityScore: report.scores.overall,
        previousScore: 0, // Todo: fetch previous report
        cbbeLevels: {
            // Mapping available scores to CBBE levels for visualization
            resonance: report.scores.ux, // UX drives loyalty/resonance
            judgments: report.scores.geo, // Content quality drives judgments
            feelings: report.scores.ux, // Design drives feelings
            performance: report.scores.aeo, // Functionality/Speed
            imagery: report.scores.visual || 0, // Visual design
            salience: report.scores.seo, // SEO drives awareness/salience
        },
        channelScores: {
            search: report.scores.seo,
            ecrm: 0,
            social: 0,
            ecommerce: 0,
            pos: 0,
        },
        keyMetrics: {
            // These would typically come from other data sources (analytics, surveys)
            // Using proxies from audit data for now
            brandAwareness: report.scores.seo, // SEO proxy for awareness
            nps: 0,
            customerSatisfaction: report.scores.ux / 20, // 5-star scale proxy
            repeatPurchaseRate: 0,
        }
    } : EMPTY_METRICS;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {!report && (
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-200 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5" />
                            <div>
                                <p className="font-medium">No audit data found</p>
                                <p className="text-sm opacity-80">Please run a crawl to generate data for this dashboard.</p>
                            </div>
                        </div>
                    )}

                    {/* Brand Equity Score */}
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-white">
                            Overall Brand Health <span className="text-neutral-500 text-sm font-normal ml-2">({activeDate})</span>
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <ScoreCard
                                title="Brand Equity"
                                score={data.brandEquityScore}
                                previousScore={data.previousScore}
                                icon={<TrendingUp className="h-4 w-4 text-gray-400" />}
                                description="Keller's CBBE Framework"
                                delay={0}
                            />
                            <ScoreCard
                                title="Brand Awareness"
                                score={data.keyMetrics.brandAwareness}
                                icon={<Users className="h-4 w-4 text-gray-400" />}
                                description="Unaided recall rate"
                                delay={0.1}
                            />
                            <ScoreCard
                                title="Net Promoter Score"
                                score={data.keyMetrics.nps}
                                icon={<Heart className="h-4 w-4 text-gray-400" />}
                                description="Customer advocacy"
                                delay={0.2}
                            />
                            <ScoreCard
                                title="Repeat Purchase"
                                score={data.keyMetrics.repeatPurchaseRate}
                                icon={<Target className="h-4 w-4 text-gray-400" />}
                                description="Customer loyalty rate"
                                delay={0.3}
                            />
                        </div>
                    </section>

                    {/* CBBE Pyramid */}
                    <section>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                Customer-Based Brand Equity (CBBE)
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Description */}
                            <div className="md:col-span-4 space-y-6">
                                <div className="glass rounded-xl border border-white/10 p-6 content-layer">
                                    <h3 className="text-lg font-semibold text-white mb-3">About the Framework</h3>
                                    <p className="text-neutral-300 leading-relaxed mb-4">
                                        The <strong>Customer-Based Brand Equity (CBBE)</strong> model, developed by Kevin Lane Keller, maps the journey of building a strong brand.
                                    </p>
                                    <p className="text-neutral-300 leading-relaxed">
                                        It visualizes the four steps of brand building: establishing identity (Salience), creating meaning (Performance & Imagery), eliciting positive responses (Judgments & Feelings), and ultimately achieving deep relationships (Resonance).
                                    </p>
                                </div>

                                <div className="glass rounded-xl border border-white/10 p-6 content-layer">
                                    <h3 className="text-lg font-semibold text-white mb-3">Key Stages</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                                            <div>
                                                <span className="text-white font-medium block">4. Relationships</span>
                                                <span className="text-sm text-neutral-400">Resonance: intense, active loyalty.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            <div>
                                                <span className="text-white font-medium block">3. Response</span>
                                                <span className="text-sm text-neutral-400">Judgments & Feelings: reactions to the brand.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
                                            <div>
                                                <span className="text-white font-medium block">2. Meaning</span>
                                                <span className="text-sm text-neutral-400">Performance & Imagery: what the brand is.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                                            <div>
                                                <span className="text-white font-medium block">1. Identity</span>
                                                <span className="text-sm text-neutral-400">Salience: category identification.</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column: Pyramid */}
                            <div className="md:col-span-8">
                                <CBBEPyramid levels={data.cbbeLevels} />
                            </div>
                        </div>
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
                                        <span className="text-3xl font-bold text-green-400">{data.channelScores.search}</span>
                                        <span className="text-sm text-neutral-500">/100</span>
                                    </div>
                                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                            style={{ width: `${data.channelScores.search}%` }}
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
                </div>

                {/* Sidebar: Crawl History */}
                <div className="lg:col-span-1">
                    <Suspense fallback={<div>Loading history...</div>}>
                        <CrawlHistory dates={dates} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
