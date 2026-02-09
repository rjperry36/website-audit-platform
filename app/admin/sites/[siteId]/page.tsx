'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteConfig } from '@/lib/types';

export default function SiteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.siteId as string;

    const [site, setSite] = useState<SiteConfig | null>(null);
    const [crawls, setCrawls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [crawling, setCrawling] = useState(false);

    useEffect(() => {
        fetchSiteData();
    }, [siteId]);

    const fetchSiteData = async () => {
        try {
            const [siteResponse, crawlsResponse] = await Promise.all([
                fetch(`/api/sites/${siteId}`),
                fetch(`/api/sites/${siteId}/crawls`),
            ]);

            const siteData = await siteResponse.json();
            const crawlsData = await crawlsResponse.json();

            setSite(siteData.site);
            setCrawls(crawlsData.crawls);
        } catch (error) {
            console.error('Error fetching site data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCrawl = async () => {
        setCrawling(true);
        try {
            await fetch(`/api/sites/${siteId}/crawls`, { method: 'POST' });
            alert('Crawl triggered! (Note: Crawl engine not yet implemented)');
        } catch (error) {
            console.error('Error triggering crawl:', error);
            alert('Failed to trigger crawl');
        } finally {
            setCrawling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    if (!site) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">Site not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block"
                    >
                        ← Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                {site.name}
                            </h1>
                            <a
                                href={site.rootUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:underline"
                            >
                                {site.rootUrl}
                            </a>
                        </div>
                        <button
                            onClick={handleCrawl}
                            disabled={crawling}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {crawling ? 'Crawling...' : '🚀 Crawl Now'}
                        </button>
                    </div>
                </div>

                {/* Configuration */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Configuration
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Crawl Interval
                            </label>
                            <p className="text-lg text-slate-900 dark:text-white">
                                {site.crawlIntervalDays} days
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Max Pages
                            </label>
                            <p className="text-lg text-slate-900 dark:text-white">{site.maxPages}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Last Crawl
                            </label>
                            <p className="text-lg text-slate-900 dark:text-white">
                                {site.lastCrawlTimestamp
                                    ? new Date(site.lastCrawlTimestamp).toLocaleString()
                                    : 'Never'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Exclude Patterns
                            </label>
                            <p className="text-lg text-slate-900 dark:text-white">
                                {site.excludePatterns.length > 0
                                    ? site.excludePatterns.join(', ')
                                    : 'None'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Crawl History */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Crawl History
                    </h2>
                    {crawls.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <p className="text-slate-600 dark:text-slate-400">
                                No crawls yet. Click "Crawl Now" to start your first audit.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {crawls.map((crawl) => (
                                <div
                                    key={crawl.date}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary-600 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">
                                                {new Date(crawl.date).toLocaleDateString()}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {crawl.totalPages} pages crawled
                                            </p>
                                        </div>
                                        {crawl.summary && (
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary-600">
                                                    {crawl.summary.overallScore}%
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Overall Score
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
