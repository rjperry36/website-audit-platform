import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white min-h-[90vh] flex items-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            Now with KG-grounded briefing assistant
                        </div>

                        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-primary-400">
                            Thoth
                        </h1>

                        <p className="text-xl sm:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed font-medium">
                            The agency operating system for global brand work. One graph, many agents, every market.
                        </p>
                        <p className="text-base sm:text-lg text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Your clients' brands, your agency's people and capacity, and the campaigns, budgets and approvals that connect them — modelled as a single knowledge graph and reasoned over by specialist AI agents that brief, plan, staff, audit and optimise across every market and channel.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                            <Link href="/overview" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">📊</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Overview</h3>
                                    <p className="text-sm text-slate-400">Brand health metrics and high-level insights</p>
                                </div>
                            </Link>

                            <Link href="/knowledge-graph" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">🕸️</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Knowledge Graph</h3>
                                    <p className="text-sm text-slate-400">Brand, agency, campaigns and people, all connected</p>
                                </div>
                            </Link>

                            <Link href="/planner/UK" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">📅</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Market Planner</h3>
                                    <p className="text-sm text-slate-400">12-month timelines per market with AI insights</p>
                                </div>
                            </Link>

                            <Link href="/search" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">🔍</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Search Audit</h3>
                                    <p className="text-sm text-slate-400">SEO, AEO and GEO visibility tracking</p>
                                </div>
                            </Link>

                            <Link href="/ux" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">🎨</div>
                                    <h3 className="text-lg font-bold text-white mb-2">UX Analysis</h3>
                                    <p className="text-sm text-slate-400">Design quality, accessibility and usability scoring</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">One graph. Many agents. Every market.</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Thoth models the world of a brand — its identity, agency, campaigns and outcomes — then lets specialist AI agents reason over it to plan, brief, audit and optimise.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Brand Knowledge Graph</h3>
                            <p className="text-slate-400">A connected model of brand identity, agency capacity, contracts, campaigns, executions and approvals — the source of truth your agents reason over.</p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">KG-Grounded Agents</h3>
                            <p className="text-slate-400">Briefing assistant, capacity planner and SME agents grounded in the graph — recommendations that reference real people, budgets, skills and prior work.</p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Audits & Compliance</h3>
                            <p className="text-slate-400">Continuous SEO, AEO, GEO, UX, security and visual audits — scored against brand guidelines, WCAG and your own AI-defined rules.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-300 py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-white mb-2">Thoth</p>
                        <p className="text-sm">The agency operating system for global brand work. One graph, many agents, every market.</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
