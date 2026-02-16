
import { notFound } from 'next/navigation';
import { Timeline } from "@/components/planner/Timeline";
import { PlannerListView } from "@/components/planner/PlannerListView";
import { PlannerEvent } from "@/lib/planner-data";
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

const MARKETS = ['UK', 'US', 'DE', 'FR', 'JP', 'CN'];

export const metadata: Metadata = {
    title: 'Market Planner | SiteAudit Agent',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;


// Helper to convert date to Week Number (1-52)
// Jan 1st is Week 1.
const getWeekFromDate = (dateStr: string): number => {
    const date = new Date(dateStr);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
};

export default async function MarketPlannerPage({ params }: { params: { market: string } }) {
    const { market } = params;

    if (!MARKETS.includes(market.toUpperCase())) {
        notFound();
    }

    // Fetch Briefs from Supabase
    const { data: briefs, error } = await supabase
        .from('briefs')
        .select(`
            *,
            brief_objectives (*)
        `)
        .contains('markets', [market.toUpperCase()]);

    if (error) {
        console.error('Error fetching briefs:', error);
        // Handle error gracefully, maybe show empty state
    }

    const marketBriefs = briefs || [];

    // Transform briefs to PlannerEvents
    const briefEvents: PlannerEvent[] = marketBriefs.flatMap((brief: any) => {
        return brief.channel_types.map((channelId: string, index: number) => ({
            id: `${brief.id}-${channelId}-${index}`,
            title: brief.title,
            type: channelId,
            startWeek: getWeekFromDate(brief.start_date),
            durationWeeks: brief.end_date ? (getWeekFromDate(brief.end_date) - getWeekFromDate(brief.start_date)) : 0,
            status: brief.status,
            rowId: channelId,
            description: `Objectives: ${brief.brief_objectives?.length || 0}`,
            projectId: brief.id,
            owner: 'Briefing'
        }));
    });

    const allEvents = [...briefEvents];

    return (
        <div className="container mx-auto px-4 py-8 content-layer">
            <div className="space-y-8">
                {/* Header */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <span className="text-primary-400">{market}</span> Planner
                    </h2>
                    <p className="text-neutral-400 mb-6 max-w-2xl">
                        Planning view for {market === 'UK' ? 'United Kingdom' : market}.
                    </p>

                    <div className="glass rounded-xl border border-white/10 p-6 content-layer overflow-hidden">
                        <Timeline events={allEvents} market={market} />
                    </div>

                    {/* List View Section */}
                    <div className="mt-12">
                        <PlannerListView events={allEvents} />
                    </div>
                </section>
            </div>
        </div>
    )
}
