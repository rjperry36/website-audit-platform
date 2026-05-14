import { getMarkets, getChannels } from '@/lib/kg/loader';
import { BriefingAssistantClient } from './briefing-assistant-client';

export const metadata = {
    title: 'Briefing Assistant | Halo & Helix',
    description: 'AI-driven recommendations grounded in historical campaign data.',
};

export default async function BriefingAssistantPage() {
    const [markets, channels] = await Promise.all([getMarkets(), getChannels()]);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-[10px] uppercase tracking-wider">
                        AI agent · grounded
                    </span>
                </div>
                <h1 className="text-2xl font-semibold text-white">Briefing Assistant</h1>
                <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
                    Describe a new brief. The assistant reads the knowledge graph and returns a
                    structured recommendation — budget range, suggested team, timeline, risks —
                    every claim citable back to specific historical campaigns and people.
                </p>
            </div>

            <BriefingAssistantClient
                markets={markets.map((m) => ({
                    id: m.id,
                    label: m.properties.label,
                    ref_id: m.properties.ref_id,
                }))}
                channels={channels.map((c) => ({
                    id: c.id,
                    label: c.properties.label,
                    ref_id: c.properties.ref_id,
                }))}
            />
        </div>
    );
}
