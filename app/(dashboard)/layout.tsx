import { TabNavigation } from '@/components/layout/tab-navigation'
import { TEST_SITE_CONFIG } from '@/lib/client-config'

import { supabase } from '@/lib/supabase'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Fetch active markets and channels for navigation
    const [{ data: markets }, { data: channels }] = await Promise.all([
        supabase.from('markets').select('*').eq('is_active', true).order('label'),
        supabase.from('channels').select('*').eq('is_active', true).order('label')
    ]);

    return (
        <div className="min-h-screen">
            {/* Glass Header */}
            <header className="border-b border-white/10 glass sticky top-0 z-50 content-layer">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Brand Health Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-neutral-400">
                                Multi-channel brand equity monitoring powered by Keller's CBBE framework
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="glass rounded-lg border border-white/20 px-4 py-2 text-sm text-white">
                                {TEST_SITE_CONFIG.name}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <TabNavigation markets={markets || []} channels={channels || []} />

            {/* Page Content */}
            <main className="content-layer">
                {children}
            </main>
        </div>
    )
}
