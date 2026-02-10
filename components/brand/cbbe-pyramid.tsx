'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CBBELevel {
    name: string
    score: number
    color: string
    description: string
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
    const pyramidLevels: CBBELevel[] = [
        {
            name: 'Resonance',
            score: levels.resonance,
            color: 'from-purple-500 to-pink-500',
            description: 'Loyalty & Advocacy'
        },
        {
            name: 'Judgments',
            score: levels.judgments,
            color: 'from-blue-500 to-cyan-500',
            description: 'Quality & Credibility'
        },
        {
            name: 'Feelings',
            score: levels.feelings,
            color: 'from-green-500 to-emerald-500',
            description: 'Emotional Connection'
        },
        {
            name: 'Performance',
            score: levels.performance,
            color: 'from-yellow-500 to-orange-500',
            description: 'Functional Benefits'
        },
        {
            name: 'Imagery',
            score: levels.imagery,
            color: 'from-indigo-500 to-purple-500',
            description: 'Brand Personality'
        },
        {
            name: 'Salience',
            score: levels.salience,
            color: 'from-primary-500 to-blue-500',
            description: 'Brand Awareness'
        },
    ]

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Pyramid Structure */}
            <div className="space-y-2">
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
                        >
                            {/* Level Container */}
                            <div className="glass rounded-lg border border-white/20 p-4 hover:border-white/40 transition-all duration-300 cursor-pointer group">
                                {/* Background Gradient */}
                                <div className={cn(
                                    "absolute inset-0 rounded-lg opacity-10 group-hover:opacity-20 transition-opacity",
                                    `bg-gradient-to-r ${level.color}`
                                )} />

                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-lg overflow-hidden">
                                    <motion.div
                                        className={cn("h-full bg-gradient-to-r", level.color)}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${level.score}%` }}
                                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="relative flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{level.name}</h3>
                                        <p className="text-xs text-neutral-400">{level.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                                            level.color
                                        )}>
                                            {level.score}
                                        </div>
                                        <div className="text-xs text-neutral-500">/100</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Pyramid Labels */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-neutral-400">
                <div>
                    <div className="font-semibold text-white mb-1">Resonance</div>
                    <div>Intense, active loyalty</div>
                </div>
                <div>
                    <div className="font-semibold text-white mb-1">Judgments</div>
                    <div>Quality & credibility</div>
                </div>
                <div>
                    <div className="font-semibold text-white mb-1">Feelings</div>
                    <div>Emotional reactions</div>
                </div>
                <div>
                    <div className="font-semibold text-white mb-1">Performance</div>
                    <div>Functional benefits</div>
                </div>
                <div>
                    <div className="font-semibold text-white mb-1">Imagery</div>
                    <div>Brand personality</div>
                </div>
                <div>
                    <div className="font-semibold text-white mb-1">Salience</div>
                    <div>Brand awareness</div>
                </div>
            </div>
        </div>
    )
}
