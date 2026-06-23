/**
 * Knowledge Graph Loader — server-side
 *
 * Loads the hand-curated + generated KG files from /data/knowledge-graph/.
 * All functions are cached per-request via React's cache(). Server components
 * import these directly; client components fetch via API routes (none yet).
 */

import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';

const KG_DIR = path.join(process.cwd(), 'data', 'knowledge-graph');
const NODE_DIR = path.join(KG_DIR, 'nodes');
const EDGE_DIR = path.join(KG_DIR, 'edges');
const TABLE_DIR = path.join(KG_DIR, 'tables');

// ===========================================================================
// Types
// ===========================================================================

export type KgNode<T = Record<string, any>> = {
    id: string;
    type: string;
    properties: T;
};

export type KgEdge<T = Record<string, any>> = {
    from: string;
    to: string;
    type: string;
    properties?: T;
};

// Property shapes for the most-used node types

export type BrandProps = { name: string; category: string; founded_year: number; hq_city: string; tagline: string; positioning?: string; website?: string };
export type ProductProps = { name: string; sku: string; line: string; ritual: string; size_ml: number; cogs_gbp: number; rrp_gbp: number; margin_pct: number; hero_ingredients?: string[]; launch_date?: string };
export type PersonProps = { name: string; department_id: string; role_id: string; seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'director'; office: string; start_date: string; daily_rate_gbp: number; client_markup_pct: number; capacity_hours_per_week: number; utilisation_target_pct?: number; email?: string; is_active?: boolean };
export type CampaignProps = { name: string; campaign_type: string; start_date: string; end_date: string; status: string; budget_planned: number; budget_actual: number; currency: string; summary?: string };
export type ExecutionProps = { name: string; execution_type: 'global_asset_creation' | 'localisation' | 'local_campaign'; status: string; planned_start: string; planned_end: string; actual_start: string; actual_end: string; budget_planned: number; budget_actual: number; currency: string; summary?: string };
export type ApprovalProps = { gate: 'internal_review' | 'client_review'; planned_duration_days: number; actual_duration_days: number; planned_start: string; planned_end: string; actual_start: string; actual_end: string; status: string; outcome?: string | null };
export type BudgetProps = { name: string; year: number; brand_team_id: string; allocated_amount: number; currency: string; spent_amount?: number; notes?: string };
export type RoleProps = { name: string; department_id: string; seniority_band: string; default_daily_rate_gbp?: number; default_client_markup_pct?: number };
export type DepartmentProps = { name: string; agency_id: string };
export type SkillProps = { name: string; domain: string; description?: string };
export type MarketProps = { ref_id: string; label: string; currency: string; fx_to_gbp?: number; team_size_local?: number };
export type ChannelProps = { ref_id: string; label: string; description?: string };
export type PersonaProps = { name: string; archetype: string; doc_path: string; age_range?: string; income_band?: string; primary_motivation?: string };
export type BrandAssetProps = { name: string; asset_type: string; file_path: string; depicts_product_id?: string; format?: string; dimensions?: string; generation_prompt_ref?: string; generation_model?: string; market_variants?: Record<string, { generation_prompt_ref?: string; file_path: string }> };
export type AvailabilityProps = { person_id: string; start_date: string; end_date: string; allocation_pct: number; reason?: string };
export type AgentProps = {
    name: string;
    provider: string;
    model_id: string;
    modality: string;
    pricing_model: 'per_token' | 'per_seat';
    input_price_gbp_per_mtok?: number;
    output_price_gbp_per_mtok?: number;
    seat_gbp_per_month?: number;
    context_window_k: number;
    released?: string;
    status?: string;
    best_for?: string;
    skills: Array<{ skill_id: string; proficiency: number }>;
    channels: Array<{ channel_id: string; suitability: number }>;
};

// CSV row shapes
export type CostLineRow = { cost_line_id: string; execution_id: string; contract_id: string; person_id: string; role_id: string; line_type: string; units: string; unit_cost: string; markup_pct: string; currency: string; billed_date: string; notes: string };
export type TimeEntryRow = { time_entry_id: string; execution_id: string; person_id: string; week_starting: string; planned_hours: string; actual_hours: string; notes: string };
export type MediaSpendRow = { media_spend_id: string; execution_id: string; market_id: string; channel_id: string; platform: string; planned_spend: string; actual_spend: string; currency: string; period_start: string; period_end: string };
export type AgentUsageRow = { agent_usage_id: string; execution_id: string; agent_id: string; model_id: string; input_tokens: string; output_tokens: string; total_tokens: string; cost_gbp: string; task_type: string; billed_date: string };

// ===========================================================================
// Generic loaders (cached per request)
// ===========================================================================

async function readJsonArray<T>(file: string): Promise<T[]> {
    try {
        const data = await fs.readFile(file, 'utf-8');
        return JSON.parse(data) as T[];
    } catch (e: any) {
        if (e.code === 'ENOENT') return [];
        throw e;
    }
}

async function readMarkdown(file: string): Promise<string> {
    try {
        return await fs.readFile(file, 'utf-8');
    } catch (e: any) {
        if (e.code === 'ENOENT') return '';
        throw e;
    }
}

async function readCsv(file: string): Promise<Record<string, string>[]> {
    let text: string;
    try {
        text = await fs.readFile(file, 'utf-8');
    } catch (e: any) {
        if (e.code === 'ENOENT') return [];
        throw e;
    }
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',');
    return lines.slice(1).map((line) => {
        const cells: string[] = [];
        let cur = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
                if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
                else inQuote = !inQuote;
            } else if (c === ',' && !inQuote) {
                cells.push(cur);
                cur = '';
            } else {
                cur += c;
            }
        }
        cells.push(cur);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
        return row;
    });
}

// ===========================================================================
// Specific loaders
// ===========================================================================

export const getBrand = cache(async () => {
    const arr = await readJsonArray<KgNode<BrandProps>>(path.join(NODE_DIR, 'brand.json'));
    return arr[0] || null;
});

export const getProducts = cache(async () => readJsonArray<KgNode<ProductProps>>(path.join(NODE_DIR, 'products.json')));
export const getPersonas = cache(async () => readJsonArray<KgNode<PersonaProps>>(path.join(NODE_DIR, 'personas.json')));
export const getBrandAssets = cache(async () => readJsonArray<KgNode<BrandAssetProps>>(path.join(NODE_DIR, 'brand-assets.json')));
export const getMarkets = cache(async () => readJsonArray<KgNode<MarketProps>>(path.join(NODE_DIR, 'markets.json')));
export const getChannels = cache(async () => readJsonArray<KgNode<ChannelProps>>(path.join(NODE_DIR, 'channels.json')));
export const getDepartments = cache(async () => readJsonArray<KgNode<DepartmentProps>>(path.join(NODE_DIR, 'departments.json')));
export const getRoles = cache(async () => readJsonArray<KgNode<RoleProps>>(path.join(NODE_DIR, 'roles.json')));
export const getSkills = cache(async () => readJsonArray<KgNode<SkillProps>>(path.join(NODE_DIR, 'skills.json')));
export const getPeople = cache(async () => readJsonArray<KgNode<PersonProps>>(path.join(NODE_DIR, 'people.json')));
export const getCampaigns = cache(async () => readJsonArray<KgNode<CampaignProps>>(path.join(NODE_DIR, 'campaigns.json')));
export const getExecutions = cache(async () => readJsonArray<KgNode<ExecutionProps>>(path.join(NODE_DIR, 'executions.json')));
export const getApprovalSteps = cache(async () => readJsonArray<KgNode<ApprovalProps>>(path.join(NODE_DIR, 'approval-steps.json')));
export const getBudgets = cache(async () => readJsonArray<KgNode<BudgetProps>>(path.join(NODE_DIR, 'budgets.json')));
export const getBrandTeams = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'brand-teams.json')));
export const getBrandPeople = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'brand-people.json')));
export const getAudiences = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'audiences.json')));
export const getSegments = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'segments.json')));
export const getCategories = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'categories.json')));
export const getObjectives = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'objectives.json')));
export const getKpis = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'kpis.json')));
export const getContracts = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'contracts.json')));
export const getBrandGuidelines = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'brand-guidelines.json')));
export const getAssets = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'assets.json')));
export const getAssetVariants = cache(async () => readJsonArray<KgNode>(path.join(NODE_DIR, 'asset-variants.json')));
export const getAvailability = cache(async () => readJsonArray<KgNode<AvailabilityProps>>(path.join(NODE_DIR, 'availability.json')));
export const getAgents = cache(async () => readJsonArray<KgNode<AgentProps>>(path.join(NODE_DIR, 'agents.json')));

export const getAgencyStructureEdges = cache(async () => readJsonArray<KgEdge>(path.join(EDGE_DIR, 'agency-structure.json')));
export const getBrandStructureEdges = cache(async () => readJsonArray<KgEdge>(path.join(EDGE_DIR, 'brand-structure.json')));
export const getCampaignStructureEdges = cache(async () => readJsonArray<KgEdge>(path.join(EDGE_DIR, 'campaign-structure.json')));
export const getExecutionLinkEdges = cache(async () => readJsonArray<KgEdge>(path.join(EDGE_DIR, 'execution-links.json')));
export const getApprovalEdges = cache(async () => readJsonArray<KgEdge>(path.join(EDGE_DIR, 'approvals.json')));
export const getStaffingEdges = cache(async () => readJsonArray<KgEdge>(path.join(EDGE_DIR, 'staffing.json')));

export const getCostLines = cache(async () => readCsv(path.join(TABLE_DIR, 'cost-lines.csv')) as Promise<CostLineRow[]>);
export const getTimeTracking = cache(async () => readCsv(path.join(TABLE_DIR, 'time-tracking.csv')) as Promise<TimeEntryRow[]>);
export const getMediaSpend = cache(async () => readCsv(path.join(TABLE_DIR, 'media-spend.csv')) as Promise<MediaSpendRow[]>);
export const getAgentUsage = cache(async () => readCsv(path.join(TABLE_DIR, 'agent-usage.csv')) as Promise<AgentUsageRow[]>);

// Brand book markdown (read & exposed as raw markdown strings)
const BRAND_BOOK_DIR = path.join(KG_DIR, 'brand-book');
export const getBrandBookDoc = cache(async (relPath: string) => readMarkdown(path.join(BRAND_BOOK_DIR, relPath)));

// ===========================================================================
// Composite / derived helpers
// ===========================================================================

/** Person with their skill, channel, and category edges + denormalised department/role info. */
export const getPeopleEnriched = cache(async () => {
    const [people, edges, departments, roles, skills, channels, categories] = await Promise.all([
        getPeople(),
        getAgencyStructureEdges(),
        getDepartments(),
        getRoles(),
        getSkills(),
        getChannels(),
        getCategories(),
    ]);

    const deptMap = new Map(departments.map((d) => [d.id, d.properties.name]));
    const roleMap = new Map(roles.map((r) => [r.id, r.properties.name]));
    const skillMap = new Map(skills.map((s) => [s.id, s]));
    const channelMap = new Map(channels.map((c) => [c.id, c]));
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return people.map((p) => {
        const personEdges = edges.filter((e) => e.from === p.id);
        const skillEdges = personEdges
            .filter((e) => e.type === 'HAS_SKILL')
            .map((e) => ({
                skill_id: e.to,
                skill_name: skillMap.get(e.to)?.properties.name || e.to,
                skill_domain: (skillMap.get(e.to)?.properties as any)?.domain || '',
                proficiency: (e.properties?.proficiency as number) || 0,
            }))
            .sort((a, b) => b.proficiency - a.proficiency);
        const channelExperience = personEdges
            .filter((e) => e.type === 'EXPERIENCED_IN' && e.to.startsWith('channel:'))
            .map((e) => ({
                channel_id: e.to,
                channel_label: channelMap.get(e.to)?.properties.label || e.to,
                years: (e.properties?.years as number) || 0,
            }))
            .sort((a, b) => b.years - a.years);
        const categoryExperience = personEdges
            .filter((e) => e.type === 'EXPERIENCED_IN' && e.to.startsWith('category:'))
            .map((e) => ({
                category_id: e.to,
                category_name: (categoryMap.get(e.to)?.properties as any)?.name || e.to,
                years: (e.properties?.years as number) || 0,
            }))
            .sort((a, b) => b.years - a.years);

        return {
            ...p,
            department_name: deptMap.get(p.properties.department_id) || '',
            role_name: roleMap.get(p.properties.role_id) || '',
            skills: skillEdges,
            channel_experience: channelExperience,
            category_experience: categoryExperience,
        };
    });
});

/** Executions enriched with their campaign + market + channel + approval + lead info. */
export const getExecutionsEnriched = cache(async () => {
    const [executions, links, campaigns, markets, channels, people, approvalSteps] = await Promise.all([
        getExecutions(),
        getExecutionLinkEdges(),
        getCampaigns(),
        getMarkets(),
        getChannels(),
        getPeople(),
        getApprovalSteps(),
    ]);

    const campaignMap = new Map(campaigns.map((c) => [c.id, c]));
    const marketMap = new Map(markets.map((m) => [m.id, m]));
    const channelMap = new Map(channels.map((c) => [c.id, c]));
    const personMap = new Map(people.map((p) => [p.id, p]));
    const approvalMap = new Map(approvalSteps.map((a) => [a.id, a]));

    return executions.map((e) => {
        const execLinks = links.filter((l) => l.from === e.id);
        const campaignId = execLinks.find((l) => l.type === 'PART_OF')?.to;
        const marketId = execLinks.find((l) => l.type === 'TARGETS')?.to;
        const channelId = execLinks.find((l) => l.type === 'DELIVERS_IN')?.to;
        const leadId = execLinks.find((l) => l.type === 'LED_BY')?.to;
        const approvalIds = execLinks.filter((l) => l.type === 'REQUIRES_APPROVAL').map((l) => l.to);

        return {
            ...e,
            campaign_id: campaignId,
            campaign_name: campaignId ? campaignMap.get(campaignId)?.properties.name : '',
            market_id: marketId,
            market_label: marketId ? marketMap.get(marketId)?.properties.label : '',
            channel_id: channelId,
            channel_label: channelId ? channelMap.get(channelId)?.properties.label : '',
            lead_id: leadId,
            lead_name: leadId ? personMap.get(leadId)?.properties.name : '',
            approval_steps: approvalIds.map((id) => approvalMap.get(id)).filter(Boolean),
        };
    });
});

/** Single campaign with its executions. */
export const getCampaignDetail = cache(async (campaignId: string) => {
    const [campaigns, executionsEnriched, edges, budgets, objectives, kpis] = await Promise.all([
        getCampaigns(),
        getExecutionsEnriched(),
        getCampaignStructureEdges(),
        getBudgets(),
        getObjectives(),
        getKpis(),
    ]);
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return null;
    const executions = executionsEnriched.filter((e) => e.campaign_id === campaignId);
    const campaignEdges = edges.filter((e) => e.from === campaignId);
    const objectiveIds = campaignEdges.filter((e) => e.type === 'HAS_OBJECTIVE').map((e) => e.to);
    const objectiveMap = new Map(objectives.map((o) => [o.id, o]));
    const linkedObjectives = objectiveIds.map((id) => objectiveMap.get(id)).filter(Boolean);
    const marketIds = campaignEdges.filter((e) => e.type === 'RUNS_IN').map((e) => e.to);
    const channelIds = campaignEdges.filter((e) => e.type === 'USES_CHANNEL').map((e) => e.to);
    return {
        campaign,
        executions,
        objectives: linkedObjectives,
        market_ids: marketIds,
        channel_ids: channelIds,
    };
});

/** Single execution with all related entities. */
export const getExecutionDetail = cache(async (executionId: string) => {
    const [enriched, edges, costLines, timeTracking, mediaSpend, assets, assetVariants, approvalEdges, people, brandPeople] = await Promise.all([
        getExecutionsEnriched(),
        getExecutionLinkEdges(),
        getCostLines(),
        getTimeTracking(),
        getMediaSpend(),
        getAssets(),
        getAssetVariants(),
        getApprovalEdges(),
        getPeople(),
        getBrandPeople(),
    ]);
    const exec = enriched.find((e) => e.id === executionId);
    if (!exec) return null;

    const execEdges = edges.filter((e) => e.from === executionId);
    const producedAssetIds = execEdges.filter((e) => e.type === 'PRODUCES').map((e) => e.to);
    const assetMap = new Map(assets.map((a) => [a.id, a]));
    const variantMap = new Map(assetVariants.map((v) => [v.id, v]));
    const produced = producedAssetIds.map((id) => assetMap.get(id) || variantMap.get(id)).filter(Boolean);

    const personMap = new Map(people.map((p) => [p.id, p]));
    const brandPersonMap = new Map(brandPeople.map((p) => [p.id, p]));

    const execCostLines = costLines.filter((c) => c.execution_id === executionId);
    const execTimeEntries = timeTracking.filter((t) => t.execution_id === executionId);
    const execMediaSpend = mediaSpend.filter((m) => m.execution_id === executionId);

    const approvedByEdges = approvalEdges.filter((e) => e.type === 'APPROVED_BY');
    const approvalsWithApprovers = exec.approval_steps.map((step: any) => ({
        ...step,
        approver_id: approvedByEdges.find((e) => e.from === step.id)?.to,
        approver_name: (() => {
            const id = approvedByEdges.find((e) => e.from === step.id)?.to;
            if (!id) return '';
            return personMap.get(id)?.properties.name || brandPersonMap.get(id)?.properties.name || id;
        })(),
    }));

    // Aggregate cost + time
    const totalCostBilled = execCostLines.reduce((sum, c) => sum + (parseFloat(c.units) * parseFloat(c.unit_cost) * (1 + parseFloat(c.markup_pct))), 0);
    const totalActualHours = execTimeEntries.reduce((sum, t) => sum + parseFloat(t.actual_hours || '0'), 0);
    const totalPlannedHours = execTimeEntries.reduce((sum, t) => sum + parseFloat(t.planned_hours || '0'), 0);

    // Staffing: who's assigned via cost lines
    const staffing = Array.from(new Set(execCostLines.filter((c) => c.person_id).map((c) => c.person_id))).map((personId) => {
        const person = personMap.get(personId);
        const personCostLines = execCostLines.filter((c) => c.person_id === personId);
        const days = personCostLines.reduce((sum, c) => sum + parseFloat(c.units), 0);
        const rate = parseFloat(personCostLines[0]?.unit_cost || '0');
        const markup = parseFloat(personCostLines[0]?.markup_pct || '0');
        return {
            person_id: personId,
            person_name: person?.properties.name || personId,
            role_id: person?.properties.role_id || '',
            days,
            rate,
            billed: days * rate * (1 + markup),
        };
    });

    return {
        execution: exec,
        approvals: approvalsWithApprovers,
        assets: produced,
        cost_lines: execCostLines,
        time_entries: execTimeEntries,
        media_spend: execMediaSpend,
        staffing,
        totals: {
            cost_billed: totalCostBilled,
            actual_hours: totalActualHours,
            planned_hours: totalPlannedHours,
        },
    };
});

// ===========================================================================
// Format helpers
// ===========================================================================

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function variancePct(planned: number, actual: number): number {
    if (!planned) return 0;
    return Math.round(((actual - planned) / planned) * 1000) / 10;
}

export function varianceClass(planned: number, actual: number): string {
    const v = variancePct(planned, actual);
    if (v < -2) return 'text-emerald-400';
    if (v <= 4) return 'text-neutral-300';
    if (v <= 12) return 'text-amber-400';
    return 'text-red-400';
}

// ===========================================================================
// Availability helpers
// ===========================================================================

/**
 * For a given person and date window, compute the average available capacity %
 * across the window. Sums up all availability blocks that overlap, treats each
 * block as consuming allocation_pct of that day. Returns 0–100.
 *
 * E.g., if a person has one block at allocation_pct=100 covering half the
 * window, their available_pct = 50. If two blocks of 50% each cover the whole
 * window, available_pct = 0.
 */
export function computeAvailablePctInWindow(
    blocks: Array<KgNode<AvailabilityProps>>,
    personId: string,
    windowStart: string,
    windowEnd: string,
): { available_pct: number; conflicting_blocks: Array<{ reason: string; start: string; end: string; allocation_pct: number }> } {
    const ws = new Date(windowStart).getTime();
    const we = new Date(windowEnd).getTime();
    if (we <= ws) return { available_pct: 100, conflicting_blocks: [] };
    const windowDays = Math.max(1, (we - ws) / 86400000);

    let allocatedDays = 0;
    const conflicting: Array<{ reason: string; start: string; end: string; allocation_pct: number }> = [];

    for (const b of blocks) {
        if (b.properties.person_id !== personId) continue;
        const bs = new Date(b.properties.start_date).getTime();
        const be = new Date(b.properties.end_date).getTime();
        // Overlap?
        const overlapStart = Math.max(bs, ws);
        const overlapEnd = Math.min(be, we);
        if (overlapEnd < overlapStart) continue;
        const overlapDays = (overlapEnd - overlapStart) / 86400000 + 1;
        const alloc = b.properties.allocation_pct / 100;
        allocatedDays += overlapDays * alloc;
        conflicting.push({
            reason: b.properties.reason || 'unspecified',
            start: b.properties.start_date,
            end: b.properties.end_date,
            allocation_pct: b.properties.allocation_pct,
        });
    }

    const availablePct = Math.max(0, Math.round((1 - allocatedDays / windowDays) * 100));
    return { available_pct: availablePct, conflicting_blocks: conflicting };
}
