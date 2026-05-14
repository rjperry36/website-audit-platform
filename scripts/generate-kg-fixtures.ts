#!/usr/bin/env node

/**
 * KG Fixture Generator — Aurelune × Halo & Helix sample data
 *
 * Reads the hand-curated nodes/edges in /data/knowledge-graph/ and procedurally
 * generates the high-volume parts of the dataset:
 *
 *   - nodes/campaigns.json
 *   - nodes/executions.json
 *   - nodes/approval-steps.json
 *   - nodes/assets.json
 *   - nodes/asset-variants.json
 *   - edges/campaign-structure.json
 *   - edges/execution-links.json
 *   - edges/approvals.json
 *   - edges/staffing.json
 *   - tables/cost-lines.csv
 *   - tables/time-tracking.csv
 *   - tables/media-spend.csv
 *
 * Deterministic: uses a seeded RNG so the output is reproducible.
 *
 * Run with: npm run generate-kg-fixtures
 */

import { promises as fs } from 'fs';
import path from 'path';

// =============================================================================
// SEED + RNG (deterministic; change SEED to regenerate a different sample)
// =============================================================================

const SEED = 20260514;

function makeRng(seed: number) {
    // Mulberry32 — small, fast, good enough for fixture generation
    let a = seed >>> 0;
    return function rng() {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rng = makeRng(SEED);

function rngInt(min: number, max: number) {
    return Math.floor(rng() * (max - min + 1)) + min;
}
function rngPick<T>(arr: readonly T[]): T {
    return arr[Math.floor(rng() * arr.length)];
}
function rngPickN<T>(arr: readonly T[], n: number): T[] {
    const copy = [...arr];
    const out: T[] = [];
    for (let i = 0; i < n && copy.length; i++) {
        const idx = Math.floor(rng() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return out;
}
function rngFloat(min: number, max: number) {
    return rng() * (max - min) + min;
}

// =============================================================================
// PATHS
// =============================================================================

const KG_DIR = path.join(process.cwd(), 'data', 'knowledge-graph');
const NODE_DIR = path.join(KG_DIR, 'nodes');
const EDGE_DIR = path.join(KG_DIR, 'edges');
const TABLE_DIR = path.join(KG_DIR, 'tables');

// =============================================================================
// IO HELPERS
// =============================================================================

async function readJson<T = any>(file: string): Promise<T> {
    return JSON.parse(await fs.readFile(file, 'utf-8'));
}
async function writeJson(file: string, value: any): Promise<void> {
    await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf-8');
}
async function writeCsv(file: string, rows: Record<string, any>[]): Promise<void> {
    if (rows.length === 0) {
        await fs.writeFile(file, '', 'utf-8');
        return;
    }
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    for (const row of rows) {
        const cells = headers.map((h) => {
            const v = row[h];
            if (v === null || v === undefined) return '';
            const s = String(v);
            // Quote if contains comma / quote / newline
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        });
        lines.push(cells.join(','));
    }
    await fs.writeFile(file, lines.join('\n') + '\n', 'utf-8');
}

// =============================================================================
// DATE HELPERS
// =============================================================================

function isoDate(d: Date): string {
    return d.toISOString().split('T')[0];
}
function addDays(d: Date, days: number): Date {
    const n = new Date(d);
    n.setUTCDate(n.getUTCDate() + days);
    return n;
}
function addWorkingDays(start: Date, workingDays: number): Date {
    let d = new Date(start);
    let added = 0;
    while (added < workingDays) {
        d = addDays(d, 1);
        const dow = d.getUTCDay();
        if (dow !== 0 && dow !== 6) added++;
    }
    return d;
}
function weekStarting(d: Date): string {
    // ISO Monday of the week
    const n = new Date(d);
    const dow = n.getUTCDay();
    const offset = dow === 0 ? -6 : 1 - dow;
    n.setUTCDate(n.getUTCDate() + offset);
    return isoDate(n);
}

// =============================================================================
// LOADED DATA TYPES (minimal)
// =============================================================================

type Node = { id: string; type: string; properties: Record<string, any> };
type Edge = { from: string; to: string; type: string; properties?: Record<string, any> };

// =============================================================================
// CAMPAIGN SEEDS — hand-curated intent. The generator expands these.
// =============================================================================

type CampaignSeed = {
    id: string;
    name: string;
    campaign_type: 'global_launch' | 'always_on' | 'local_activation' | 'seasonal' | 'retail_partner';
    start_date: string;
    end_date: string;
    commissioned_by: string; // brand-team id
    runs_in: string[];        // market ids
    uses_channels: string[];  // channel ids
    objectives: string[];     // objective ids
    budget_gbp: number;
    summary: string;
    // Tuning knobs:
    global_assets_to_create: number;   // how many global master assets this campaign creates
    localisations_per_market: number;  // how many localisation executions per (market, channel)
    local_campaigns_per_market: number; // pure local-campaign executions per (market, channel)
};

const CAMPAIGN_SEEDS: CampaignSeed[] = [
    {
        id: 'campaign:spring-2024-retinoid-pm-anniversary',
        name: 'Retinoid PM 4-Year Anniversary',
        campaign_type: 'global_launch',
        start_date: '2024-03-04',
        end_date: '2024-05-31',
        commissioned_by: 'brand-team:aurelune-global',
        runs_in: ['market:UK', 'market:US', 'market:DE', 'market:FR'],
        uses_channels: ['channel:SOCIAL_MEDIA', 'channel:OOH', 'channel:D2C', 'channel:ECRM', 'channel:PAID_MEDIA'],
        objectives: ['objective:retinoid-hero-defence', 'objective:global-brand-awareness', 'objective:global-science-authority'],
        budget_gbp: 920000,
        summary: 'Celebrate four years of Retinoid PM Serum with a science-led campaign that defends its hero position.',
        global_assets_to_create: 6,
        localisations_per_market: 2,
        local_campaigns_per_market: 0,
    },
    {
        id: 'campaign:always-on-d2c-2024',
        name: 'Always-On D2C Programme 2024',
        campaign_type: 'always_on',
        start_date: '2024-01-15',
        end_date: '2024-12-31',
        commissioned_by: 'brand-team:aurelune-global',
        runs_in: ['market:UK', 'market:US', 'market:DE', 'market:FR'],
        uses_channels: ['channel:PAID_MEDIA', 'channel:ECRM', 'channel:SEO', 'channel:D2C'],
        objectives: ['objective:efficient-paid-spend', 'objective:reduce-cac', 'objective:loyalty-programme-scale', 'objective:aeo-geo-readiness'],
        budget_gbp: 1400000,
        summary: 'The always-on engine: paid acquisition + ECRM nurture + organic search.',
        global_assets_to_create: 4,
        localisations_per_market: 4,
        local_campaigns_per_market: 1,
    },
    {
        id: 'campaign:sephora-us-launch-y1',
        name: 'Sephora US Launch — Year 1',
        campaign_type: 'retail_partner',
        start_date: '2024-08-01',
        end_date: '2025-07-31',
        commissioned_by: 'brand-team:aurelune-us',
        runs_in: ['market:US'],
        uses_channels: ['channel:B2B2C', 'channel:POSM', 'channel:OOH', 'channel:PAID_MEDIA', 'channel:SOCIAL_MEDIA', 'channel:EVENT'],
        objectives: ['objective:us-retail-expansion', 'objective:b2b2c-sephora-success', 'objective:us-acquisition'],
        budget_gbp: 1850000,
        summary: 'Launch and Year-1 activation across 240 Sephora US doors. POSM, in-store events, supporting paid + social.',
        global_assets_to_create: 5,
        localisations_per_market: 8,
        local_campaigns_per_market: 6,
    },
    {
        id: 'campaign:jp-tokyo-launch-2024',
        name: 'Japan Launch — Tokyo Residency',
        campaign_type: 'local_activation',
        start_date: '2024-04-01',
        end_date: '2024-09-30',
        commissioned_by: 'brand-team:aurelune-jp',
        runs_in: ['market:JP'],
        uses_channels: ['channel:EVENT', 'channel:OOH', 'channel:SOCIAL_MEDIA', 'channel:ECRM', 'channel:D2C', 'channel:RESEARCH'],
        objectives: ['objective:jp-launch', 'objective:global-brand-awareness'],
        budget_gbp: 420000,
        summary: 'Six-month Tokyo concept-store residency, LINE loyalty programme, supporting OOH + social.',
        global_assets_to_create: 2,
        localisations_per_market: 6,
        local_campaigns_per_market: 4,
    },
    {
        id: 'campaign:spring-2025-hero-refresh',
        name: 'Spring 2025 Hero Refresh — AM Phase Education',
        campaign_type: 'global_launch',
        start_date: '2025-02-17',
        end_date: '2025-05-30',
        commissioned_by: 'brand-team:aurelune-global',
        runs_in: ['market:UK', 'market:US', 'market:DE', 'market:FR', 'market:JP'],
        uses_channels: ['channel:SOCIAL_MEDIA', 'channel:OOH', 'channel:D2C', 'channel:ECRM', 'channel:PAID_MEDIA', 'channel:EVENT'],
        objectives: ['objective:global-brand-awareness', 'objective:global-science-authority', 'objective:always-on-content-engine'],
        budget_gbp: 1180000,
        summary: 'Refresh the AM-phase narrative — Bakuchiol Day Fluid as the daily protector. Editorial-led, evidence-rich.',
        global_assets_to_create: 7,
        localisations_per_market: 3,
        local_campaigns_per_market: 0,
    },
    {
        id: 'campaign:cn-xiaohongshu-always-on-2025',
        name: 'CN Xiaohongshu Always-On 2025',
        campaign_type: 'always_on',
        start_date: '2025-01-15',
        end_date: '2025-12-31',
        commissioned_by: 'brand-team:aurelune-cn',
        runs_in: ['market:CN'],
        uses_channels: ['channel:SOCIAL_MEDIA', 'channel:D2C', 'channel:OOH'],
        objectives: ['objective:cn-cross-border-launch', 'objective:always-on-influencer'],
        budget_gbp: 380000,
        summary: 'Always-on Xiaohongshu UGC programme + Tier-1 airport OOH for cross-border buyers.',
        global_assets_to_create: 1,
        localisations_per_market: 6,
        local_campaigns_per_market: 6,
    },
    {
        id: 'campaign:annual-ooh-flagship-2025',
        name: 'Annual OOH Flagship 2025 — Two Phases. One Skin.',
        campaign_type: 'global_launch',
        start_date: '2025-09-01',
        end_date: '2025-11-30',
        commissioned_by: 'brand-team:aurelune-global',
        runs_in: ['market:UK', 'market:US'],
        uses_channels: ['channel:OOH', 'channel:SOCIAL_MEDIA', 'channel:D2C', 'channel:PAID_MEDIA'],
        objectives: ['objective:ooh-flagship-moment', 'objective:global-brand-awareness'],
        budget_gbp: 1450000,
        summary: 'The 2025 flagship OOH moment. London + NYC. Two phases. One skin.',
        global_assets_to_create: 5,
        localisations_per_market: 4,
        local_campaigns_per_market: 0,
    },
    {
        id: 'campaign:always-on-d2c-2025',
        name: 'Always-On D2C Programme 2025',
        campaign_type: 'always_on',
        start_date: '2025-01-13',
        end_date: '2025-12-31',
        commissioned_by: 'brand-team:aurelune-global',
        runs_in: ['market:UK', 'market:US', 'market:DE', 'market:FR', 'market:JP'],
        uses_channels: ['channel:PAID_MEDIA', 'channel:ECRM', 'channel:SEO', 'channel:D2C'],
        objectives: ['objective:efficient-paid-spend', 'objective:reduce-cac', 'objective:loyalty-programme-scale', 'objective:aeo-geo-readiness', 'objective:always-on-content-engine'],
        budget_gbp: 1850000,
        summary: 'The always-on engine continued — now with the AEO/GEO content layer baked in.',
        global_assets_to_create: 6,
        localisations_per_market: 4,
        local_campaigns_per_market: 1,
    },
    {
        id: 'campaign:de-rebuild-2025',
        name: 'DE Rebuild — Sensitive-Skin Focus',
        campaign_type: 'local_activation',
        start_date: '2025-03-10',
        end_date: '2025-09-30',
        commissioned_by: 'brand-team:aurelune-de',
        runs_in: ['market:DE'],
        uses_channels: ['channel:PAID_MEDIA', 'channel:SEO', 'channel:ECRM', 'channel:D2C', 'channel:RESEARCH'],
        objectives: ['objective:de-rebuild-awareness', 'objective:reduce-cac'],
        budget_gbp: 380000,
        summary: 'Reset DE positioning around sensitive-skin and Gentle Gemma. Heavy on evidence, dermatology endorsements.',
        global_assets_to_create: 2,
        localisations_per_market: 5,
        local_campaigns_per_market: 4,
    },
    {
        id: 'campaign:resurfacing-oil-launch-h1-2026',
        name: 'Resurfacing Ritual Oil — Refresh H1 2026',
        campaign_type: 'seasonal',
        start_date: '2026-02-10',
        end_date: '2026-05-15',
        commissioned_by: 'brand-team:aurelune-global',
        runs_in: ['market:UK', 'market:US', 'market:DE', 'market:FR'],
        uses_channels: ['channel:SOCIAL_MEDIA', 'channel:ECRM', 'channel:D2C', 'channel:PAID_MEDIA', 'channel:OOH'],
        objectives: ['objective:global-brand-awareness', 'objective:global-science-authority'],
        budget_gbp: 680000,
        summary: 'H1 2026 refresh for the Resurfacing Ritual Oil — reposition as the twice-weekly PM enhancer.',
        global_assets_to_create: 4,
        localisations_per_market: 2,
        local_campaigns_per_market: 0,
    },
];

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    console.log('Loading hand-curated KG…');

    const people: Node[] = await readJson(path.join(NODE_DIR, 'people.json'));
    const roles: Node[] = await readJson(path.join(NODE_DIR, 'roles.json'));
    const brandPeople: Node[] = await readJson(path.join(NODE_DIR, 'brand-people.json'));
    const products: Node[] = await readJson(path.join(NODE_DIR, 'products.json'));
    const objectives: Node[] = await readJson(path.join(NODE_DIR, 'objectives.json'));
    const kpis: Node[] = await readJson(path.join(NODE_DIR, 'kpis.json'));
    const markets: Node[] = await readJson(path.join(NODE_DIR, 'markets.json'));
    const channels: Node[] = await readJson(path.join(NODE_DIR, 'channels.json'));
    const budgets: Node[] = await readJson(path.join(NODE_DIR, 'budgets.json'));
    const agencyStructure: Edge[] = await readJson(path.join(EDGE_DIR, 'agency-structure.json'));

    // Quick lookup helpers
    const roleById = new Map(roles.map((r) => [r.id, r]));
    const personById = new Map(people.map((p) => [p.id, p]));
    const peopleByDept: Record<string, Node[]> = {};
    for (const p of people) {
        const dept = p.properties.department_id as string;
        (peopleByDept[dept] ||= []).push(p);
    }
    const peopleByChannelExperience: Record<string, Set<string>> = {};
    const peopleByCategoryExperience: Record<string, Set<string>> = {};
    for (const e of agencyStructure) {
        if (e.type === 'EXPERIENCED_IN' && e.to.startsWith('channel:')) {
            (peopleByChannelExperience[e.to] ||= new Set()).add(e.from);
        }
        if (e.type === 'EXPERIENCED_IN' && e.to.startsWith('category:')) {
            (peopleByCategoryExperience[e.to] ||= new Set()).add(e.from);
        }
    }
    const budgetByTeamYear = new Map<string, Node>();
    for (const b of budgets) {
        const k = `${b.properties.brand_team_id}|${b.properties.year}`;
        budgetByTeamYear.set(k, b);
    }
    const approverByTeam: Record<string, string> = {};
    for (const bp of brandPeople) {
        if (bp.properties.is_approver) {
            approverByTeam[bp.properties.team_id] = bp.id;
        }
    }

    // Output collections
    const campaigns: Node[] = [];
    const executions: Node[] = [];
    const approvalSteps: Node[] = [];
    const assets: Node[] = [];
    const assetVariants: Node[] = [];

    const campaignEdges: Edge[] = [];
    const executionLinks: Edge[] = [];
    const approvalEdges: Edge[] = [];
    const staffingEdges: Edge[] = [];

    const costLines: Record<string, any>[] = [];
    const timeTracking: Record<string, any>[] = [];
    const mediaSpend: Record<string, any>[] = [];

    let costLineCounter = 0;
    let timeEntryCounter = 0;
    let mediaSpendCounter = 0;
    let assetCounter = 0;
    let execCounterByYear: Record<number, number> = {};

    // -----------------------------------------------------------------------
    // Per-campaign expansion
    // -----------------------------------------------------------------------

    for (const seed of CAMPAIGN_SEEDS) {
        // Determine budget variance: ~1/3 on, ~1/3 over (+5–15%), ~1/3 under (−5–15%)
        const varianceRoll = rng();
        const varianceFactor =
            varianceRoll < 0.34 ? rngFloat(0.95, 1.0) :
            varianceRoll < 0.67 ? rngFloat(1.0, 1.04) :
                                  rngFloat(1.05, 1.18);
        const budgetActual = Math.round(seed.budget_gbp * varianceFactor);

        const status = (() => {
            const today = new Date('2026-05-14');
            const endD = new Date(seed.end_date);
            const startD = new Date(seed.start_date);
            if (endD < today) return 'shipped';
            if (startD <= today && endD >= today) return 'in_progress';
            return 'planned';
        })();

        campaigns.push({
            id: seed.id,
            type: 'Campaign',
            properties: {
                name: seed.name,
                campaign_type: seed.campaign_type,
                start_date: seed.start_date,
                end_date: seed.end_date,
                status,
                budget_planned: seed.budget_gbp,
                budget_actual: budgetActual,
                currency: 'GBP',
                summary: seed.summary,
            },
        });

        // ORCHESTRATES, COMMISSIONED_BY, RUNS_IN, USES_CHANNEL
        campaignEdges.push({ from: 'agency:halo-helix', to: seed.id, type: 'ORCHESTRATES' });
        campaignEdges.push({ from: seed.id, to: seed.commissioned_by, type: 'COMMISSIONED_BY' });
        for (const mkt of seed.runs_in) {
            campaignEdges.push({ from: seed.id, to: mkt, type: 'RUNS_IN' });
        }
        for (const ch of seed.uses_channels) {
            campaignEdges.push({ from: seed.id, to: ch, type: 'USES_CHANNEL' });
        }
        for (const obj of seed.objectives) {
            campaignEdges.push({ from: seed.id, to: obj, type: 'HAS_OBJECTIVE' });
        }

        // DRAWS_FROM budget(s): figure out which years this campaign spans, draw from each
        const startYear = new Date(seed.start_date).getUTCFullYear();
        const endYear = new Date(seed.end_date).getUTCFullYear();
        const brandTeamId = seed.commissioned_by;
        let remaining = seed.budget_gbp;
        for (let y = startYear; y <= endYear; y++) {
            const k = `${brandTeamId}|${y}`;
            const b = budgetByTeamYear.get(k);
            if (b) {
                const draw = Math.round(remaining / (endYear - y + 1));
                campaignEdges.push({
                    from: seed.id, to: b.id, type: 'DRAWS_FROM',
                    properties: { draw_amount: draw },
                });
                remaining -= draw;
            }
        }

        // ---- Generate executions ----

        // 1) Global asset creation executions (only for global_launch / always_on / seasonal)
        const globalAssetsFor = ['global_launch', 'always_on', 'seasonal'].includes(seed.campaign_type)
            ? seed.global_assets_to_create
            : 0;

        const createdAssets: { id: string; channel: string }[] = [];

        for (let i = 0; i < globalAssetsFor; i++) {
            const channel = rngPick(seed.uses_channels);
            // execution dates: somewhere in the first third of the campaign
            const campStart = new Date(seed.start_date);
            const campEnd = new Date(seed.end_date);
            const durDays = (campEnd.getTime() - campStart.getTime()) / 86400000;
            const offset = Math.floor(rngFloat(0, durDays / 3));
            const length = rngInt(15, 30);
            const plannedStart = addDays(campStart, offset);
            const plannedEnd = addDays(plannedStart, length);
            const exec = makeExecution({
                campaignId: seed.id,
                campaignStatus: status,
                campaignBudget: seed.budget_gbp,
                executionType: 'global_asset_creation',
                channel,
                market: 'market:UK', // global asset creation is led from London
                plannedStart,
                plannedEnd,
                summary: `Global asset creation for ${seed.name} — ${channel.replace('channel:', '')}`,
                execCounterByYear,
            });
            executions.push(exec);
            executionLinks.push({ from: exec.id, to: seed.id, type: 'PART_OF' });
            executionLinks.push({ from: exec.id, to: 'market:UK', type: 'TARGETS' });
            executionLinks.push({ from: exec.id, to: channel, type: 'DELIVERS_IN' });

            // Produce 1-2 master assets per global asset creation execution
            const numAssets = rngInt(1, 2);
            for (let a = 0; a < numAssets; a++) {
                assetCounter++;
                const assetId = `asset:asset-${new Date(seed.start_date).getUTCFullYear()}-${String(assetCounter).padStart(3, '0')}`;
                const assetType = pickAssetType(channel);
                const product = rngPick(products);
                assets.push({
                    id: assetId,
                    type: 'Asset',
                    properties: {
                        name: `${product.properties.name} — ${channel.replace('channel:', '')} ${assetType}`,
                        asset_type: assetType,
                        file_path: `data/knowledge-graph/brand-book/assets/.placeholders/${assetId.replace('asset:', '')}.${pickAssetExt(assetType)}`,
                        format: pickAssetExt(assetType),
                        depicts_product_id: product.id,
                    },
                });
                executionLinks.push({ from: exec.id, to: assetId, type: 'PRODUCES' });
                createdAssets.push({ id: assetId, channel });
            }

            // Approvals, staffing, costs, time, media for this exec
            applyExecutionExtras(exec, seed, channel, status);
        }

        // 2) Localisation executions (for each market in scope × channels, generate N)
        for (const market of seed.runs_in) {
            if (market === 'market:UK' && seed.campaign_type !== 'always_on' && seed.campaign_type !== 'local_activation') {
                // UK localisations sometimes redundant with global creation
                if (seed.localisations_per_market <= 1) continue;
            }
            for (const channel of seed.uses_channels) {
                const count = seed.localisations_per_market > 0
                    ? Math.max(1, Math.floor(seed.localisations_per_market * (1 - 0.2 * rng())))
                    : 0;
                for (let i = 0; i < count; i++) {
                    const campStart = new Date(seed.start_date);
                    const campEnd = new Date(seed.end_date);
                    const durDays = (campEnd.getTime() - campStart.getTime()) / 86400000;
                    const offset = Math.floor(rngFloat(durDays / 4, durDays * 0.85));
                    const length = rngInt(8, 18);
                    const plannedStart = addDays(campStart, offset);
                    const plannedEnd = addDays(plannedStart, length);
                    const exec = makeExecution({
                        campaignId: seed.id,
                        campaignStatus: status,
                        campaignBudget: seed.budget_gbp,
                        executionType: 'localisation',
                        channel,
                        market,
                        plannedStart,
                        plannedEnd,
                        summary: `Localise ${seed.name} — ${market.replace('market:', '')} ${channel.replace('channel:', '')}`,
                        execCounterByYear,
                    });
                    executions.push(exec);
                    executionLinks.push({ from: exec.id, to: seed.id, type: 'PART_OF' });
                    executionLinks.push({ from: exec.id, to: market, type: 'TARGETS' });
                    executionLinks.push({ from: exec.id, to: channel, type: 'DELIVERS_IN' });

                    // Pick a master asset to localise (if any exist for this channel)
                    const candidateMasters = createdAssets.filter((a) => a.channel === channel);
                    if (candidateMasters.length > 0) {
                        const master = rngPick(candidateMasters);
                        const execSuffix = exec.id.replace('execution:exec-', '');
                        const variantId = `asset-variant:${master.id.replace('asset:', '')}-${market.replace('market:', '').toLowerCase()}-${execSuffix}`;
                        assetVariants.push({
                            id: variantId,
                            type: 'AssetVariant',
                            properties: {
                                name: `${master.id.replace('asset:', '')} — ${market.replace('market:', '')} variant`,
                                master_asset_id: master.id,
                                market_id: market,
                                file_path: `data/knowledge-graph/brand-book/assets/.placeholders/${variantId.replace('asset-variant:', '')}.png`,
                                localisation_type: pickLocalisationType(),
                                language_code: marketLanguage(market),
                            },
                        });
                        executionLinks.push({ from: exec.id, to: variantId, type: 'PRODUCES' });
                        executionLinks.push({ from: variantId, to: master.id, type: 'LOCALISES' });
                    }

                    applyExecutionExtras(exec, seed, channel, status);
                }
            }
        }

        // 3) Local campaign executions (pure local — no global master to localise)
        for (const market of seed.runs_in) {
            for (const channel of seed.uses_channels) {
                const count = seed.local_campaigns_per_market;
                for (let i = 0; i < count; i++) {
                    const campStart = new Date(seed.start_date);
                    const campEnd = new Date(seed.end_date);
                    const durDays = (campEnd.getTime() - campStart.getTime()) / 86400000;
                    const offset = Math.floor(rngFloat(0, durDays * 0.9));
                    const length = rngInt(10, 25);
                    const plannedStart = addDays(campStart, offset);
                    const plannedEnd = addDays(plannedStart, length);
                    const exec = makeExecution({
                        campaignId: seed.id,
                        campaignStatus: status,
                        campaignBudget: seed.budget_gbp,
                        executionType: 'local_campaign',
                        channel,
                        market,
                        plannedStart,
                        plannedEnd,
                        summary: `Local ${channel.replace('channel:', '')} campaign — ${market.replace('market:', '')}`,
                        execCounterByYear,
                    });
                    executions.push(exec);
                    executionLinks.push({ from: exec.id, to: seed.id, type: 'PART_OF' });
                    executionLinks.push({ from: exec.id, to: market, type: 'TARGETS' });
                    executionLinks.push({ from: exec.id, to: channel, type: 'DELIVERS_IN' });

                    applyExecutionExtras(exec, seed, channel, status);
                }
            }
        }
    }

    // -----------------------------------------------------------------------
    // MEASURED_BY edges — objectives → KPIs (simple mapping by name affinity)
    // -----------------------------------------------------------------------

    const objKpiMap: Record<string, string[]> = {
        'objective:global-brand-awareness': ['kpi:aided-brand-awareness-uk', 'kpi:aided-brand-awareness-us', 'kpi:aided-brand-awareness-de', 'kpi:aided-brand-awareness-fr', 'kpi:aided-brand-awareness-jp', 'kpi:share-of-voice-chronobiology', 'kpi:editorial-features-tier-1'],
        'objective:global-science-authority': ['kpi:share-of-voice-chronobiology', 'kpi:editorial-features-tier-1', 'kpi:white-paper-downloads', 'kpi:ai-citation-share', 'kpi:dermatologist-creators-roster'],
        'objective:uk-d2c-growth': ['kpi:uk-d2c-revenue', 'kpi:roas-uk'],
        'objective:us-acquisition': ['kpi:us-new-customers-2025', 'kpi:blended-cac-global'],
        'objective:us-retail-expansion': ['kpi:sephora-door-count-us', 'kpi:sephora-sell-through-y1', 'kpi:sephora-rank-treatments'],
        'objective:de-rebuild-awareness': ['kpi:aided-brand-awareness-de', 'kpi:de-d2c-revenue', 'kpi:roas-de'],
        'objective:fr-ritual-story': ['kpi:aided-brand-awareness-fr', 'kpi:fr-d2c-revenue', 'kpi:editorial-features-tier-1'],
        'objective:jp-launch': ['kpi:aided-brand-awareness-jp', 'kpi:jp-revenue', 'kpi:line-loyalty-jp', 'kpi:roas-jp'],
        'objective:cn-cross-border-launch': ['kpi:cn-revenue', 'kpi:xiaohongshu-organic-mentions'],
        'objective:retinoid-hero-defence': ['kpi:retinoid-pm-share-of-revenue'],
        'objective:always-on-content-engine': ['kpi:content-articles-published', 'kpi:white-paper-downloads', 'kpi:ai-citation-share'],
        'objective:loyalty-programme-scale': ['kpi:loyalty-enrolment-pct', 'kpi:loyalty-member-repeat-uplift', 'kpi:loyalty-ltv-uplift'],
        'objective:ooh-flagship-moment': ['kpi:ooh-prompted-recall-uk', 'kpi:ooh-prompted-recall-us'],
        'objective:aeo-geo-readiness': ['kpi:ai-citation-share', 'kpi:pdp-faq-schema-coverage'],
        'objective:b2b2c-sephora-success': ['kpi:sephora-rank-treatments', 'kpi:sephora-sell-through-y1'],
        'objective:b2b-pro-channel-launch': ['kpi:dermatologist-creators-roster'],
        'objective:efficient-paid-spend': ['kpi:blended-roas-global', 'kpi:roas-uk', 'kpi:roas-us', 'kpi:roas-de', 'kpi:roas-fr', 'kpi:roas-jp'],
        'objective:reduce-cac': ['kpi:blended-cac-global'],
        'objective:claim-substantiation-fy25': ['kpi:consumer-panels-completed', 'kpi:tier-a-claims-substantiated'],
        'objective:always-on-influencer': ['kpi:dermatologist-creators-roster', 'kpi:xiaohongshu-organic-mentions'],
    };

    const measuredByEdges: Edge[] = [];
    for (const [obj, kpiIds] of Object.entries(objKpiMap)) {
        for (const k of kpiIds) {
            measuredByEdges.push({ from: obj, to: k, type: 'MEASURED_BY' });
        }
    }
    campaignEdges.push(...measuredByEdges);

    // -----------------------------------------------------------------------
    // Write everything out
    // -----------------------------------------------------------------------

    console.log(`Writing ${campaigns.length} campaigns, ${executions.length} executions, ${approvalSteps.length} approval steps`);
    console.log(`        ${assets.length} assets, ${assetVariants.length} asset variants`);
    console.log(`Edges:  campaign-structure ${campaignEdges.length}, execution-links ${executionLinks.length}, approvals ${approvalEdges.length}, staffing ${staffingEdges.length}`);
    console.log(`CSV:    cost-lines ${costLines.length}, time-tracking ${timeTracking.length}, media-spend ${mediaSpend.length}`);

    await writeJson(path.join(NODE_DIR, 'campaigns.json'), campaigns);
    await writeJson(path.join(NODE_DIR, 'executions.json'), executions);
    await writeJson(path.join(NODE_DIR, 'approval-steps.json'), approvalSteps);
    await writeJson(path.join(NODE_DIR, 'assets.json'), assets);
    await writeJson(path.join(NODE_DIR, 'asset-variants.json'), assetVariants);

    await writeJson(path.join(EDGE_DIR, 'campaign-structure.json'), campaignEdges);
    await writeJson(path.join(EDGE_DIR, 'execution-links.json'), executionLinks);
    await writeJson(path.join(EDGE_DIR, 'approvals.json'), approvalEdges);
    await writeJson(path.join(EDGE_DIR, 'staffing.json'), staffingEdges);

    await writeCsv(path.join(TABLE_DIR, 'cost-lines.csv'), costLines);
    await writeCsv(path.join(TABLE_DIR, 'time-tracking.csv'), timeTracking);
    await writeCsv(path.join(TABLE_DIR, 'media-spend.csv'), mediaSpend);

    console.log('Done.');

    // =========================================================================
    // Helpers (closed over state above)
    // =========================================================================

    function makeExecution(args: {
        campaignId: string;
        campaignStatus: string;
        campaignBudget: number;
        executionType: 'global_asset_creation' | 'localisation' | 'local_campaign';
        channel: string;
        market: string;
        plannedStart: Date;
        plannedEnd: Date;
        summary: string;
        execCounterByYear: Record<number, number>;
    }): Node {
        const year = args.plannedStart.getUTCFullYear();
        args.execCounterByYear[year] = (args.execCounterByYear[year] || 0) + 1;
        const seq = String(args.execCounterByYear[year]).padStart(3, '0');
        const id = `execution:exec-${year}-${seq}`;

        // Schedule variance: ~⅓ on time, ~⅓ slightly late, ~⅓ noticeably late
        const slipRoll = rng();
        const slip = slipRoll < 0.34 ? 0 :
                     slipRoll < 0.67 ? rngInt(2, 6) :
                                       rngInt(7, 18);
        const actualStart = args.plannedStart;
        const actualEnd = addDays(args.plannedEnd, slip);

        // Budget at execution level
        const baseExecBudget = args.executionType === 'global_asset_creation'
            ? rngInt(28000, 90000)
            : args.executionType === 'localisation'
                ? rngInt(6000, 18000)
                : rngInt(10000, 32000);
        const varianceRoll = rng();
        const varianceFactor =
            varianceRoll < 0.34 ? rngFloat(0.92, 0.99) :
            varianceRoll < 0.67 ? rngFloat(1.0, 1.04) :
                                  rngFloat(1.06, 1.22);
        const budgetActual = Math.round(baseExecBudget * varianceFactor);

        const today = new Date('2026-05-14');
        const status = actualEnd < today ? 'shipped' :
                       actualStart <= today && actualEnd >= today ? 'in_progress' :
                       'planned';

        return {
            id,
            type: 'Execution',
            properties: {
                name: args.summary,
                execution_type: args.executionType,
                status,
                planned_start: isoDate(args.plannedStart),
                planned_end: isoDate(args.plannedEnd),
                actual_start: isoDate(actualStart),
                actual_end: isoDate(actualEnd),
                budget_planned: baseExecBudget,
                budget_actual: budgetActual,
                currency: 'GBP',
                summary: args.summary,
                internal_review_planned_days: 5,
                client_review_planned_days: 3,
            },
        };
    }

    function applyExecutionExtras(exec: Node, seed: CampaignSeed, channel: string, campaignStatus: string) {
        // ApprovalSteps
        const plannedEnd = new Date(exec.properties.planned_end as string);
        const actualEnd = new Date(exec.properties.actual_end as string);

        // Internal review: starts at planned_end, 5 working days planned
        const internalPlannedStart = plannedEnd;
        const internalPlannedEnd = addWorkingDays(internalPlannedStart, 5);
        const internalVarianceRoll = rng();
        const internalActualDays = internalVarianceRoll < 0.34 ? 5 :
                                   internalVarianceRoll < 0.67 ? rngInt(6, 7) :
                                                                 rngInt(8, 11);
        const internalActualEnd = addWorkingDays(internalPlannedStart, internalActualDays);
        const internalId = `approval:${exec.id.replace('execution:', '')}-internal`;
        approvalSteps.push({
            id: internalId,
            type: 'ApprovalStep',
            properties: {
                gate: 'internal_review',
                planned_duration_days: 5,
                actual_duration_days: internalActualDays,
                planned_start: isoDate(internalPlannedStart),
                planned_end: isoDate(internalPlannedEnd),
                actual_start: isoDate(internalPlannedStart),
                actual_end: isoDate(internalActualEnd),
                status: campaignStatus === 'planned' ? 'pending' : 'approved',
                outcome: campaignStatus === 'planned' ? null : (rng() < 0.85 ? 'approved' : 'approved_with_revisions'),
            },
        });
        executionLinks.push({ from: exec.id, to: internalId, type: 'REQUIRES_APPROVAL' });
        approvalEdges.push({ from: exec.id, to: internalId, type: 'REQUIRES_APPROVAL' });

        // Pick an internal approver — Tom (ECD) for creative-heavy channels, Maya (Strat Director) for strat-heavy, Aisha (GAD) otherwise
        const internalApprovers = ['channel:SOCIAL_MEDIA', 'channel:OOH', 'channel:POSM'].includes(channel)
            ? 'person:tom-hartley'
            : ['channel:PAID_MEDIA', 'channel:ECRM', 'channel:SEO'].includes(channel)
                ? 'person:ben-phillips'
                : 'person:aisha-bello';
        approvalEdges.push({ from: internalId, to: internalApprovers, type: 'APPROVED_BY' });

        // Client review: starts at internal actual end, 3 working days planned
        const clientPlannedStart = internalActualEnd;
        const clientPlannedEnd = addWorkingDays(clientPlannedStart, 3);
        const clientVarianceRoll = rng();
        const clientActualDays = clientVarianceRoll < 0.34 ? 3 :
                                 clientVarianceRoll < 0.67 ? rngInt(4, 5) :
                                                             rngInt(6, 9);
        const clientActualEnd = addWorkingDays(clientPlannedStart, clientActualDays);
        const clientId = `approval:${exec.id.replace('execution:', '')}-client`;
        approvalSteps.push({
            id: clientId,
            type: 'ApprovalStep',
            properties: {
                gate: 'client_review',
                planned_duration_days: 3,
                actual_duration_days: clientActualDays,
                planned_start: isoDate(clientPlannedStart),
                planned_end: isoDate(clientPlannedEnd),
                actual_start: isoDate(clientPlannedStart),
                actual_end: isoDate(clientActualEnd),
                status: campaignStatus === 'planned' ? 'pending' : 'approved',
                outcome: campaignStatus === 'planned' ? null : (rng() < 0.78 ? 'approved' : 'approved_with_revisions'),
            },
        });
        executionLinks.push({ from: exec.id, to: clientId, type: 'REQUIRES_APPROVAL' });
        approvalEdges.push({ from: exec.id, to: clientId, type: 'REQUIRES_APPROVAL' });
        const clientApprover = approverByTeam[seed.commissioned_by] || 'brand-person:eleanor-marchetti';
        approvalEdges.push({ from: clientId, to: clientApprover, type: 'APPROVED_BY' });

        // Staffing — pick a lead + 2-4 team members weighted by channel/category experience
        const teamSize = exec.properties.execution_type === 'global_asset_creation' ? rngInt(4, 6) :
                         exec.properties.execution_type === 'localisation' ? rngInt(2, 4) :
                                                                              rngInt(3, 5);
        const channelExperienced = Array.from(peopleByChannelExperience[channel] || new Set<string>());
        const categoryExperienced = Array.from(peopleByCategoryExperience['category:beauty'] || new Set<string>());
        const candidates = channelExperienced.length > 0
            ? channelExperienced.filter((p) => categoryExperienced.includes(p) || rng() < 0.4)
            : people.map((p) => p.id);

        // Pick lead: prefer senior/director among candidates
        const leadPool = candidates
            .map((pid) => personById.get(pid))
            .filter((p): p is Node => !!p && ['lead', 'senior', 'director'].includes(p.properties.seniority as string));
        const lead = leadPool.length ? rngPick(leadPool) : personById.get(rngPick(candidates))!;
        executionLinks.push({ from: exec.id, to: lead.id, type: 'LED_BY' });
        staffingEdges.push({ from: exec.id, to: lead.id, type: 'LED_BY' });

        // Pick team
        const teamCandidates = candidates.filter((p) => p !== lead.id);
        const team = teamCandidates.length > 0
            ? rngPickN(teamCandidates, Math.min(teamSize, teamCandidates.length))
            : [];

        // Calculate execution working window (days from actual_start to actual_end + approvals)
        const actualStart = new Date(exec.properties.actual_start as string);
        const totalWorkingDays = Math.max(5, Math.round(((actualEnd.getTime() - actualStart.getTime()) / 86400000) * 5 / 7));

        // Assign lead first
        const leadPlannedHours = Math.round(totalWorkingDays * 8 * rngFloat(0.35, 0.6));
        const leadActualHours = Math.round(leadPlannedHours * rngFloat(0.92, 1.18));
        staffingEdges.push({
            from: lead.id, to: exec.id, type: 'ASSIGNED_TO',
            properties: { role: 'lead', planned_hours: leadPlannedHours, actual_hours: leadActualHours },
        });

        // Add cost line for lead
        const leadRole = roleById.get(lead.properties.role_id as string);
        const leadRate = lead.properties.daily_rate_gbp as number;
        const leadMarkup = lead.properties.client_markup_pct as number;
        const leadDays = Math.round(leadActualHours / 8);
        costLineCounter++;
        costLines.push({
            cost_line_id: `cl-${exec.properties.actual_start as string}-${String(costLineCounter).padStart(5, '0')}`,
            execution_id: exec.id,
            contract_id: seed.commissioned_by === 'brand-team:aurelune-jp' ? 'contract:aurelune-jp-addendum-2024' :
                          seed.commissioned_by === 'brand-team:aurelune-cn' ? 'contract:aurelune-cn-addendum-2024' :
                          'contract:aurelune-master-2024',
            person_id: lead.id,
            role_id: lead.properties.role_id,
            line_type: 'fee_time',
            units: leadDays,
            unit_cost: leadRate,
            markup_pct: leadMarkup,
            currency: 'GBP',
            billed_date: exec.properties.actual_end,
            notes: `Lead time, ${leadRole?.properties.name || ''}`,
        });

        // Time tracking entries for lead — spread across weeks
        const weeksSpanned = Math.max(1, Math.round(totalWorkingDays / 5));
        for (let w = 0; w < weeksSpanned; w++) {
            const weekDate = addDays(actualStart, w * 7);
            const weekHours = Math.round(leadActualHours / weeksSpanned + rngFloat(-2, 2));
            timeEntryCounter++;
            timeTracking.push({
                time_entry_id: `te-${isoDate(weekDate)}-${String(timeEntryCounter).padStart(6, '0')}`,
                execution_id: exec.id,
                person_id: lead.id,
                week_starting: weekStarting(weekDate),
                planned_hours: Math.round(leadPlannedHours / weeksSpanned),
                actual_hours: Math.max(0, weekHours),
                notes: '',
            });
        }

        // Team members
        for (const memberId of team) {
            const member = personById.get(memberId)!;
            const role = roleById.get(member.properties.role_id as string);
            const memberPlannedHours = Math.round(totalWorkingDays * 8 * rngFloat(0.2, 0.5));
            const memberActualHours = Math.round(memberPlannedHours * rngFloat(0.85, 1.25));
            staffingEdges.push({
                from: member.id, to: exec.id, type: 'ASSIGNED_TO',
                properties: { role: 'contributor', planned_hours: memberPlannedHours, actual_hours: memberActualHours },
            });

            const memberRate = member.properties.daily_rate_gbp as number;
            const memberMarkup = member.properties.client_markup_pct as number;
            const memberDays = Math.round(memberActualHours / 8);
            if (memberDays > 0) {
                costLineCounter++;
                costLines.push({
                    cost_line_id: `cl-${exec.properties.actual_start as string}-${String(costLineCounter).padStart(5, '0')}`,
                    execution_id: exec.id,
                    contract_id: seed.commissioned_by === 'brand-team:aurelune-jp' ? 'contract:aurelune-jp-addendum-2024' :
                                  seed.commissioned_by === 'brand-team:aurelune-cn' ? 'contract:aurelune-cn-addendum-2024' :
                                  'contract:aurelune-master-2024',
                    person_id: member.id,
                    role_id: member.properties.role_id,
                    line_type: 'fee_time',
                    units: memberDays,
                    unit_cost: memberRate,
                    markup_pct: memberMarkup,
                    currency: 'GBP',
                    billed_date: exec.properties.actual_end,
                    notes: `${role?.properties.name || ''} time`,
                });
            }

            for (let w = 0; w < weeksSpanned; w++) {
                const weekDate = addDays(actualStart, w * 7);
                const weekHours = Math.round(memberActualHours / weeksSpanned + rngFloat(-3, 3));
                timeEntryCounter++;
                timeTracking.push({
                    time_entry_id: `te-${isoDate(weekDate)}-${String(timeEntryCounter).padStart(6, '0')}`,
                    execution_id: exec.id,
                    person_id: member.id,
                    week_starting: weekStarting(weekDate),
                    planned_hours: Math.round(memberPlannedHours / weeksSpanned),
                    actual_hours: Math.max(0, weekHours),
                    notes: '',
                });
            }
        }

        // Production / pass-through / media-spend costs
        if (exec.properties.execution_type === 'global_asset_creation') {
            const prod = rngInt(8000, 35000);
            costLineCounter++;
            costLines.push({
                cost_line_id: `cl-${exec.properties.actual_start as string}-${String(costLineCounter).padStart(5, '0')}`,
                execution_id: exec.id,
                contract_id: 'contract:aurelune-master-2024',
                person_id: '',
                role_id: '',
                line_type: 'production_cost',
                units: 1,
                unit_cost: prod,
                markup_pct: 0.15,
                currency: 'GBP',
                billed_date: exec.properties.actual_end,
                notes: `Production — ${channel.replace('channel:', '')}`,
            });
        }
        if (exec.properties.execution_type === 'localisation') {
            const loc = rngInt(1200, 6000);
            costLineCounter++;
            costLines.push({
                cost_line_id: `cl-${exec.properties.actual_start as string}-${String(costLineCounter).padStart(5, '0')}`,
                execution_id: exec.id,
                contract_id: seed.commissioned_by === 'brand-team:aurelune-jp' ? 'contract:aurelune-jp-addendum-2024' :
                              seed.commissioned_by === 'brand-team:aurelune-cn' ? 'contract:aurelune-cn-addendum-2024' :
                              'contract:aurelune-master-2024',
                person_id: '',
                role_id: '',
                line_type: 'localisation_cost',
                units: 1,
                unit_cost: loc,
                markup_pct: 0.15,
                currency: 'GBP',
                billed_date: exec.properties.actual_end,
                notes: `Localisation costs — partner translation/production`,
            });
        }
        if (['channel:PAID_MEDIA', 'channel:OOH'].includes(channel)) {
            const mediaAmount = channel === 'channel:PAID_MEDIA' ? rngInt(15000, 80000) : rngInt(40000, 220000);
            const variance = rngFloat(0.88, 1.12);
            mediaSpendCounter++;
            const market = (executionLinks.find((e) => e.from === exec.id && e.type === 'TARGETS')?.to) || 'market:UK';
            mediaSpend.push({
                media_spend_id: `ms-${exec.properties.actual_start as string}-${String(mediaSpendCounter).padStart(4, '0')}`,
                execution_id: exec.id,
                market_id: market,
                channel_id: channel,
                platform: channel === 'channel:PAID_MEDIA' ? rngPick(['Meta', 'TikTok', 'Google', 'Pinterest']) : rngPick(['JCDecaux', 'Clear Channel', 'Ocean Outdoor', 'Sapience']),
                planned_spend: mediaAmount,
                actual_spend: Math.round(mediaAmount * variance),
                currency: 'GBP',
                period_start: exec.properties.actual_start,
                period_end: exec.properties.actual_end,
            });
        }
    }
}

function pickAssetType(channel: string): string {
    if (channel === 'channel:SOCIAL_MEDIA') return rngPick(['social_template', 'product_image', 'lifestyle_image']);
    if (channel === 'channel:OOH') return rngPick(['ooh_template', 'lifestyle_image']);
    if (channel === 'channel:POSM') return rngPick(['ooh_template', 'product_image']);
    if (channel === 'channel:D2C') return rngPick(['product_image', 'lifestyle_image']);
    if (channel === 'channel:ECRM') return 'social_template';
    return 'product_image';
}

function pickAssetExt(type: string): string {
    if (type === 'social_template' || type === 'ooh_template') return 'svg';
    return 'png';
}

function pickLocalisationType(): string {
    const r = rng();
    if (r < 0.1) return 'full_reshoot';
    if (r < 0.45) return 'copy_only';
    if (r < 0.7) return 'subtitled';
    if (r < 0.85) return 'voiced_over';
    return 'claims_adapted';
}

function marketLanguage(market: string): string {
    return {
        'market:UK': 'en-GB',
        'market:US': 'en-US',
        'market:DE': 'de-DE',
        'market:FR': 'fr-FR',
        'market:JP': 'ja-JP',
        'market:CN': 'zh-CN',
    }[market] || 'en';
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
