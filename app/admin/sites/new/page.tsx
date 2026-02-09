'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClientConfigManager } from '@/lib/client-config';
import { SiteConfig } from '@/lib/types';

export default function NewSitePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        rootUrl: '',
        crawlIntervalDays: 7,
        maxPages: 100,
        excludePatterns: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newSite: SiteConfig = {
                id: ClientConfigManager.generateSiteId(),
                name: formData.name,
                rootUrl: formData.rootUrl,
                crawlIntervalDays: formData.crawlIntervalDays,
                lastCrawlTimestamp: null,
                maxPages: formData.maxPages,
                excludePatterns: formData.excludePatterns
                    .split('\n')
                    .map((p) => p.trim())
                    .filter((p) => p),
                guidelines: {
                    global: {
                        referenceImages: [],
                        specs: {},
                        rules: [],
                    },
                    pageTypes: {},
                },
            };

            ClientConfigManager.addSite(newSite);
            router.push('/admin');
        } catch (error) {
            console.error('Error creating site:', error);
            alert('Failed to create site: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Add New Site
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Configure a new website for auditing
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    {/* Site Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Site Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            placeholder="My Website"
                        />
                    </div>

                    {/* Root URL */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Root URL *
                        </label>
                        <input
                            type="url"
                            required
                            value={formData.rootUrl}
                            onChange={(e) => setFormData({ ...formData, rootUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* Crawl Interval */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Crawl Interval (days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.crawlIntervalDays}
                            onChange={(e) =>
                                setFormData({ ...formData, crawlIntervalDays: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            How many days between automatic crawls
                        </p>
                    </div>

                    {/* Max Pages */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Maximum Pages
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.maxPages}
                            onChange={(e) =>
                                setFormData({ ...formData, maxPages: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Maximum number of pages to crawl per run
                        </p>
                    </div>

                    {/* Exclude Patterns */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Exclude Patterns (optional)
                        </label>
                        <textarea
                            value={formData.excludePatterns}
                            onChange={(e) => setFormData({ ...formData, excludePatterns: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent font-mono text-sm"
                            placeholder="/admin/*&#10;/api/*&#10;*.pdf"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            One pattern per line. Use wildcards like /admin/* or *.pdf
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Site'}
                        </button>
                        <Link
                            href="/admin"
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
