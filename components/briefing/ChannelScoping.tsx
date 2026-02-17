'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChannelExpert, ScopingQuestion, getExpertIcon } from '@/lib/channel-experts'
import { ChevronRight, ChevronLeft, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface ChannelScopingProps {
    selectedChannels: string[];
    onBack: () => void;
    onSubmit: (scopingData: Record<string, any>) => void;
    isSubmitting: boolean;
}

export function ChannelScoping({ selectedChannels, onBack, onSubmit, isSubmitting }: ChannelScopingProps) {
    const [activeExperts, setActiveExperts] = useState<ChannelExpert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentExpertIndex, setCurrentExpertIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, Record<string, string | string[]>>>({});

    // Fetch Experts and Questions
    useEffect(() => {
        const fetchExpertData = async () => {
            if (selectedChannels.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                // 1. Fetch Channels (Experts)
                const { data: channelsData, error: channelsError } = await supabase
                    .from('channels')
                    .select('id, expert_role, expert_description, expert_icon_name')
                    .in('id', selectedChannels);

                if (channelsError) throw channelsError;

                // 2. Fetch Questions
                const { data: questionsData, error: questionsError } = await supabase
                    .from('channel_questions')
                    .select('*')
                    .in('channel_id', selectedChannels)
                    .order('order_index');

                if (questionsError) throw questionsError;

                // 3. Combine Data
                const experts: ChannelExpert[] = channelsData.map((channel: any) => {
                    const questions = questionsData
                        .filter((q: any) => q.channel_id === channel.id)
                        .map((q: any) => ({
                            id: q.id,
                            question_identifier: q.question_identifier,
                            question_text: q.question_text,
                            question_type: q.question_type,
                            placeholder: q.placeholder,
                            options: q.options,
                            order_index: q.order_index
                        } as ScopingQuestion));

                    return {
                        id: channel.id,
                        role: channel.expert_role || 'Specialist',
                        description: channel.expert_description || 'I help with this channel.',
                        icon_name: channel.expert_icon_name || 'Calendar',
                        questions: questions
                    };
                });

                // Sort experts to match the order of selectedChannels (if important?) 
                // or just keep them as returned. Let's sort by selectedChannels order
                const sortedExperts = selectedChannels
                    .map(id => experts.find(e => e.id === id))
                    .filter((e): e is ChannelExpert => !!e);

                setActiveExperts(sortedExperts);

            } catch (error) {
                console.error('Error fetching expert data:', error);
                // Fallback? Or shows error state.
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpertData();
    }, [selectedChannels]);

    const currentExpert = activeExperts[currentExpertIndex];
    const isFirst = currentExpertIndex === 0;
    const isLast = currentExpertIndex === activeExperts.length - 1;

    // Initialize responses structure
    useEffect(() => {
        if (activeExperts.length > 0) {
            const initialResponses: Record<string, Record<string, any>> = {};
            activeExperts.forEach(expert => {
                if (!responses[expert.id]) {
                    initialResponses[expert.id] = {};
                }
            });
            if (Object.keys(initialResponses).length > 0) {
                setResponses(prev => ({ ...prev, ...initialResponses }));
            }
        }
    }, [activeExperts]);

    const handleAnswer = (questionIdentifier: string, value: any) => {
        setResponses(prev => ({
            ...prev,
            [currentExpert.id]: {
                ...prev[currentExpert.id],
                [questionIdentifier]: value
            }
        }));
    };

    const handleNext = () => {
        if (isLast) {
            onSubmit(responses);
        } else {
            setCurrentExpertIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (isFirst) {
            onBack();
        } else {
            setCurrentExpertIndex(prev => prev - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                <p className="text-neutral-400">Loading channel experts...</p>
            </div>
        );
    }

    if (!currentExpert) return <div className="text-center py-10 text-neutral-400">No channel experts found.</div>;

    const ExpertIcon = getExpertIcon(currentExpert.icon_name);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-primary-500/20 text-primary-400 p-1.5 rounded-lg">
                            <ExpertIcon className="w-5 h-5" />
                        </span>
                        {currentExpert.role} Scoping
                    </h2>
                    <span className="text-sm text-neutral-500">
                        Channel {currentExpertIndex + 1} of {activeExperts.length}
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentExpertIndex + 1) / activeExperts.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Expert Persona */}
                <div className="md:col-span-1">
                    <div className="glass p-6 rounded-xl border border-white/10 sticky top-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500/30 to-purple-500/30 rounded-full flex items-center justify-center border border-white/10 shadow-xl">
                                <ExpertIcon className="w-10 h-10 text-primary-200" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{currentExpert.role}</h3>
                                <p className="text-xs text-primary-400 font-mono mt-1">{currentExpert.id} EXPERT</p>
                            </div>
                            <p className="text-sm text-neutral-400 italic">
                                "{currentExpert.description}"
                            </p>
                            <div className="w-full pt-4 border-t border-white/5">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-2">
                                    Scoping Progress
                                </div>
                                <div className="flex justify-center gap-1.5">
                                    {activeExperts.map((exp, idx) => (
                                        <div
                                            key={exp.id}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all",
                                                idx === currentExpertIndex ? "bg-primary-500 scale-125" :
                                                    idx < currentExpertIndex ? "bg-green-500" : "bg-white/10"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Questions */}
                <div className="md:col-span-2 space-y-6">
                    <motion.div
                        key={currentExpert.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {currentExpert.questions.map((q) => (
                            <div key={q.id} className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-300">
                                    {q.question_text}
                                </label>

                                {q.question_type === 'textarea' && (
                                    <textarea
                                        value={responses[currentExpert.id]?.[q.question_identifier] as string || ''}
                                        onChange={(e) => handleAnswer(q.question_identifier, e.target.value)}
                                        placeholder={q.placeholder}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-primary-500 outline-none transition-all focus:bg-white/10"
                                    />
                                )}

                                {q.question_type === 'text' && (
                                    <input
                                        type="text"
                                        value={responses[currentExpert.id]?.[q.question_identifier] as string || ''}
                                        onChange={(e) => handleAnswer(q.question_identifier, e.target.value)}
                                        placeholder={q.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-primary-500 outline-none transition-all focus:bg-white/10"
                                    />
                                )}

                                {q.question_type === 'select' && (
                                    <select
                                        value={responses[currentExpert.id]?.[q.question_identifier] as string || ''}
                                        onChange={(e) => handleAnswer(q.question_identifier, e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select an option...</option>
                                        {q.options?.map(opt => (
                                            <option key={opt} value={opt} className="bg-slate-800 text-white">{opt}</option>
                                        ))}
                                    </select>
                                )}

                                {q.question_type === 'multiselect' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options?.map(opt => {
                                            const currentVal = (responses[currentExpert.id]?.[q.question_identifier] as string[]) || [];
                                            const isSelected = currentVal.includes(opt);
                                            return (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => {
                                                        const newVal = isSelected
                                                            ? currentVal.filter(v => v !== opt)
                                                            : [...currentVal, opt];
                                                        handleAnswer(q.question_identifier, newVal);
                                                    }}
                                                    className={cn(
                                                        "px-3 py-2 rounded-lg text-sm text-center border transition-all truncate",
                                                        isSelected
                                                            ? "bg-primary-500/20 border-primary-500/50 text-white"
                                                            : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                                                    )}
                                                >
                                                    {opt}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-8 mt-8 border-t border-white/10 flex items-center justify-between">
                <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {isFirst ? 'Back to Brief' : 'Previous Expert'}
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-8 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : isLast ? (
                        <>
                            Submit Full Brief
                            <CheckCircle2 className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            Next Expert
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

