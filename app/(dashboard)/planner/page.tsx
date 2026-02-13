'use client'

import { motion } from 'framer-motion'
import { Timeline } from "@/components/planner/Timeline"
import { PlannerListView } from "@/components/planner/PlannerListView"
import { staggerContainer } from '@/lib/animations'

export default function PlannerPage() {
    return (
        <div className="container mx-auto px-4 py-8 content-layer">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Header Section */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold text-white">
                        Market Planner
                    </h2>
                    <p className="text-neutral-400 mb-6 max-w-2xl">
                        Visualise and plan marketing activities across local markets using the integrated timeline view.
                    </p>

                    {/* Main Content Area - Wrapped in Glass Card for consistency */}
                    <div className="glass rounded-xl border border-white/10 p-6 content-layer overflow-hidden">
                        <Timeline />
                    </div>

                    {/* List View Section */}
                    <div className="mt-12">
                        <PlannerListView />
                    </div>
                </section>
            </motion.div>
        </div>
    )
}
