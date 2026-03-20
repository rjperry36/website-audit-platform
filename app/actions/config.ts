'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// --- MARKETS ---

// Helper to generate flag emoji from ISO code
function getFlagEmoji(countryCode: string) {
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export async function createMarket(formData: FormData) {
    const id = formData.get('id') as string;
    const label = formData.get('label') as string;
    const currency = formData.get('currency') as string;
    // Auto-generate flag from ID
    const flag_icon = getFlagEmoji(id);

    const { error } = await supabase
        .from('markets')
        .insert([{ id, label, currency, flag_icon, is_active: true }]);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
}

export async function updateMarket(formData: FormData) {
    const id = formData.get('id') as string;
    const label = formData.get('label') as string;
    const currency = formData.get('currency') as string;
    const flag_icon = formData.get('flag_icon') as string;
    const is_active = formData.get('is_active') === 'on';

    const { error } = await supabase
        .from('markets')
        .update({ label, currency, flag_icon, is_active })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
}

export async function deleteMarket(id: string) {
    const { error } = await supabase
        .from('markets')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
    revalidatePath('/', 'layout'); // Update navigation
}

// --- STANDARD OBJECTIVES ---

export async function createObjective(formData: FormData) {
    const label = formData.get('label') as string;
    const default_kpi = formData.get('default_kpi') as string;
    const default_target = formData.get('default_target') as string;

    const { error } = await supabase
        .from('standard_objectives')
        .insert([{ label, default_kpi, default_target, is_active: true }]);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
    revalidatePath('/', 'layout'); // Update navigation
}

export async function updateObjective(formData: FormData) {
    const id = formData.get('id') as string;
    const label = formData.get('label') as string;
    const default_kpi = formData.get('default_kpi') as string;
    const default_target = formData.get('default_target') as string;
    const is_active = formData.get('is_active') === 'on';

    const { error } = await supabase
        .from('standard_objectives')
        .update({ label, default_kpi, default_target, is_active })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
    revalidatePath('/', 'layout'); // Update navigation
}

export async function deleteObjective(id: string) {
    const { error } = await supabase
        .from('standard_objectives')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
    revalidatePath('/', 'layout'); // Update navigation
}

// --- CHANNELS ---

export async function createChannel(formData: FormData) {
    const id = formData.get('id') as string;
    const label = formData.get('label') as string;
    const color = formData.get('color') as string;

    const { error } = await supabase
        .from('channels')
        .insert([{ id, label, color, is_active: true }]);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
    revalidatePath('/', 'layout'); // Update navigation
}

export async function deleteChannel(id: string) {
    const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    revalidatePath('/briefing');
    revalidatePath('/', 'layout'); // Update navigation
}
