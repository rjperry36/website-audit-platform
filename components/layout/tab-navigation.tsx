'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Search,
    Mail,
    Share2,
    ShoppingCart,
    Store,
    TrendingUp,
    Eye
} from 'lucide-react'

interface Tab {
    name: string
    href: string
    icon: React.ElementType
    badge?: number
    comingSoon?: boolean
}

const tabs: Tab[] = [
    {
        name: 'Overview',
        href: '/overview',
        icon: LayoutDashboard,
    },
    {
        name: 'Search',
        href: '/search',
        icon: Search,
    },
    {
        name: 'UX',
        href: '/ux',
        icon: Eye,
    },
    {
        name: 'eCRM',
        href: '/ecrm',
        icon: Mail,
        comingSoon: true,
    },
    {
        name: 'Social',
        href: '/social',
        icon: Share2,
        comingSoon: true,
    },
    {
        name: 'eCommerce',
        href: '/ecommerce',
        icon: ShoppingCart,
        comingSoon: true,
    },
    {
        name: 'POS',
        href: '/pos',
        icon: Store,
        comingSoon: true,
    },
]

export function TabNavigation() {
    const pathname = usePathname()

    return (
        <nav className="border-b border-white/10 glass content-layer">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.href)
                        const Icon = tab.icon

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                    isActive
                                        ? "text-white"
                                        : "text-neutral-400 hover:text-white",
                                    tab.comingSoon && "opacity-60"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.name}</span>

                                {tab.comingSoon && (
                                    <span className="ml-1 rounded-full bg-primary-500/20 border border-primary-500/30 px-2 py-0.5 text-xs text-primary-400">
                                        Soon
                                    </span>
                                )}

                                {tab.badge !== undefined && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 text-xs text-red-400">
                                        {tab.badge}
                                    </span>
                                )}

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

                                {/* Hover glow effect */}
                                {!isActive && (
                                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-white/5 rounded-t-lg" />
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
