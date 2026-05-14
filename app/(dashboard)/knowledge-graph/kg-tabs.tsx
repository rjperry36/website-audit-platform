'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sparkles, Users, Megaphone, BarChart3 } from 'lucide-react';

const TABS = [
    { name: 'Brand', href: '/knowledge-graph/brand', icon: Sparkles },
    { name: 'Agency', href: '/knowledge-graph/agency', icon: Users },
    { name: 'Campaigns', href: '/knowledge-graph/campaigns', icon: Megaphone },
    { name: 'Insights', href: '/knowledge-graph/insights', icon: BarChart3 },
];

export function KgTabs() {
    const pathname = usePathname();
    return (
        <div className="mb-6 flex items-center gap-1 border-b border-white/10 overflow-x-auto">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname?.startsWith(tab.href);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                            isActive
                                ? 'border-primary-500 text-white'
                                : 'border-transparent text-neutral-400 hover:text-white hover:border-white/30',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
