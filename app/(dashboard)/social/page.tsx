'use client'

import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/animations'
import { Share2, TrendingUp, Heart, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function SocialPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Coming Soon Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500/20 border border-primary-500/30 mb-4">
                        <Share2 className="h-10 w-10 text-primary-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white">Social Media Analytics</h2>
                    <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                        Cross-platform social media brand monitoring and engagement tracking
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                        <TrendingUp className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">Coming Soon</span>
                    </div>
                </div>

                {/* Feature Preview */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
                    <Card variant="elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-pink-500/20 p-2 border border-pink-500/30">
                                    <Heart className="h-5 w-5 text-pink-400" />
                                </div>
                                <CardTitle className="text-lg">Engagement Tracking</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Monitor likes, shares, comments, and overall engagement across all platforms
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card variant="elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/20 p-2 border border-blue-500/30">
                                    <MessageCircle className="h-5 w-5 text-blue-400" />
                                </div>
                                <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                AI-powered sentiment tracking to understand brand perception in real-time
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card variant="elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/20 p-2 border border-purple-500/30">
                                    <Share2 className="h-5 w-5 text-purple-400" />
                                </div>
                                <CardTitle className="text-lg">Visual Consistency</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Ensure brand visual guidelines are maintained across all social posts
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Notify Me */}
                <div className="glass rounded-xl border border-white/10 p-8 text-center content-layer mt-12">
                    <h3 className="text-2xl font-bold text-white mb-2">Get Early Access</h3>
                    <p className="text-neutral-400 mb-6">
                        Be the first to know when Social Media analytics launches
                    </p>
                    <button className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors">
                        Notify Me
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
