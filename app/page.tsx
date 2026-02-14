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
                            Now with AI-Powered Market Planning
                        </div>

                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-primary-400">
                            Website Intelligence <br />
                            <span className="text-primary-500">&</span> Planning Suite
                        </h1>

                        <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            A comprehensive platform for auditing brand health, analyzing competitors, and planning market initiatives with AI assistance.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                            <Link href="/overview" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">📊</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Overview</h3>
                                    <p className="text-sm text-slate-400">Brand health metrics and high-level insights</p>
                                </div>
                            </Link>

                            <Link href="/planner" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">📅</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Market Planner</h3>
                                    <p className="text-sm text-slate-400">Strategic planning timeline with AI insights</p>
                                </div>
                            </Link>

                            <Link href="/search" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">🔍</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Search Audit</h3>
                                    <p className="text-sm text-slate-400">SEO analysis and visibility tracking</p>
                                </div>
                            </Link>

                            <Link href="/ux" className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">🎨</div>
                                    <h3 className="text-lg font-bold text-white mb-2">UX Analysis</h3>
                                    <p className="text-sm text-slate-400">Design quality and usability scoring</p>
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
                        <h2 className="text-3xl font-bold text-white mb-4">Complete Brand Intelligence</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Everything you need to monitor, analyze, and improve your brand's digital presence.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Performance Metrics</h3>
                            <p className="text-slate-400">Real-time tracking of Core Web Vitals, page speed scores, and loading capability across devices.</p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">AI Analysis</h3>
                            <p className="text-slate-400">Automated visual analysis using GPT-4o to score aesthetics, trust, and brand consistency.</p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Compliance Checks</h3>
                            <p className="text-slate-400">Automated validation against brand guidelines, accessibility standards (WCAG), and security best practices.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-300 py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-white mb-2">Website Audit Platform</p>
                        <p className="text-sm">Created with Google Antigravity</p>
                        <div className="mt-6 flex justify-center space-x-6">
                            <a
                                href="https://github.com/rjperry36/website-audit-platform"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                GitHub
                            </a>
                            <a
                                href="https://github.com/rjperry36/website-audit-platform/blob/main/SYSTEM_PROMPT.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
