
import { BriefingForm } from '@/components/briefing/BriefingForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'New Project Brief | SiteAudit Agent',
    description: 'Create a new project brief with objectives, KPIs, and channel planning.',
}

export default function BriefingPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <BriefingForm />
        </div>
    )
}
