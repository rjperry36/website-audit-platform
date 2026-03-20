'use client'

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createMarket, updateMarket, deleteMarket, createChannel, deleteChannel, createObjective, updateObjective, deleteObjective } from '@/app/actions/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save } from 'lucide-react';

// Common styles to match BriefingForm
const inputStyles = "bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-blue-500/20";

function SubmitButton({ label = 'Save' }: { label?: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="sm">
            {pending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> {label}</>}
        </Button>
    );
}

function DeleteButton({ id, onDelete }: { id: string, onDelete: (id: string) => Promise<void> }) {
    return (
        <form action={async () => await onDelete(id)}>
            <Button variant="destructive" size="icon" className="h-8 w-8">
                <Trash2 className="w-4 h-4" />
            </Button>
        </form>
    )
}

// --- MARKET FORM ---

export function MarketList({ markets }: { markets: any[] }) {
    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Add New Market</h3>
                <form action={createMarket} className="flex gap-4 items-end">
                    <div className="grid gap-2">
                        <Label htmlFor="id" className="text-white">ID (e.g. US)</Label>
                        <Input name="id" id="id" placeholder="US" required maxLength={2} className={`w-20 uppercase ${inputStyles}`} />
                    </div>
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="label" className="text-white">Label</Label>
                        <Input name="label" id="label" placeholder="United States" required className={inputStyles} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="currency" className="text-white">Currency</Label>
                        <Input name="currency" id="currency" placeholder="USD" required maxLength={3} className={`w-24 uppercase ${inputStyles}`} />
                    </div>
                    <SubmitButton label="Add" />
                </form>
            </div>

            <div className="space-y-2">
                {markets.map((market) => (
                    <div key={market.id} className="glass p-4 rounded-lg border border-white/5 flex items-center justify-between gap-4">
                        <form action={updateMarket} className="flex-1 flex gap-4 items-center">
                            <input type="hidden" name="id" value={market.id} />
                            <div className="font-mono text-white/50 w-10">{market.id}</div>
                            <Input name="flag_icon" defaultValue={market.flag_icon} className={`w-16 text-xl ${inputStyles}`} />
                            <Input name="label" defaultValue={market.label} className={`flex-1 ${inputStyles}`} />
                            <Input name="currency" defaultValue={market.currency} className={`w-20 ${inputStyles}`} />

                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="is_active" defaultChecked={market.is_active} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-blue-500" />
                                <Label className="text-xs text-white/50">Active</Label>
                            </div>

                            <SubmitButton />
                        </form>
                        <DeleteButton id={market.id} onDelete={deleteMarket} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- OBJECTIVE FORM ---

export function ObjectiveList({ objectives }: { objectives: any[] }) {
    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Add Standard Objective</h3>
                <form action={createObjective} className="flex gap-4 items-end">
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="label" className="text-white">Objective Label</Label>
                        <Input name="label" id="label" placeholder="Brand Awareness" required className={inputStyles} />
                    </div>
                    <div className="grid gap-2 w-48">
                        <Label htmlFor="default_kpi" className="text-white">Default KPI</Label>
                        <Input name="default_kpi" id="default_kpi" placeholder="Impressions" className={inputStyles} />
                    </div>
                    <div className="grid gap-2 w-32">
                        <Label htmlFor="default_target" className="text-white">Target</Label>
                        <Input name="default_target" id="default_target" placeholder="1M" className={inputStyles} />
                    </div>
                    <SubmitButton label="Add" />
                </form>
            </div>

            <div className="space-y-2">
                {objectives.map((obj) => (
                    <div key={obj.id} className="glass p-4 rounded-lg border border-white/5 flex items-center justify-between gap-4">
                        <form action={updateObjective} className="flex-1 flex gap-4 items-center">
                            <input type="hidden" name="id" value={obj.id} />
                            <Input name="label" defaultValue={obj.label} className={`flex-1 ${inputStyles}`} />
                            <Input name="default_kpi" defaultValue={obj.default_kpi} className={`w-48 ${inputStyles}`} placeholder="KPI" />
                            <Input name="default_target" defaultValue={obj.default_target} className={`w-32 ${inputStyles}`} placeholder="Target" />

                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="is_active" defaultChecked={obj.is_active} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-blue-500" />
                                <Label className="text-xs text-white/50">Active</Label>
                            </div>
                            <SubmitButton />
                        </form>
                        <DeleteButton id={obj.id} onDelete={deleteObjective} />
                    </div>
                ))}
            </div>
        </div>
    );
}


// --- CHANNEL FORM ---

export function ChannelList({ channels }: { channels: any[] }) {
    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Add Channel</h3>
                <form action={createChannel} className="flex gap-4 items-end">
                    <div className="grid gap-2">
                        <Label htmlFor="id" className="text-white">ID</Label>
                        <Input name="id" id="id" placeholder="TIKTOK" required className={`uppercase w-32 ${inputStyles}`} />
                    </div>
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="label" className="text-white">Label</Label>
                        <Input name="label" id="label" placeholder="TikTok" required className={inputStyles} />
                    </div>
                    <div className="grid gap-2 w-24">
                        <Label htmlFor="color" className="text-white">Color</Label>
                        <Input name="color" id="color" type="color" defaultValue="#3B82F6" className={`h-10 w-full p-1 ${inputStyles}`} />
                    </div>
                    <SubmitButton label="Add" />
                </form>
            </div>

            <div className="space-y-2">
                {channels.map((channel) => (
                    <div key={channel.id} className="glass p-4 rounded-lg border border-white/5 flex items-center justify-between gap-4">
                        <div className="flex-1 flex gap-4 items-center">
                            <div className="font-mono text-white/50 w-24">{channel.id}</div>
                            <div className="text-white font-medium">{channel.label}</div>
                        </div>
                        <DeleteButton id={channel.id} onDelete={deleteChannel} />
                    </div>
                ))}
            </div>
        </div>
    )
}
