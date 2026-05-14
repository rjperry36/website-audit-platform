import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

/**
 * GET /api/kg/asset?path=<relative path inside data/knowledge-graph/>
 *
 * Serves a single asset file (SVG, PNG, JPEG, MD) from the knowledge-graph
 * folder. Path-traversal guarded — only files under data/knowledge-graph/
 * are accessible.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rel = searchParams.get('path');
    if (!rel) return new NextResponse('Missing path', { status: 400 });

    const kgDir = path.join(process.cwd(), 'data', 'knowledge-graph');
    const cleaned = rel.startsWith('data/knowledge-graph/') ? rel.replace(/^data\/knowledge-graph\//, '') : rel;
    const full = path.normalize(path.join(kgDir, cleaned));

    if (!full.startsWith(kgDir)) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        const buf = await fs.readFile(full);
        const ext = path.extname(full).toLowerCase();
        const contentType =
            ext === '.svg' ? 'image/svg+xml' :
                ext === '.png' ? 'image/png' :
                    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                        ext === '.webp' ? 'image/webp' :
                            ext === '.md' ? 'text/markdown; charset=utf-8' :
                                'application/octet-stream';
        return new NextResponse(buf, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=300',
            },
        });
    } catch (e: any) {
        if (e.code === 'ENOENT') return new NextResponse('Not found', { status: 404 });
        return new NextResponse('Error', { status: 500 });
    }
}
