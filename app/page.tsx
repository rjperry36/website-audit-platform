export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                    <div className="text-center">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">
                            Website Audit Platform
                        </h1>
                        <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                            Autonomous website auditing powered by Google Antigravity
                        </p>
                        <p className="text-lg text-primary-200 mb-12 max-w-2xl mx-auto">
                            Crawl websites, capture screenshots, and perform comprehensive SEO, accessibility, performance, and brand compliance audits
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://github.com/rjperry36/website-audit-platform"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                View on GitHub
                            </a>
                            <a
                                href="#features"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-primary-800 text-white hover:bg-primary-900 transition-all duration-200 border-2 border-primary-500 hover:border-primary-400"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">
                        Comprehensive Audit Capabilities
                    </h2>
                    <p className="text-xl text-center text-slate-600 dark:text-slate-300 mb-16 max-w-3xl mx-auto">
                        Multi-dimensional website analysis with automated crawling and intelligent reporting
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* SEO Feature */}
                        <div className="bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-primary-100 dark:border-slate-700">
                            <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">SEO & Meta Tags</h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    <span>Title & meta validation</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    <span>Heading hierarchy</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    <span>Open Graph tags</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    <span>Structured data</span>
                                </li>
                            </ul>
                        </div>

                        {/* Accessibility Feature */}
                        <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-emerald-100 dark:border-slate-700">
                            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Accessibility</h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                                <li className="flex items-start">
                                    <span className="text-emerald-600 mr-2">✓</span>
                                    <span>WCAG 2.1 AA compliance</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 mr-2">✓</span>
                                    <span>Color contrast ratios</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 mr-2">✓</span>
                                    <span>ARIA roles validation</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 mr-2">✓</span>
                                    <span>Keyboard navigation</span>
                                </li>
                            </ul>
                        </div>

                        {/* Performance Feature */}
                        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-amber-100 dark:border-slate-700">
                            <div className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Performance</h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                                <li className="flex items-start">
                                    <span className="text-amber-600 mr-2">✓</span>
                                    <span>Core Web Vitals</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-amber-600 mr-2">✓</span>
                                    <span>LCP, CLS, INP metrics</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-amber-600 mr-2">✓</span>
                                    <span>Image optimization</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-amber-600 mr-2">✓</span>
                                    <span>Resource analysis</span>
                                </li>
                            </ul>
                        </div>

                        {/* Brand Compliance Feature */}
                        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-purple-100 dark:border-slate-700">
                            <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Brand Compliance</h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">✓</span>
                                    <span>Custom guidelines</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">✓</span>
                                    <span>Visual comparison</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">✓</span>
                                    <span>Font & color validation</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">✓</span>
                                    <span>Layout consistency</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                                1
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Configure</h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                Set your root URL, crawl schedule, and brand guidelines. Upload reference images or define text-based specifications.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                                2
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Crawl & Audit</h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                Automated crawling discovers all pages, captures full-page screenshots (desktop & mobile), and runs comprehensive audits.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                                3
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Review & Fix</h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                View findings in the dashboard with side-by-side screenshots, detailed recommendations, and historical trend analysis.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">
                        Built With Modern Technologies
                    </h2>
                    <p className="text-xl text-center text-slate-600 dark:text-slate-300 mb-16">
                        Powered by Google Antigravity and industry-leading tools
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                            <div className="text-4xl mb-3">⚡</div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Next.js 14</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">React framework</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                            <div className="text-4xl mb-3">🎨</div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Tailwind CSS</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Utility-first styling</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                            <div className="text-4xl mb-3">🤖</div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Antigravity</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">AI-powered automation</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                            <div className="text-4xl mb-3">🎭</div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Playwright</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Browser automation</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-xl text-primary-100 mb-8">
                        View the complete system prompt and start building your own website audit platform
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://github.com/rjperry36/website-audit-platform/blob/main/SYSTEM_PROMPT.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Read System Prompt
                        </a>
                        <a
                            href="https://github.com/rjperry36/website-audit-platform"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-primary-700 text-white hover:bg-primary-600 transition-all duration-200 border-2 border-white"
                        >
                            Fork on GitHub
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
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
