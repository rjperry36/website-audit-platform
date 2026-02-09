'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteConfig } from '@/lib/types';

export default function AdminPage() {
    const [sites, setSites] = useState<SiteConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const response = await fetch('/api/sites');
            const data = await response.json();
            setSites(data.sites);
        } catch (error) {
            console.error('Error fetching sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (siteId: string) => {
        if (!confirm('Are you sure you want to delete this site?')) return;

        try {
            await fetch(`/api/sites/${siteId}`, { method: 'DELETE' });
            fetchSites();
        } catch (error) {
            console.error('Error deleting site:', error);
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                            Website Audit Platform
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300">
                            Manage your website audits and configurations
                        </p>
                    </div>
                    <Link
                        href="/admin/sites/new"
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                        + Add New Site
                    </Link>
                </div>

                {/* Sites Grid */}
                {sites.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🌐</div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            No Sites Configured
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Get started by adding your first website to audit
                        </p>
                        <Link
                            href="/admin/sites/new"
                            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                        >
                            Add Your First Site
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sites.map((site) => (
                            <div
                                key={site.id}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                            {site.name}
                                        </h3>
                                        <a
                                            href={site.rootUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-600 hover:underline"
                                        >
                                            {site.rootUrl}
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Crawl Interval:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {site.crawlIntervalDays} days
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Max Pages:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {site.maxPages}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Last Crawl:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {site.lastCrawlTimestamp
                                                ? new Date(site.lastCrawlTimestamp).toLocaleDateString()
                                                : 'Never'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/sites/${site.id}`}
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center font-semibold"
                                    >
                                        Manage
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(site.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
