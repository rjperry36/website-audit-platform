import { KgTabs } from './kg-tabs';

export default function KgLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="container mx-auto px-4 py-6">
            <KgTabs />
            <div>{children}</div>
        </div>
    );
}
