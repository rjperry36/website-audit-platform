
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Upload, Check, AlertCircle, Loader2 } from 'lucide-react'
import channelTypes from '@/lib/channel-initiative-types.json'
import { ProjectBrief, Market, BriefObjective } from '@/lib/planner-types'
import { ObjectiveList } from './ObjectiveList'
import { cn } from '@/lib/utils'

const MARKETS: { id: Market; label: string }[] = [
    { id: 'UK', label: 'United Kingdom' },
    { id: 'US', label: 'United States' },
    { id: 'DE', label: 'Germany' },
    { id: 'FR', label: 'France' },
    { id: 'JP', label: 'Japan' },
    { id: 'CN', label: 'China' },
]

export function BriefingForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [selectedMarkets, setSelectedMarkets] = useState<Market[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [objectives, setObjectives] = useState<BriefObjective[]>([]);
    const [tags, setTags] = useState(''); // Comma separated string
    const [briefFile, setBriefFile] = useState<File | null>(null);

    const toggleChannel = (id: string) => {
        setSelectedChannels(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleMarket = (id: Market) => {
        setSelectedMarkets(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBriefFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            // Validate required fields
            if (!title) throw new Error('Project Title is required');
            if (!startDate) throw new Error('Start Date is required');
            if (selectedMarkets.length === 0) throw new Error('Please select at least one market');
            if (selectedChannels.length === 0) throw new Error('Please select at least one channel');

            const payload: Partial<ProjectBrief> = {
                title,
                channelTypes: selectedChannels,
                markets: selectedMarkets,
                startDate,
                endDate: endDate || undefined, // Send undefined if empty to trigger 'planning' logic
                objectives,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                // clientBriefUrl: briefFile ? URL.createObjectURL(briefFile) : undefined, // Mock upload
            };

            const response = await fetch('/api/briefs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit brief');
            }

            setSubmitStatus('success');
            // Redirect after delay
            setTimeout(() => {
                const redirectMarket = selectedMarkets[0] || 'UK';
                router.push(`/planner/${redirectMarket}`);
            }, 1500);

        } catch (error: any) {
            setSubmitStatus('error');
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center glass rounded-xl border border-white/10">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                    <Check className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Brief Submitted!</h2>
                <p className="text-neutral-400">Your project has been created successfully.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">New Project Brief</h1>
                <p className="text-neutral-400">Define the core requirements for your new campaign or project.</p>
            </div>

            {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium text-neutral-300">
                            Project Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Summer Launch 2024"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>

                    {/* Markets */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-neutral-300">
                            Markets <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {MARKETS.map((market) => (
                                <button
                                    key={market.id}
                                    type="button"
                                    onClick={() => toggleMarket(market.id)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-sm text-center border transition-all",
                                        selectedMarkets.includes(market.id)
                                            ? "bg-primary-500/20 border-primary-500/50 text-white"
                                            : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                                    )}
                                >
                                    {market.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-300">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-primary-500 outline-none scheme-dark"
                                />
                                {/* <Calendar className="absolute right-3 top-3 h-5 w-5 text-neutral-500 pointer-events-none" /> */}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-300">
                                End Date <span className="text-xs text-neutral-500">(Optional)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-primary-500 outline-none scheme-dark"
                                />
                            </div>
                        </div>
                        <p className="col-span-2 text-xs text-neutral-500">
                            Provide an end date to mark the project as <strong>Planned</strong> (bar visualization).
                            Without an end date, it will be marked as <strong>Planning</strong> (milestone visualization).
                        </p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-300">
                            Client Brief (PDF)
                        </label>
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="bg-white/5 border border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-white/10 group-hover:border-white/30">
                                <Upload className="h-8 w-8 text-neutral-500 mb-2 group-hover:text-primary-400 transition-colors" />
                                {briefFile ? (
                                    <span className="text-sm text-primary-400 font-medium">{briefFile.name}</span>
                                ) : (
                                    <>
                                        <span className="text-sm text-neutral-300 font-medium">Click to upload brief</span>
                                        <span className="text-xs text-neutral-500 mt-1">PDF up to 10MB</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="space-y-8">
                    {/* Channels */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-neutral-300">
                            Channels <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {channelTypes.map((channel) => (
                                <button
                                    key={channel.id}
                                    type="button"
                                    onClick={() => toggleChannel(channel.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left border transition-all",
                                        selectedChannels.includes(channel.id)
                                            ? "bg-white/10 border-white/30 text-white"
                                            : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                                    )}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: channel.color }}
                                    />
                                    {channel.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Objectives */}
                    <ObjectiveList objectives={objectives} onChange={setObjectives} />

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-300">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. key-launch, q3-priority (comma separated)"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-primary-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Brief
                </button>
            </div>
        </form>
    );
}
