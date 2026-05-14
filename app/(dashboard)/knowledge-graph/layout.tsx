import { KgTabs } from './kg-tabs';

export default function KgLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Knowledge Graph Explorer</h1>
                <p className="text-sm text-neutral-400 mt-1">
                    Browse the Aurelune × Halo &amp; Helix dataset — the substrate that future AI agents read from.
                </p>
            </div>
            <KgTabs />
            <div>{children}</div>
        </div>
    );
}
