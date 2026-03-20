
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react';

interface CrawlHistoryProps {
    dates: string[];
}

export function CrawlHistory({ dates }: CrawlHistoryProps) {
    const searchParams = useSearchParams();
    const currentDate = searchParams.get('date');

    // If no date is selected, the first one (most recent) is active by default logic in parent
    // But for UI highlighting, we should check if date param exists matching the item, 
    // OR if no date param exists and it's the first item.
    const isActive = (date: string, index: number) => {
        if (currentDate === date) return true;
        if (!currentDate && index === 0) return true;
        return false;
    };

    if (dates.length === 0) {
        return (
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <History className="h-5 w-5" />
                        Crawl History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-neutral-400">No crawls found.</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="elevated" className="h-[calc(100vh-120px)] sticky top-24 overflow-y-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5" />
                    History
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {dates.map((date, index) => {
                    const active = isActive(date, index);
                    return (
                        <Link
                            key={date}
                            href={`/overview?date=${date}`}
                            className={cn(
                                "block w-full rounded-lg px-4 py-3 text-sm transition-all duration-200 border",
                                active
                                    ? "bg-primary-500/20 border-primary-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                    : "bg-white/5 border-transparent text-neutral-400 hover:bg-white/10 hover:text-white hover:border-white/10"
                            )}
                        >
                            <div className="font-medium">
                                {format(parseISO(date), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs opacity-60 mt-0.5">
                                {index === 0 ? 'Latest Crawl' : format(parseISO(date), 'EEEE')}
                            </div>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}
