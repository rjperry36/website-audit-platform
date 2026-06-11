import Link from 'next/link'
import { FileSearch } from 'lucide-react'

/**
 * Shown when an audit page has no report data to render (e.g. the latest-crawl
 * fetch failed or returned nothing). Replaces silent `return null` blanks so a
 * missing report reads as an explained state, not a broken page.
 */
export function AuditEmptyState({
    title = 'No audit data yet',
    message = 'There is no audit report available for this site right now. Once a crawl has run, the results will appear here.',
}: {
    title?: string
    message?: string
}) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="glass max-w-md w-full rounded-xl border border-white/10 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                    <FileSearch className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm text-neutral-400">{message}</p>
                <Link
                    href="/ux"
                    className="mt-6 inline-block rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                    Back to UX overview
                </Link>
            </div>
        </div>
    )
}
