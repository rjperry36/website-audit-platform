'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CBBELevel {
    name: string
    score: number
    color: string
    description: string
    metrics: string
    question: string
}

interface CBBEPyramidProps {
    levels: {
        resonance: number
        judgments: number
        feelings: number
        performance: number
        imagery: number
        salience: number
    }
}

export function CBBEPyramid({ levels }: CBBEPyramidProps) {
    const [hoveredLevel, setHoveredLevel] = useState<string | null>(null)

    const pyramidLevels: CBBELevel[] = [
        {
            name: 'Resonance',
            score: levels.resonance,
            color: 'from-purple-500 to-pink-500',
            description: 'Loyalty & Advocacy',
            metrics: 'NPS, Retention Rate, Active Community Engagement',
            question: 'How much do customers identify with the brand?'
        },
        {
            name: 'Judgments',
            score: levels.judgments,
            color: 'from-blue-500 to-cyan-500',
            description: 'Quality & Credibility',
            metrics: 'Perceived Quality, Expert Reviews, Trust Score',
            question: 'What do customers think about the brand\'s quality?'
        },
        {
            name: 'Feelings',
            score: levels.feelings,
            color: 'from-green-500 to-emerald-500',
            description: 'Emotional Connection',
            metrics: 'Sentiment Analysis, Brand Love, Social Mentions',
            question: 'How does the brand make customers feel?'
        },
        {
            name: 'Performance',
            score: levels.performance,
            color: 'from-yellow-500 to-orange-500',
            description: 'Functional Benefits',
            metrics: 'Product Ratings, Feature Usage, Reliability Stats',
            question: 'How well does the product meet customer needs?'
        },
        {
            name: 'Imagery',
            score: levels.imagery,
            color: 'from-indigo-500 to-purple-500',
            description: 'Brand Personality',
            metrics: 'Brand Personality Traits, Visual Consistency Score',
            question: 'What image comes to mind when thinking of the brand?'
        },
        {
            name: 'Salience',
            score: levels.salience,
            color: 'from-primary-500 to-blue-500',
            description: 'Brand Awareness',
            metrics: 'Unaided Recall, Search Volume, Share of Voice',
            question: 'How easily is the brand recalled?'
        },
    ]

    return (
        <div className="relative w-full max-w-4xl mx-auto flex gap-8 items-start">
            {/* Tooltip Area (Left Side) */}
            <div className="w-64 hidden lg:block relative min-h-[300px]">
                <AnimatePresence mode="wait">
                    {hoveredLevel ? (
                        <motion.div
                            key={hoveredLevel}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-1/3 right-0 w-full bg-neutral-900/90 border border-white/10 p-4 rounded-xl backdrop-blur-md z-10"
                        >
                            {(() => {
                                const level = pyramidLevels.find(l => l.name === hoveredLevel)
                                if (!level) return null
                                return (
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className={cn("font-bold text-lg bg-gradient-to-r bg-clip-text text-transparent", level.color)}>
                                                {level.name}
                                            </h4>
                                            <p className="text-sm text-neutral-300 italic">"{level.question}"</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase font-semibold tracking-wider mb-1">How we measure it</p>
                                            <p className="text-sm text-white">{level.metrics}</p>
                                        </div>
                                    </div>
                                )
                            })()}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-1/3 right-0 w-full text-right pr-4"
                        >
                            <p className="text-sm text-neutral-500 italic">
                                Hover over the pyramid levels to see measurement details.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pyramid Structure */}
            <div className="flex-1 space-y-2">
                {pyramidLevels.map((level, index) => {
                    const width = 100 - (index * 12) // Decreasing width for pyramid shape
                    const marginX = (100 - width) / 2 // Center alignment

                    return (
                        <motion.div
                            key={level.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                            style={{
                                width: `${width}%`,
                                marginLeft: `${marginX}%`,
                                marginRight: `${marginX}%`,
                            }}
                            onMouseEnter={() => setHoveredLevel(level.name)}
                            onMouseLeave={() => setHoveredLevel(null)}
                        >
                            {/* Level Container */}
                            <div className="glass rounded-lg border border-white/20 p-4 hover:border-white/40 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                                {/* Background Gradient */}
                                <div className={cn(
                                    "absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity duration-300",
                                    `bg-gradient-to-r ${level.color}`
                                )} />

                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                    <motion.div
                                        className={cn("h-full bg-gradient-to-r", level.color)}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${level.score}%` }}
                                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="relative flex items-center justify-between z-10">
                                    <div>
                                        <h3 className="text-lg font-bold text-white drop-shadow-sm">{level.name}</h3>
                                        <p className="text-xs text-neutral-300 drop-shadow-sm">{level.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent filter drop-shadow-sm",
                                            level.color
                                        )}>
                                            {level.score}
                                        </div>
                                        <div className="text-xs text-neutral-400">/100</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}

                {/* Pyramid Labels (Footer) */}
                {/* <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-neutral-400">...</div> 
                    Removing this footer as requested to keep UI clean with side summary
                 */}
            </div>
        </div>
    )
}
