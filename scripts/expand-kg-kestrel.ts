/**
 * Expand the KG: add a 2nd client brand (Kestrel — performance outdoor apparel),
 * grow the bench to ~100 people covering every channel, and scale the book of
 * work to ~80 campaigns across both brands with a fully consistent cascade
 * (executions, links, approvals, cost-lines, time-tracking, media-spend, agent-
 * usage). Seeded + APPEND-only — re-running reproduces the same output.
 *
 * Run: npx tsx scripts/expand-kg-kestrel.ts   then   npm run validate-kg
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const KG = join(process.cwd(), 'data', 'knowledge-graph');
const N = (f: string) => join(KG, 'nodes', f);
const E = (f: string) => join(KG, 'edges', f);
const T = (f: string) => join(KG, 'tables', f);
const rj = (p: string): any[] => JSON.parse(readFileSync(p, 'utf-8'));
const wj = (p: string, arr: any[]) => writeFileSync(p, JSON.stringify(arr, null, 2) + '\n');

// ---- seeded PRNG (mulberry32) ----
let seed = 0x1a2b3c4d;
function rnd() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (a: number, b: number) => Math.floor(a + rnd() * (b - a + 1));
const rf = (a: number, b: number, dp = 2) => +(a + rnd() * (b - a)).toFixed(dp);
const pick = <T>(a: T[]): T => a[Math.floor(rnd() * a.length)];
const chance = (p: number) => rnd() < p;
function pickN<T>(a: T[], n: number): T[] {
    const c = [...a];
    const out: T[] = [];
    while (out.length < n && c.length) out.push(c.splice(Math.floor(rnd() * c.length), 1)[0]);
    return out;
}
const addDays = (iso: string, d: number) => {
    const dt = new Date(iso + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + d);
    return dt.toISOString().slice(0, 10);
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ===========================================================================
// Load existing
// ===========================================================================
const brands = rj(N('brand.json'));
const contracts = rj(N('contracts.json'));
const brandTeams = rj(N('brand-teams.json'));
const brandPeople = rj(N('brand-people.json'));
const products = rj(N('products.json'));
const personas = rj(N('personas.json'));
const audiences = rj(N('audiences.json'));
const segments = rj(N('segments.json'));
const objectives = rj(N('objectives.json'));
const kpis = rj(N('kpis.json'));
const budgets = rj(N('budgets.json'));
const people = rj(N('people.json'));
const availability = rj(N('availability.json'));
const campaigns = rj(N('campaigns.json'));
const executions = rj(N('executions.json'));
const approvalSteps = rj(N('approval-steps.json'));

const agencyEdges = rj(E('agency-structure.json'));
const brandStructure = rj(E('brand-structure.json'));
const contractEdges = rj(E('contract.json'));
const budgetEdges = rj(E('budget.json'));
const campaignStructure = rj(E('campaign-structure.json'));
const execLinks = rj(E('execution-links.json'));
const approvalEdges = rj(E('approvals.json'));

const AGENCY = 'agency:halo-helix';
const MARKETS = ['market:UK', 'market:US', 'market:DE', 'market:FR', 'market:JP', 'market:CN'];
const CHANNELS = ['channel:SEO', 'channel:PAID_MEDIA', 'channel:SOCIAL_MEDIA', 'channel:ECRM', 'channel:D2C', 'channel:B2B', 'channel:B2B2C', 'channel:POSM', 'channel:OOH', 'channel:RESEARCH', 'channel:EVENT', 'channel:UX'];
const PAID_CHANNELS = new Set(['channel:PAID_MEDIA', 'channel:SOCIAL_MEDIA', 'channel:OOH', 'channel:PROGRAMMATIC']);

// ===========================================================================
// PART A — Kestrel brand satellite
// ===========================================================================
brands.push({ id: 'brand:kestrel', type: 'Brand', properties: { name: 'Kestrel', category: 'Performance outdoor apparel', founded_year: 2014, hq_city: 'Manchester', tagline: 'Built for the long way round', positioning: 'Premium performance apparel for endurance athletes and the serious outdoors', website: 'kestrel.example' } });

contracts.push({ id: 'contract:kestrel-master-2024', type: 'Contract', properties: { name: 'Kestrel × Halo & Helix — Master Services Agreement', brand_id: 'brand:kestrel', agency_id: AGENCY, start_date: '2024-01-01', end_date: '2026-12-31', currency: 'GBP', annual_fee: 1600000, fx_policy: 'Local cost lines invoiced in market currency; converted to GBP at month-end contract FX. Variance ≤2% absorbed by agency.', scope_notes: 'Brand, performance marketing, retail & wholesale activation. Global strategy + UK/US local activation; in-market partner production in DE/FR/JP.' } });
contractEdges.push({ from: 'contract:kestrel-master-2024', to: 'brand:kestrel', type: 'GOVERNS' });

const kTeams = [
    { id: 'brand-team:kestrel-global', name: 'Kestrel Global Brand Team', scope: 'global', office_city: 'Manchester' },
    { id: 'brand-team:kestrel-uk', name: 'Kestrel UK', scope: 'local', office_city: 'London' },
    { id: 'brand-team:kestrel-us', name: 'Kestrel US', scope: 'local', office_city: 'Denver' },
];
for (const t of kTeams) {
    brandTeams.push({ id: t.id, type: 'BrandTeam', properties: { name: t.name, scope: t.scope, office_city: t.office_city } });
    brandStructure.push({ from: 'brand:kestrel', to: t.id, type: 'OWNS' });
}
const kApprovers = [
    { id: 'brand-person:darius-kane', name: 'Darius Kane', title: 'Chief Marketing Officer', team: 'brand-team:kestrel-global' },
    { id: 'brand-person:rhona-fielding', name: 'Rhona Fielding', title: 'Global Brand Director', team: 'brand-team:kestrel-global' },
    { id: 'brand-person:marcus-webb', name: 'Marcus Webb', title: 'UK Marketing Lead', team: 'brand-team:kestrel-uk' },
    { id: 'brand-person:dana-cole', name: 'Dana Cole', title: 'US Marketing Lead', team: 'brand-team:kestrel-us' },
];
for (const a of kApprovers) brandPeople.push({ id: a.id, type: 'BrandPerson', properties: { name: a.name, title: a.title, team_id: a.team, is_approver: true } });

const kProducts = [
    ['Stratus Shell Jacket', 'KS-SSJ', 'Outerwear', 'All-weather trail'],
    ['Ridgeline Insulated Jacket', 'KS-RIJ', 'Outerwear', 'Winter layering'],
    ['Tempo Base Layer', 'KS-TBL', 'Base layers', 'High-output endurance'],
    ['Cadence Run Tee', 'KS-CRT', 'Run', 'Road & track'],
    ['Summit Trail Pack 24L', 'KS-STP', 'Packs', 'Fast hiking'],
    ['Vector Trail Shoe', 'KS-VTS', 'Footwear', 'Technical trail'],
    ['Drift Merino Hoodie', 'KS-DMH', 'Layers', 'Travel & recovery'],
    ['Halo Headlamp', 'KS-HHL', 'Accessories', 'Night running'],
];
kProducts.forEach(([name, sku, line, use], i) => {
    products.push({ id: `product:${slug(name)}`, type: 'Product', properties: { name, sku, line, ritual: use, size_ml: 0, cogs_gbp: ri(20, 90), rrp_gbp: ri(70, 320), margin_pct: rf(0.55, 0.74), hero_ingredients: pickN(['recycled ripstop', 'Gore-Tex membrane', 'merino blend', 'graphene insulation', 'Vibram outsole', 'PFC-free DWR'], 2), launch_date: `${2018 + (i % 7)}-0${1 + (i % 8)}-01` } });
});

const kPersonas = [
    ['Trailhead Tom', 'The weekend ultra-runner', '34-48', '£60k-£110k', 'Performance that survives real conditions'],
    ['Commuter Cass', 'The all-weather city cyclist', '28-40', '£45k-£85k', 'Versatile kit for daily miles'],
    ['Summit Sara', 'The technical alpinist', '30-45', '£70k-£130k', 'Trust at altitude, zero failures'],
];
kPersonas.forEach(([name, archetype, age, income, motivation]) => personas.push({ id: `persona:${slug(name)}`, type: 'Persona', properties: { name, archetype, doc_path: `brand-book/personas/${slug(name)}.md`, age_range: age, income_band: income, primary_motivation: motivation } }));

audiences.push({ id: 'audience:endurance-outdoors', type: 'Audience', properties: { name: 'Endurance & outdoors enthusiasts', size_estimate: 3800000, geography: 'Global — strongest in UK, US, DE', platform_preferences: ['Strava', 'Instagram', 'YouTube', 'Reddit (trailrunning, Ultralight)'] } });
audiences.push({ id: 'audience:performance-commuters', type: 'Audience', properties: { name: 'Performance commuters', size_estimate: 2100000, geography: 'Urban UK/US/DE/FR', platform_preferences: ['Instagram', 'TikTok', 'Komoot'] } });
segments.push({ id: 'segment:kestrel-uk-core', type: 'Segment', properties: { name: 'Kestrel UK core (≥2 purchases/yr)', definition: 'UK customers with 2+ purchases in trailing 12 months, AOV ≥ £120', size_estimate: 31000, market_id: 'market:UK' } });
segments.push({ id: 'segment:kestrel-us-trail', type: 'Segment', properties: { name: 'Kestrel US trail segment', definition: 'US customers buying trail/footwear lines', size_estimate: 27000, market_id: 'market:US' } });

const kObjectives = [
    ['Grow Kestrel D2C revenue', 'Scale direct revenue while protecting wholesale margin.'],
    ['Build endurance-credibility', 'Earn authority with serious endurance and outdoor communities.'],
    ['Expand US footprint', 'Establish Kestrel as a top-5 challenger in US technical apparel.'],
    ['Win retail shelf space', 'Convert wholesale partners with strong sell-through and POSM.'],
    ['Lift sustainability perception', 'Communicate PFC-free / recycled credentials credibly.'],
];
kObjectives.forEach(([name, definition], i) => objectives.push({ id: `objective:kestrel-${slug(name)}`, type: 'Objective', properties: { name, definition, standard_objective_ref: pick(['Revenue Growth', 'Brand Awareness', 'Consideration', 'Loyalty']), horizon: pick(['rolling', 'annual', '2026']) } }));

const kKpis: any[] = [];
for (const [mk, ref] of [['UK', 'market:UK'], ['US', 'market:US'], ['DE', 'market:DE']] as const) {
    kKpis.push({ id: `kpi:kestrel-d2c-revenue-${mk.toLowerCase()}`, name: `Kestrel D2C revenue — ${mk}`, metric: 'D2C revenue', unit: '£m', target: rf(4, 18, 1), base: rf(2, 10, 1) });
    kKpis.push({ id: `kpi:kestrel-aided-awareness-${mk.toLowerCase()}`, name: `Kestrel aided awareness — ${mk}`, metric: 'Aided awareness', unit: '%', target: ri(9, 22), base: ri(5, 14) });
}
kKpis.push({ id: 'kpi:kestrel-wholesale-sellthrough', name: 'Wholesale sell-through', metric: 'Sell-through rate', unit: '%', target: 62, base: 48 });
kKpis.push({ id: 'kpi:kestrel-sustainability-perception', name: 'Sustainability perception lift', metric: 'Perception (panel)', unit: 'pp', target: 6, base: 0 });
for (const k of kKpis) kpis.push({ id: k.id, type: 'KPI', properties: { name: k.name, metric: k.metric, target_value: k.target, unit: k.unit, baseline_value: k.base } });

const kBudgets: Record<string, string> = {};
for (const year of [2024, 2025, 2026]) {
    const id = `budget:kestrel-global-${year}`;
    kBudgets[year] = id;
    budgets.push({ id, type: 'Budget', properties: { name: `Kestrel Global ${year}`, year, brand_team_id: 'brand-team:kestrel-global', allocated_amount: ri(2200000, 3200000), currency: 'GBP', spent_amount: ri(2100000, 3300000), notes: 'Performance + retail activation.' } });
    budgetEdges.push({ from: id, to: 'brand-team:kestrel-global', type: 'ALLOCATED_TO' });
}

// Aurelune budget lookup by year (for new Aurelune campaign DRAWS_FROM)
const aureBudgetByYear: Record<string, string> = {};
for (const b of budgets) {
    if (b.properties.brand_team_id === 'brand-team:aurelune-global' && !aureBudgetByYear[b.properties.year]) aureBudgetByYear[b.properties.year] = b.id;
}

// ===========================================================================
// PART B — grow the bench to ~100, filling every channel
// ===========================================================================
const FIRST = ['Aaron', 'Bea', 'Caleb', 'Dara', 'Esme', 'Felix', 'Greta', 'Hugo', 'Iris', 'Jonah', 'Kira', 'Leon', 'Mara', 'Nils', 'Orla', 'Pavel', 'Quinn', 'Rosa', 'Sami', 'Tara', 'Uma', 'Vince', 'Wren', 'Xan', 'Yusuf', 'Zoe', 'Ade', 'Bo', 'Cleo', 'Dev', 'Eli', 'Fern', 'Gus', 'Hana', 'Ivo', 'Juno', 'Kai', 'Lena', 'Milo', 'Nadia', 'Otis', 'Priya', 'Remy', 'Sasha', 'Theo', 'Ada', 'Bram', 'Cara', 'Dami', 'Edda', 'Frey', 'Gio', 'Halle', 'Ines', 'Jad', 'Kit', 'Liv', 'Marlo', 'Noor'];
const LAST = ['Ashby', 'Boone', 'Crane', 'Dunmore', 'Ellery', 'Frost', 'Garnett', 'Holt', 'Ibsen', 'Jansen', 'Kerr', 'Lund', 'Mercer', 'Nash', 'Okafor', 'Pike', 'Quill', 'Rourke', 'Stern', 'Tanaka', 'Ueda', 'Vogel', 'Walsh', 'Xu', 'Yates', 'Zane', 'Brandt', 'Cho', 'Delaney', 'Esposito', 'Fischer', 'Gallo', 'Hsu', 'Imani', 'Jovic', 'Kowal', 'Leroy', 'Moss', 'Novak', 'Ortega'];

const channelSkillMap: Record<string, string[]> = {
    'channel:PAID_MEDIA': ['skill:paid-search', 'skill:paid-social', 'skill:programmatic', 'skill:attribution'],
    'channel:SOCIAL_MEDIA': ['skill:social-organic', 'skill:influencer', 'skill:copywriting-short-form'],
    'channel:SEO': ['skill:seo-traditional', 'skill:seo-aeo-geo', 'skill:content-strategy'],
    'channel:ECRM': ['skill:ecrm-architecture', 'skill:ecrm-copy', 'skill:analytics'],
    'channel:D2C': ['skill:experimentation', 'skill:analytics', 'skill:attribution'],
    'channel:UX': ['skill:experimentation', 'skill:analytics'],
    'channel:OOH': ['skill:ooh-planning', 'skill:art-direction'],
    'channel:POSM': ['skill:posm-execution', 'skill:print-production'],
    'channel:EVENT': ['skill:events-production', 'skill:project-management'],
    'channel:RESEARCH': ['skill:audience-strategy', 'skill:analytics'],
    'channel:B2B': ['skill:negotiation', 'skill:brand-strategy'],
    'channel:B2B2C': ['skill:negotiation', 'skill:brand-strategy', 'skill:print-production'],
};
const roleRate = (role: string) => {
    if (/(director|head-of|executive-creative)/.test(role)) return ri(1100, 1400);
    if (/(senior|creative-director|channel-lead|producer)/.test(role)) return ri(780, 1000);
    if (/(manager|strategist|designer)/.test(role)) return ri(560, 820);
    return ri(380, 580);
};
const allCategories = ['category:beauty', 'category:skincare', 'category:fashion', 'category:wellness', 'category:food-beverage', 'category:tech'];

// How many channel specialists to ADD per channel (fills the gaps hardest).
const channelAddTargets: Record<string, number> = {
    'channel:B2B': 6, 'channel:RESEARCH': 6, 'channel:UX': 5, 'channel:EVENT': 5, 'channel:POSM': 6, 'channel:SEO': 5,
    'channel:OOH': 3, 'channel:B2B2C': 3, 'channel:ECRM': 3, 'channel:PAID_MEDIA': 3, 'channel:SOCIAL_MEDIA': 2, 'channel:D2C': 2,
};
const channelExpertRoles = ['role:head-of-channels', 'role:channel-lead', 'role:senior-channel-specialist', 'role:channel-specialist'];

const usedNames = new Set(people.map((p) => p.properties.name));
const newPeople: any[] = [];
function makePerson(dept: string, role: string, channelsExp: string[]) {
    let name = '';
    for (let i = 0; i < 200; i++) { const n = `${pick(FIRST)} ${pick(LAST)}`; if (!usedNames.has(n)) { name = n; break; } }
    if (!name) name = `${pick(FIRST)} ${pick(LAST)} ${ri(2, 9)}`;
    usedNames.add(name);
    const id = `person:${slug(name)}`;
    const rate = roleRate(role);
    people.push({ id, type: 'Person', properties: { name, department_id: dept, role_id: role, seniority: /(director|head-of|executive)/.test(role) ? 'director' : /senior/.test(role) ? 'senior' : /(manager|lead|strategist|producer|creative-director)/.test(role) ? 'lead' : 'mid', office: pick(['London', 'Manchester', 'New York', 'Berlin']), start_date: `${ri(2015, 2024)}-0${ri(1, 9)}-1${ri(0, 5)}`, daily_rate_gbp: rate, client_markup_pct: 0.85, capacity_hours_per_week: pick([32, 35, 36, 40]), utilisation_target_pct: rf(0.6, 0.8), email: `${slug(name)}@haloandhelix.example`, is_active: true } });
    agencyEdges.push({ from: id, to: AGENCY, type: 'EMPLOYED_BY' });
    agencyEdges.push({ from: id, to: dept, type: 'BELONGS_TO' });
    agencyEdges.push({ from: id, to: role, type: 'HAS_ROLE' });
    // skills
    const skillSet = new Set<string>();
    for (const ch of channelsExp) for (const s of (channelSkillMap[ch] || [])) skillSet.add(s);
    if (dept === 'dept:strategy') ['skill:brand-strategy', 'skill:positioning', 'skill:audience-strategy', 'skill:campaign-strategy'].forEach((s) => skillSet.add(s));
    if (dept === 'dept:creative') ['skill:concept-development', 'skill:copywriting-long-form', 'skill:art-direction', 'skill:graphic-design'].forEach((s) => skillSet.add(s));
    if (dept === 'dept:project-planning') ['skill:project-management', 'skill:resource-planning'].forEach((s) => skillSet.add(s));
    if (dept === 'dept:client-services') ['skill:negotiation', 'skill:project-management'].forEach((s) => skillSet.add(s));
    if (dept === 'dept:new-business') ['skill:new-business-pitching', 'skill:negotiation'].forEach((s) => skillSet.add(s));
    for (const s of pickN([...skillSet], Math.min(skillSet.size, ri(3, 6)))) agencyEdges.push({ from: id, to: s, type: 'HAS_SKILL', properties: { proficiency: ri(3, 5) } });
    // channel experience
    for (const ch of channelsExp) agencyEdges.push({ from: id, to: ch, type: 'EXPERIENCED_IN', properties: { years: ri(2, 11) } });
    // category experience
    for (const cat of pickN(allCategories, ri(1, 2))) agencyEdges.push({ from: id, to: cat, type: 'EXPERIENCED_IN', properties: { years: ri(2, 10) } });
    newPeople.push(id);
    return id;
}

// 1) Channel specialists to fill gaps
for (const [ch, count] of Object.entries(channelAddTargets)) {
    for (let i = 0; i < count; i++) {
        const extra = chance(0.35) ? [pick(CHANNELS)] : [];
        makePerson('dept:channel-experts', pick(channelExpertRoles), [ch, ...extra.filter((c) => c !== ch)]);
    }
}
// 2) Depth in other departments to round out ~100
const deptRolePlan: Array<[string, string[], number]> = [
    ['dept:strategy', ['role:strategy-director', 'role:senior-strategist', 'role:strategist'], 6],
    ['dept:creative', ['role:creative-director', 'role:associate-creative-director', 'role:senior-copywriter', 'role:copywriter', 'role:senior-art-director', 'role:designer'], 9],
    ['dept:project-planning', ['role:senior-project-manager', 'role:project-manager', 'role:producer'], 6],
    ['dept:client-services', ['role:account-director', 'role:account-manager', 'role:account-executive'], 5],
    ['dept:new-business', ['role:new-business-manager'], 2],
];
for (const [dept, roles, count] of deptRolePlan) {
    for (let i = 0; i < count; i++) {
        const chs = chance(0.6) ? pickN(CHANNELS, ri(1, 2)) : [];
        makePerson(dept, pick(roles), chs);
    }
}

// Availability: give ~45% of new people a 2026 allocation block (cross-client contention)
let availCount = availability.length;
for (const pid of newPeople) {
    if (!chance(0.45)) continue;
    const start = `2026-0${ri(6, 9)}-0${ri(1, 9)}`;
    availability.push({ id: `availability:gen-${++availCount}`, type: 'Availability', properties: { person_id: pid, start_date: start, end_date: addDays(start, ri(21, 90)), allocation_pct: pick([40, 50, 60, 80, 100]), reason: pick(['Aurelune Sephora Y2', 'Kestrel trail season', 'Kestrel US launch', 'Aurelune DACH push', 'Parental leave', 'Kestrel wholesale roadshow']) } });
}

// Approver pool — directors across the (now larger) bench
const approverPool = people.filter((p) => p.properties.seniority === 'director').map((p) => p.id);

// ===========================================================================
// PART C — campaigns + cascade, across both brands
// ===========================================================================
const peopleByChannel: Record<string, string[]> = {};
for (const e of agencyEdges) {
    if (e.type === 'EXPERIENCED_IN' && String(e.to).startsWith('channel:')) (peopleByChannel[e.to] = peopleByChannel[e.to] || []).push(e.from);
}
const peopleIds = people.map((p) => p.id);
const personRole: Record<string, string> = {};
for (const p of people) personRole[p.id] = p.properties.role_id;
const roleDept: Record<string, string> = {
    'role:group-account-director': 'dept:client-services', 'role:account-director': 'dept:client-services', 'role:account-manager': 'dept:client-services', 'role:account-executive': 'dept:client-services',
    'role:strategy-director': 'dept:strategy', 'role:senior-strategist': 'dept:strategy', 'role:strategist': 'dept:strategy',
    'role:head-of-project-planning': 'dept:project-planning', 'role:senior-project-manager': 'dept:project-planning', 'role:project-manager': 'dept:project-planning', 'role:producer': 'dept:project-planning',
    'role:executive-creative-director': 'dept:creative', 'role:creative-director': 'dept:creative', 'role:associate-creative-director': 'dept:creative', 'role:senior-art-director': 'dept:creative', 'role:senior-copywriter': 'dept:creative', 'role:designer': 'dept:creative', 'role:copywriter': 'dept:creative',
    'role:head-of-channels': 'dept:channel-experts', 'role:channel-lead': 'dept:channel-experts', 'role:senior-channel-specialist': 'dept:channel-experts', 'role:channel-specialist': 'dept:channel-experts',
    'role:head-of-new-business': 'dept:new-business', 'role:new-business-manager': 'dept:new-business',
    'role:finance-director': 'dept:accounts', 'role:finance-manager': 'dept:accounts', 'role:bookkeeper': 'dept:accounts',
};

const costLineRows: string[] = [];
const timeRows: string[] = [];
const mediaRows: string[] = [];
const agentRows: string[] = [];
const agents = rj(N('agents.json'));
const cheapAgents = agents.filter((a) => ['agent:anthropic-claude-haiku-4-5', 'agent:google-gemini-2-5-flash', 'agent:anthropic-claude-sonnet-4-6'].includes(a.id));

let execCounter = 0;
let clCounter = 0;
let teCounter = 0;
let msCounter = 0;
let auCounter = 0;

function leadFor(channel: string): string {
    const pool = peopleByChannel[channel] && peopleByChannel[channel].length ? peopleByChannel[channel] : peopleIds;
    return pick(pool);
}

function makeExecution(campaignId: string, contractId: string, market: string, channel: string, type: string, winStart: string, winEnd: string, brandShort: string, budget: number) {
    const execId = `execution:exec-gen-${String(++execCounter).padStart(4, '0')}`;
    const dur = type === 'global_asset_creation' ? ri(18, 40) : type === 'localisation' ? ri(10, 28) : ri(15, 35);
    const ps = addDays(winStart, ri(0, Math.max(0, Math.floor((new Date(winEnd).getTime() - new Date(winStart).getTime()) / 86400000) - dur - 5)));
    const pe = addDays(ps, dur);
    const slip = ri(-2, 12);
    const as = ps;
    const ae = addDays(pe, Math.max(0, slip));
    const chName = channel.replace('channel:', '');
    executions.push({ id: execId, type: 'Execution', properties: { name: `${type.replace(/_/g, ' ')} — ${chName} (${brandShort})`, execution_type: type, status: 'shipped', planned_start: ps, planned_end: pe, actual_start: as, actual_end: ae, budget_planned: Math.round(budget), budget_actual: Math.round(budget * rf(0.9, 1.15)), currency: 'GBP', summary: `${type.replace(/_/g, ' ')} for ${chName} in ${market.replace('market:', '')}`, internal_review_planned_days: 5, client_review_planned_days: 3 } });
    const lead = leadFor(channel);
    execLinks.push({ from: execId, to: campaignId, type: 'PART_OF' });
    execLinks.push({ from: execId, to: market, type: 'TARGETS' });
    execLinks.push({ from: execId, to: channel, type: 'DELIVERS_IN' });
    execLinks.push({ from: execId, to: lead, type: 'LED_BY' });

    // Approvals (internal + client), dates within/after exec window
    for (const gate of ['internal', 'client'] as const) {
        const apId = `approval:${execId.replace('execution:', '')}-${gate}`;
        const plannedDur = gate === 'internal' ? 5 : 3;
        const apStart = pe;
        const actualDur = plannedDur + ri(0, 8);
        approvalSteps.push({ id: apId, type: 'ApprovalStep', properties: { gate: `${gate}_review`, planned_duration_days: plannedDur, actual_duration_days: actualDur, planned_start: apStart, planned_end: addDays(apStart, plannedDur), actual_start: apStart, actual_end: addDays(apStart, actualDur), status: 'approved', outcome: 'approved' } });
        execLinks.push({ from: execId, to: apId, type: 'REQUIRES_APPROVAL' });
        approvalEdges.push({ from: execId, to: apId, type: 'REQUIRES_APPROVAL' });
        approvalEdges.push({ from: apId, to: pick(approverPool), type: 'APPROVED_BY' });
    }

    // Cost lines — fee_time for 3-6 contributors + production/localisation
    const contributors = [lead, ...pickN(peopleIds, ri(3, 6))];
    let labour = 0;
    for (const pid of new Set(contributors)) {
        const role = personRole[pid] || 'role:channel-specialist';
        const units = ri(3, 14);
        const unitCost = people.find((p) => p.id === pid)?.properties.daily_rate_gbp || roleRate(role);
        labour += units * unitCost * 1.85;
        costLineRows.push(`cl-gen-${String(++clCounter).padStart(5, '0')},${execId},${contractId},${pid},${role},fee_time,${units},${unitCost},0.85,GBP,${ae},Generated`);
    }
    if (type === 'global_asset_creation') costLineRows.push(`cl-gen-${String(++clCounter).padStart(5, '0')},${execId},${contractId},,role:producer,production_cost,1,${ri(8000, 45000)},0.15,GBP,${ae},Production`);
    if (type === 'localisation') costLineRows.push(`cl-gen-${String(++clCounter).padStart(5, '0')},${execId},${contractId},,role:channel-specialist,localisation_cost,1,${ri(3000, 14000)},0.15,GBP,${ae},Localisation`);

    // Time-tracking — per contributor, 1-3 weeks
    for (const pid of new Set(contributors)) {
        const weeks = ri(1, 3);
        for (let w = 0; w < weeks; w++) {
            const wk = addDays(as, w * 7);
            const planned = ri(8, 36);
            timeRows.push(`te-gen-${String(++teCounter).padStart(5, '0')},${execId},${pid},${wk},${planned},${planned + ri(-4, 10)},Generated`);
        }
    }

    // Media spend on paid channels
    if (PAID_CHANNELS.has(channel)) {
        const spend = Math.round(budget * rf(0.4, 0.7));
        mediaRows.push(`ms-gen-${String(++msCounter).padStart(4, '0')},${execId},${market},${channel},${pick(['Meta', 'Google', 'TikTok', 'DV360', 'Reddit'])},${spend},${Math.round(spend * rf(0.92, 1.1))},GBP,${ps},${pe}`);
    }

    // Agent usage on recent digital executions
    if (ae >= '2025-06-01' && ['channel:SEO', 'channel:ECRM', 'channel:SOCIAL_MEDIA', 'channel:D2C', 'channel:RESEARCH'].includes(channel) && chance(0.5)) {
        const ag = pick(cheapAgents);
        const inTok = ri(12000, 60000), outTok = ri(4000, 20000);
        const cost = +((inTok / 1e6) * ag.properties.input_price_gbp_per_mtok + (outTok / 1e6) * ag.properties.output_price_gbp_per_mtok).toFixed(2);
        agentRows.push(`au-gen-${String(++auCounter).padStart(4, '0')},${execId},${ag.id},${ag.properties.model_id},${inTok},${outTok},${inTok + outTok},${cost},${type},${ae}`);
    }
    return execId;
}

// Campaign theme pools
const aureThemes = ['Hydration Ritual', 'PM Renewal', 'Barrier Repair', 'Vitamin C Bright', 'SPF Defence', 'Sephora Activation', 'Loyalty Refresh', 'Sampling Drive', 'Gifting Season', 'DACH Expansion', 'Tokyo Residency', 'Cross-border CN'];
const kestThemes = ['Trail Season', 'Winter Layering', 'Marathon Push', 'Gore-Tex Launch', 'Run Club Series', 'Wholesale Roadshow', 'Flagship Opening', 'Sustainability Story', 'Black Friday', 'Base Layer Drop', 'Footwear Launch', 'Commuter Campaign'];
const seasons = ['SS', 'AW'];

function makeCampaign(brand: 'aurelune' | 'kestrel', idx: number) {
    const year = pick([2024, 2025, 2026]);
    const isAure = brand === 'aurelune';
    const theme = pick(isAure ? aureThemes : kestThemes);
    const mkt = pickN(MARKETS, ri(1, 3));
    const chPool = isAure
        ? ['channel:SEO', 'channel:PAID_MEDIA', 'channel:SOCIAL_MEDIA', 'channel:ECRM', 'channel:D2C', 'channel:RESEARCH', 'channel:B2B2C', 'channel:OOH']
        : ['channel:PAID_MEDIA', 'channel:SOCIAL_MEDIA', 'channel:D2C', 'channel:POSM', 'channel:OOH', 'channel:EVENT', 'channel:B2B', 'channel:B2B2C', 'channel:SEO', 'channel:RESEARCH'];
    const chs = pickN(chPool, ri(2, 5));
    const cType = pick(isAure ? ['global_launch', 'seasonal', 'always_on', 'market_entry'] : ['product_launch', 'seasonal', 'retail_activation', 'always_on']);
    const startMonth = ri(1, 9);
    const cStart = `${year}-${String(startMonth).padStart(2, '0')}-0${ri(1, 9)}`;
    const cEnd = addDays(cStart, ri(45, 130));
    const budgetPlanned = ri(80000, 1400000);
    const name = `${theme} — ${mkt.map((m) => m.replace('market:', '')).join('/')} ${pick(seasons)}${String(year).slice(2)}`;
    const id = `campaign:${brand}-${slug(theme)}-${idx}-${String(year).slice(2)}`;
    campaigns.push({ id, type: 'Campaign', properties: { name, campaign_type: cType, start_date: cStart, end_date: cEnd, status: year < 2026 ? 'shipped' : pick(['shipped', 'in_market', 'in_production']), budget_planned: budgetPlanned, budget_actual: Math.round(budgetPlanned * rf(0.9, 1.12)), currency: 'GBP', summary: `${theme} ${cType.replace(/_/g, ' ')} for ${isAure ? 'Aurelune' : 'Kestrel'} across ${mkt.map((m) => m.replace('market:', '')).join(', ')}.` } });

    const contractId = isAure ? 'contract:aurelune-master-2024' : 'contract:kestrel-master-2024';
    const team = isAure ? 'brand-team:aurelune-global' : 'brand-team:kestrel-global';
    campaignStructure.push({ from: AGENCY, to: id, type: 'ORCHESTRATES' });
    campaignStructure.push({ from: id, to: team, type: 'COMMISSIONED_BY' });
    const budgetId = isAure ? aureBudgetByYear[year] : kBudgets[year];
    if (budgetId) campaignStructure.push({ from: id, to: budgetId, type: 'DRAWS_FROM', properties: { draw_amount: budgetPlanned } });
    for (const m of mkt) campaignStructure.push({ from: id, to: m, type: 'RUNS_IN' });
    for (const c of chs) campaignStructure.push({ from: id, to: c, type: 'USES_CHANNEL' });

    const brandShort = isAure ? 'AUR' : 'KES';
    const primary = mkt[0];
    const perChannelBudget = budgetPlanned / Math.max(1, chs.length);
    for (const c of chs) {
        // global asset creation (primary market)
        makeExecution(id, contractId, primary, c, 'global_asset_creation', cStart, cEnd, brandShort, perChannelBudget * 0.4);
        // localisation for additional markets
        for (const m of mkt.slice(1)) makeExecution(id, contractId, m, c, 'localisation', cStart, cEnd, brandShort, perChannelBudget * 0.25);
    }
    // local campaign per market
    for (const m of mkt) makeExecution(id, contractId, m, pick(chs), 'local_campaign', cStart, cEnd, brandShort, perChannelBudget * 0.35);
}

let cIdx = 0;
for (let i = 0; i < 28; i++) makeCampaign('aurelune', cIdx++);
for (let i = 0; i < 42; i++) makeCampaign('kestrel', cIdx++);

// ===========================================================================
// Write everything
// ===========================================================================
wj(N('brand.json'), brands);
wj(N('contracts.json'), contracts);
wj(N('brand-teams.json'), brandTeams);
wj(N('brand-people.json'), brandPeople);
wj(N('products.json'), products);
wj(N('personas.json'), personas);
wj(N('audiences.json'), audiences);
wj(N('segments.json'), segments);
wj(N('objectives.json'), objectives);
wj(N('kpis.json'), kpis);
wj(N('budgets.json'), budgets);
wj(N('people.json'), people);
wj(N('availability.json'), availability);
wj(N('campaigns.json'), campaigns);
wj(N('executions.json'), executions);
wj(N('approval-steps.json'), approvalSteps);
wj(E('agency-structure.json'), agencyEdges);
wj(E('brand-structure.json'), brandStructure);
wj(E('contract.json'), contractEdges);
wj(E('budget.json'), budgetEdges);
wj(E('campaign-structure.json'), campaignStructure);
wj(E('execution-links.json'), execLinks);
wj(E('approvals.json'), approvalEdges);

const appendCsv = (p: string, rows: string[]) => { if (!rows.length) return; const existing = readFileSync(p, 'utf-8').replace(/\n+$/,'\n'); writeFileSync(p, existing + rows.join('\n') + '\n'); };
appendCsv(T('cost-lines.csv'), costLineRows);
appendCsv(T('time-tracking.csv'), timeRows);
appendCsv(T('media-spend.csv'), mediaRows);
appendCsv(T('agent-usage.csv'), agentRows);

console.log('Done.');
console.log(`  people: ${people.length}, campaigns: ${campaigns.length}, executions: ${executions.length}, approvals: ${approvalSteps.length}`);
console.log(`  +cost-lines ${costLineRows.length}, +time ${timeRows.length}, +media ${mediaRows.length}, +agent-usage ${agentRows.length}`);
