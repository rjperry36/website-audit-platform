'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Calendar,
    ChevronDown,
    Layers,
    PlusCircle,
    Globe
} from 'lucide-react'

// Map Channel IDs to Routes (Best Effort / Placeholder)
const getChannelRoute = (channelId: string) => {
    switch (channelId) {
        case 'SEO': return '/search/seo';
        case 'PAID_MEDIA': return '/search'; // Placeholder
        case 'SOCIAL_MEDIA': return '/social';
        case 'ECRM': return '/ecrm';
        case 'D2C': return '/ecommerce';
        case 'B2B': return '/overview'; // Placeholder
        case 'POSM': return '/pos';
        case 'UX': return '/ux';
        default: return '/overview'; // Safety fallback
    }
};

// ... imports

interface Market {
    id: string;
    label: string;
    flag_icon: string;
}

interface TabChild {
    name: string;
    href: string;
    color?: string;
    icon?: string;
    comingSoon?: boolean;
}

interface Tab {
    name: string;
    href: string;
    icon: React.ElementType;
    isDropdown?: boolean;
    children?: TabChild[];
}

interface Channel {
    id: string;
    label: string;
    color: string;
}

interface TabNavigationProps {
    markets?: Market[];
    channels?: Channel[];
}

export function TabNavigation({ markets = [], channels = [] }: TabNavigationProps) {
    const pathname = usePathname()
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Removed internal fetching useEffect

    const tabs: Tab[] = [
        {
            name: 'Overview',
            href: '#',
            icon: LayoutDashboard,
            isDropdown: true,
            children: [
                {
                    name: 'Brand Dashboard',
                    href: '/overview',
                    color: '#3B82F6',
                },
                {
                    name: 'Commercial Metrics',
                    href: '#',
                    color: '#6B7280',
                    comingSoon: true
                },
                {
                    name: 'C-Suite Dashboard',
                    href: '#',
                    color: '#6B7280',
                    comingSoon: true
                }
            ]
        },
        {
            name: 'Markets',
            href: '#',
            icon: Globe,
            isDropdown: true,
            children: markets.map(m => ({
                name: m.label,
                href: `/planner/${m.id}`,
                // Use flag as icon
                icon: m.flag_icon
            }))
        },
        {
            name: 'Channels',
            href: '#', // Dropdown trigger
            icon: Layers,
            isDropdown: true,
            children: channels.map(c => ({
                name: c.label,
                href: getChannelRoute(c.id),
                color: c.color
            }))
        },
        {
            name: 'New Brief',
            href: '/briefing',
            icon: PlusCircle,
        },
    ]


    return (
        <nav className="border-b border-white/10 glass relative z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.href) && tab.href !== '#';
                        const Icon = tab.icon
                        const isOpen = openDropdown === tab.name;

                        if (tab.isDropdown) {
                            return (
                                <div
                                    key={tab.name}
                                    className="relative"
                                    onMouseEnter={() => setOpenDropdown(tab.name)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <button
                                        className={cn(
                                            "relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none",
                                            isOpen || (pathname.startsWith('/overview') && tab.name === 'Overview') || (pathname !== '/planner' && pathname !== '/overview' && tab.name === 'Channels')
                                                ? "text-white"
                                                : "text-neutral-400 hover:text-white"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.name}</span>
                                        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-2 grid gap-1 z-50 transform"
                                            >
                                                {tab.children?.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group",
                                                            child.comingSoon && "opacity-60 cursor-not-allowed"
                                                        )}
                                                        onClick={(e) => child.comingSoon && e.preventDefault()}
                                                    >
                                                        {child.icon ? (
                                                            <span className="text-base">{child.icon}</span>
                                                        ) : (
                                                            <div
                                                                className="w-2 h-2 rounded-full ring-2 ring-white/10 group-hover:ring-white/30 transition-all"
                                                                style={{ backgroundColor: child.color }}
                                                            />
                                                        )}
                                                        <span className="text-sm text-neutral-300 group-hover:text-white font-medium">
                                                            {child.name}
                                                        </span>
                                                        {child.comingSoon && (
                                                            <span className="ml-auto text-[10px] uppercase font-bold text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                                Soon
                                                            </span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                    isActive
                                        ? "text-white"
                                        : "text-neutral-400 hover:text-white"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.name}</span>

                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>

    )
}
