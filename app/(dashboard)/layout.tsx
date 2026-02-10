import { TabNavigation } from '@/components/layout/tab-navigation'

export default function DashboardLayout({
    children,
}: {
    children: React.Node
}) {
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
                            <select className="glass rounded-lg border border-white/20 px-4 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                                <option className="bg-slate-900">example.com</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <TabNavigation />

            {/* Page Content */}
            <main className="content-layer">
                {children}
            </main>
        </div>
    )
}
