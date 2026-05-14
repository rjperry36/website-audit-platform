import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight } from 'lucide-react';
import { getBrand, getProducts, getPersonas, getBrandAssets, getBrandGuidelines, formatCurrency } from '@/lib/kg/loader';

export default async function BrandPage() {
    const [brand, products, personas, brandAssets, guidelines] = await Promise.all([
        getBrand(),
        getProducts(),
        getPersonas(),
        getBrandAssets(),
        getBrandGuidelines(),
    ]);

    if (!brand) {
        return <div className="text-neutral-400">Brand data not loaded. Run <code className="text-white">npm run validate-kg</code> to check.</div>;
    }

    const logos = brandAssets.filter((a) => a.properties.asset_type === 'logo');
    const lifestyleAssets = brandAssets.filter((a) => a.properties.asset_type === 'lifestyle_image');

    return (
        <div className="space-y-8">
            {/* Brand profile */}
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle>{brand.properties.name}</CardTitle>
                    <CardDescription>{brand.properties.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-white/5 pb-1.5">
                                    <dt className="text-neutral-400">Category</dt>
                                    <dd className="text-white">{brand.properties.category}</dd>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1.5">
                                    <dt className="text-neutral-400">Founded</dt>
                                    <dd className="text-white">{brand.properties.founded_year}</dd>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1.5">
                                    <dt className="text-neutral-400">HQ</dt>
                                    <dd className="text-white">{brand.properties.hq_city}</dd>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1.5">
                                    <dt className="text-neutral-400">Website</dt>
                                    <dd className="text-white">{brand.properties.website || '—'}</dd>
                                </div>
                            </dl>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-300 leading-relaxed">{brand.properties.positioning}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logo + palette */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Visual identity</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {logos.map((logo) => (
                        <Card key={logo.id} variant="elevated">
                            <CardHeader>
                                <CardTitle className="text-base">{logo.properties.name}</CardTitle>
                                <CardDescription className="text-xs font-mono">{logo.properties.file_path}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-[#F2EDE4] rounded-md p-6 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/api/kg/asset?path=${encodeURIComponent(logo.properties.file_path)}`}
                                        alt={logo.properties.name}
                                        className="max-h-24 w-auto"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {/* Palette */}
                <div className="mt-4">
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-base">Palette</CardTitle>
                            <CardDescription className="text-xs">From <code>brand-book/visual-identity.md</code></CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                {[
                                    { token: 'aurelune.ink', hex: '#1B1B1F', text: '#F2EDE4' },
                                    { token: 'aurelune.bone', hex: '#F2EDE4', text: '#1B1B1F' },
                                    { token: 'aurelune.dawn', hex: '#E8C9A3', text: '#1B1B1F' },
                                    { token: 'aurelune.dusk', hex: '#5C5A7A', text: '#F2EDE4' },
                                    { token: 'aurelune.signal', hex: '#C84F2A', text: '#F2EDE4' },
                                    { token: 'aurelune.mist', hex: '#D8D5CE', text: '#1B1B1F' },
                                ].map((c) => (
                                    <div key={c.token} className="rounded-md overflow-hidden border border-white/10">
                                        <div className="h-16" style={{ backgroundColor: c.hex }} />
                                        <div className="p-2" style={{ backgroundColor: c.hex, color: c.text }}>
                                            <div className="font-mono text-[10px] opacity-80">{c.token}</div>
                                            <div className="font-mono text-xs">{c.hex}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Personas */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Consumer personas</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {personas.map((p) => (
                        <Card key={p.id} variant="elevated">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base">{p.properties.name}</CardTitle>
                                        <CardDescription className="mt-1">{p.properties.archetype}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-xs">{p.properties.age_range}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <dl className="text-sm space-y-1.5">
                                    <div className="flex justify-between">
                                        <dt className="text-neutral-400">Income band</dt>
                                        <dd className="text-white">{p.properties.income_band}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 mb-1">Motivation</dt>
                                        <dd className="text-neutral-200">{p.properties.primary_motivation}</dd>
                                    </div>
                                </dl>
                                <p className="text-xs text-neutral-500 mt-3 font-mono">{p.properties.doc_path}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Products */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Product range</h2>
                <Card variant="elevated">
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-white/10 text-neutral-400">
                                    <th className="px-4 py-3 font-medium">Product</th>
                                    <th className="px-4 py-3 font-medium">SKU</th>
                                    <th className="px-4 py-3 font-medium">Line</th>
                                    <th className="px-4 py-3 font-medium text-right">Size</th>
                                    <th className="px-4 py-3 font-medium text-right">COGS</th>
                                    <th className="px-4 py-3 font-medium text-right">RRP</th>
                                    <th className="px-4 py-3 font-medium text-right">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-white">{p.properties.name}</td>
                                        <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{p.properties.sku}</td>
                                        <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{p.properties.line}</Badge></td>
                                        <td className="px-4 py-3 text-right text-neutral-300">{p.properties.size_ml > 0 ? `${p.properties.size_ml} ml` : '—'}</td>
                                        <td className="px-4 py-3 text-right text-neutral-300">{formatCurrency(p.properties.cogs_gbp)}</td>
                                        <td className="px-4 py-3 text-right text-white">{formatCurrency(p.properties.rrp_gbp)}</td>
                                        <td className="px-4 py-3 text-right text-emerald-400">{(p.properties.margin_pct * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </section>

            {/* Guidelines */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Brand guidelines</h2>
                <div className="grid md:grid-cols-3 gap-3">
                    {guidelines.map((g) => (
                        <Link
                            key={g.id}
                            href={`/knowledge-graph/brand/guidelines/${encodeURIComponent(g.id)}`}
                            className="block"
                        >
                            <Card variant="elevated" className="hover:border-primary-500/40 hover:bg-white/[0.02] transition-colors h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <FileText className="h-4 w-4 text-primary-400 flex-shrink-0" />
                                                <CardTitle className="text-sm truncate">{g.properties.name}</CardTitle>
                                            </div>
                                            <CardDescription className="text-xs font-mono">{g.properties.doc_path}</CardDescription>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-neutral-500 flex-shrink-0 mt-1" />
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
                <p className="text-xs text-neutral-500 mt-3">
                    Markdown sources at <code>/data/knowledge-graph/brand-book/</code>. Click any guideline to read its full content.
                </p>
            </section>

            {/* Lifestyle imagery references */}
            {lifestyleAssets.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-white mb-3">Lifestyle imagery references</h2>
                    <div className="grid md:grid-cols-3 gap-3">
                        {lifestyleAssets.map((a) => (
                            <Card key={a.id} variant="elevated">
                                <CardHeader>
                                    <CardTitle className="text-sm">{a.properties.name}</CardTitle>
                                    <CardDescription className="text-xs">
                                        Prompt ref: <code className="text-neutral-300">{a.properties.generation_prompt_ref || '—'}</code>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video bg-gradient-to-br from-[#5C5A7A] to-[#1B1B1F] rounded-md flex items-center justify-center text-neutral-300 text-xs italic">
                                        Image generation pending
                                    </div>
                                    {a.properties.market_variants && Object.keys(a.properties.market_variants).length > 0 && (
                                        <div className="mt-2 text-xs text-neutral-400">
                                            Market variants: {Object.keys(a.properties.market_variants).join(', ')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
