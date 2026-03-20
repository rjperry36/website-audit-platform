'use client'

import { useState } from 'react';
import { MarketList, ChannelList, ObjectiveList } from '@/components/admin/ConfigForms';

export function AdminInterface({ markets, channels, objectives }: { markets: any[], channels: any[], objectives: any[] }) {
    const [currentTab, setCurrentTab] = useState('markets');

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex space-x-1 rounded-xl bg-white/5 p-1 mb-8">
                <button
                    onClick={() => setCurrentTab('markets')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${currentTab === 'markets' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Markets
                </button>
                <button
                    onClick={() => setCurrentTab('objectives')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${currentTab === 'objectives' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Objectives
                </button>
                <button
                    onClick={() => setCurrentTab('channels')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${currentTab === 'channels' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Channels
                </button>
            </div>

            {currentTab === 'markets' && <MarketList markets={markets} />}
            {currentTab === 'objectives' && <ObjectiveList objectives={objectives} />}
            {currentTab === 'channels' && <ChannelList channels={channels} />}
        </div>
    );
}
