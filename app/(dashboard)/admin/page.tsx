
import { supabase } from '@/lib/supabase';
import { AdminInterface } from '@/components/admin/AdminInterface';

export default async function AdminPage() {
    // 1. Fetch Data
    const { data: markets } = await supabase.from('markets').select('*').order('id');
    const { data: channels } = await supabase.from('channels').select('*').order('id');
    const { data: objectives } = await supabase.from('standard_objectives').select('*').order('label');

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="max-w-4xl mx-auto mb-12">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    Configuration Admin
                </h1>
                <p className="text-white/60 mt-2">Manage global settings, markets, and objectives.</p>
            </header>

            <AdminInterface
                markets={markets || []}
                channels={channels || []}
                objectives={objectives || []}
            />
        </div>
    );
}
