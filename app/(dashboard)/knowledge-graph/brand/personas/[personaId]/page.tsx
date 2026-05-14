import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCircle2 } from 'lucide-react';
import { getPersonas, getBrandBookDoc } from '@/lib/kg/loader';

marked.setOptions({ gfm: true, breaks: false });

export default async function PersonaDetailPage({ params }: { params: { personaId: string } }) {
    const personaId = decodeURIComponent(params.personaId);
    const personas = await getPersonas();
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) notFound();

    const docPath = persona.properties.doc_path as string;
    const relPath = docPath.startsWith('brand-book/') ? docPath.slice('brand-book/'.length) : docPath;
    const markdown = await getBrandBookDoc(relPath);

    if (!markdown) {
        return (
            <div className="space-y-4">
                <Link href="/knowledge-graph/brand" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to brand
                </Link>
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <p className="text-amber-400">Persona markdown not found at <code className="font-mono text-xs">{docPath}</code></p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const html = await marked.parse(markdown);

    return (
        <div className="space-y-6">
            <Link href="/knowledge-graph/brand" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to brand
            </Link>

            <div className="space-y-3">
                <div className="flex items-start gap-3 flex-wrap">
                    <UserCircle2 className="h-6 w-6 text-primary-400 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-white">{persona.properties.name}</h2>
                        <p className="text-sm text-neutral-400">{persona.properties.archetype}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {persona.properties.age_range && (
                        <Badge variant="outline" className="text-[10px]">{persona.properties.age_range}</Badge>
                    )}
                    {persona.properties.income_band && (
                        <Badge variant="outline" className="text-[10px]">{persona.properties.income_band}</Badge>
                    )}
                </div>
                {persona.properties.primary_motivation && (
                    <p className="text-sm text-neutral-300">
                        <span className="text-neutral-500">Primary motivation: </span>
                        {persona.properties.primary_motivation}
                    </p>
                )}
                <p className="text-xs text-neutral-500 font-mono">{docPath}</p>
            </div>

            <Card variant="elevated">
                <CardContent className="p-8">
                    <article
                        className={[
                            'max-w-3xl',
                            '[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-white/10 [&_h1:first-child]:mt-0',
                            '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-7 [&_h2]:mb-3',
                            '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2',
                            '[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-neutral-200 [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:uppercase [&_h4]:tracking-wide',
                            '[&_p]:text-neutral-300 [&_p]:leading-relaxed [&_p]:mb-4',
                            '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-neutral-300 [&_ul]:space-y-1.5',
                            '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-neutral-300 [&_ol]:space-y-1.5',
                            '[&_li]:text-neutral-300 [&_li]:leading-relaxed',
                            '[&_li>p]:mb-2',
                            '[&_li>ul]:mt-1.5 [&_li>ul]:mb-1.5',
                            '[&_table]:w-full [&_table]:my-5 [&_table]:text-sm [&_table]:border-collapse',
                            '[&_thead]:border-b [&_thead]:border-white/10',
                            '[&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:text-neutral-400 [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide',
                            '[&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-white/5 [&_td]:text-neutral-300 [&_td]:align-top',
                            '[&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-neutral-200',
                            '[&_pre]:bg-white/5 [&_pre]:border [&_pre]:border-white/10 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-4 [&_pre]:overflow-x-auto',
                            '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs [&_pre_code]:leading-relaxed',
                            '[&_strong]:text-white [&_strong]:font-semibold',
                            '[&_em]:italic',
                            '[&_blockquote]:border-l-4 [&_blockquote]:border-primary-500/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-300 [&_blockquote]:my-5 [&_blockquote]:text-base',
                            '[&_a]:text-primary-300 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary-200',
                            '[&_hr]:border-white/10 [&_hr]:my-8',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{ __html: html as string }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
