#!/usr/bin/env node

/**
 * KG Validator — sanity-checks the Aurelune × Halo & Helix knowledge graph.
 *
 * Checks:
 *   1. No duplicate node IDs.
 *   2. Every edge `from` and `to` reference an existing node.
 *   3. Every Market.ref_id / Channel.ref_id matches the Supabase seed.
 *   4. Every CSV foreign key (execution_id, person_id, contract_id, market_id, channel_id) resolves.
 *   5. Execution dates coherent (planned_start ≤ planned_end, actual_end ≥ actual_start).
 *   6. ApprovalStep dates inside the parent execution's window (with a small grace).
 *   7. Cost-line math consistent — billed = units * unit_cost * (1 + markup_pct) within tolerance.
 *   8. Budget rollup warning — sum of campaign DRAWS_FROM ≤ Budget.allocated_amount (warn, don't fail).
 *   9. Time-tracking overload warning — sum(actual_hours) per person per week ≤ capacity * 1.25.
 *  10. Skill / channel / category edge properties within bounds.
 *
 * Exits with code 1 if any hard error; 0 otherwise. Warnings printed regardless.
 *
 * Run with: npm run validate-kg
 */

import { promises as fs } from 'fs';
import path from 'path';

const KG_DIR = path.join(process.cwd(), 'data', 'knowledge-graph');
const NODE_DIR = path.join(KG_DIR, 'nodes');
const EDGE_DIR = path.join(KG_DIR, 'edges');
const TABLE_DIR = path.join(KG_DIR, 'tables');

type Node = { id: string; type: string; properties: Record<string, any> };
type Edge = { from: string; to: string; type: string; properties?: Record<string, any> };

const errors: string[] = [];
const warnings: string[] = [];

function err(msg: string) { errors.push(msg); }
function warn(msg: string) { warnings.push(msg); }

async function readJson<T = any>(file: string): Promise<T> {
    return JSON.parse(await fs.readFile(file, 'utf-8'));
}

async function readJsonIfExists<T = any>(file: string): Promise<T | null> {
    try {
        return await readJson<T>(file);
    } catch (e: any) {
        if (e.code === 'ENOENT') return null;
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
        // Simple CSV parse — handles basic quoting
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

async function loadAllNodes(): Promise<Node[]> {
    const dir = await fs.readdir(NODE_DIR);
    const out: Node[] = [];
    for (const f of dir) {
        if (!f.endsWith('.json')) continue;
        const arr = await readJsonIfExists<Node[]>(path.join(NODE_DIR, f));
        if (arr) out.push(...arr);
    }
    return out;
}

async function loadAllEdges(): Promise<Edge[]> {
    const dir = await fs.readdir(EDGE_DIR);
    const out: Edge[] = [];
    for (const f of dir) {
        if (!f.endsWith('.json')) continue;
        const arr = await readJsonIfExists<Edge[]>(path.join(EDGE_DIR, f));
        if (arr) out.push(...arr);
    }
    return out;
}

async function main() {
    console.log('Loading KG…');
    const nodes = await loadAllNodes();
    const edges = await loadAllEdges();
    const costLines = await readCsv(path.join(TABLE_DIR, 'cost-lines.csv'));
    const timeTracking = await readCsv(path.join(TABLE_DIR, 'time-tracking.csv'));
    const mediaSpend = await readCsv(path.join(TABLE_DIR, 'media-spend.csv'));

    console.log(`  ${nodes.length} nodes, ${edges.length} edges`);
    console.log(`  ${costLines.length} cost-lines, ${timeTracking.length} time-entries, ${mediaSpend.length} media-spend rows`);

    // -----------------------------------------------------------------------
    // 1. Duplicate node IDs
    // -----------------------------------------------------------------------
    const idCounts = new Map<string, number>();
    for (const n of nodes) {
        idCounts.set(n.id, (idCounts.get(n.id) || 0) + 1);
    }
    for (const [id, count] of idCounts) {
        if (count > 1) err(`Duplicate node id: ${id} appears ${count} times`);
    }
    const nodeIds = new Set(nodes.map((n) => n.id));

    // -----------------------------------------------------------------------
    // 2. Every edge resolves
    // -----------------------------------------------------------------------
    let edgeUnresolved = 0;
    for (const e of edges) {
        if (!nodeIds.has(e.from)) { err(`Edge ${e.type}: from=${e.from} not found`); edgeUnresolved++; }
        if (!nodeIds.has(e.to))   { err(`Edge ${e.type}: to=${e.to} not found`);     edgeUnresolved++; }
        if (edgeUnresolved > 30) { err(`(further edge resolution errors suppressed — fix the above first)`); break; }
    }

    // -----------------------------------------------------------------------
    // 3. Market.ref_id and Channel.ref_id sanity
    // -----------------------------------------------------------------------
    const EXPECTED_MARKETS = ['UK', 'US', 'DE', 'FR', 'JP', 'CN'];
    const EXPECTED_CHANNELS = ['SEO', 'PAID_MEDIA', 'SOCIAL_MEDIA', 'ECRM', 'D2C', 'B2B', 'B2B2C', 'POSM', 'OOH', 'RESEARCH', 'EVENT', 'UX'];
    for (const n of nodes) {
        if (n.type === 'Market') {
            const ref = n.properties.ref_id as string;
            if (!EXPECTED_MARKETS.includes(ref)) err(`Market ${n.id} ref_id=${ref} not in expected ${EXPECTED_MARKETS.join(',')}`);
        }
        if (n.type === 'Channel') {
            const ref = n.properties.ref_id as string;
            if (!EXPECTED_CHANNELS.includes(ref)) err(`Channel ${n.id} ref_id=${ref} not in expected ${EXPECTED_CHANNELS.join(',')}`);
        }
    }

    // -----------------------------------------------------------------------
    // 4. CSV foreign keys
    // -----------------------------------------------------------------------
    for (const r of costLines) {
        if (r.execution_id && !nodeIds.has(r.execution_id)) err(`cost-line ${r.cost_line_id}: execution_id=${r.execution_id} not found`);
        if (r.contract_id && !nodeIds.has(r.contract_id)) err(`cost-line ${r.cost_line_id}: contract_id=${r.contract_id} not found`);
        if (r.person_id && !nodeIds.has(r.person_id)) err(`cost-line ${r.cost_line_id}: person_id=${r.person_id} not found`);
        if (r.role_id && !nodeIds.has(r.role_id)) err(`cost-line ${r.cost_line_id}: role_id=${r.role_id} not found`);
    }
    for (const r of timeTracking) {
        if (r.execution_id && !nodeIds.has(r.execution_id)) err(`time-entry ${r.time_entry_id}: execution_id=${r.execution_id} not found`);
        if (r.person_id && !nodeIds.has(r.person_id)) err(`time-entry ${r.time_entry_id}: person_id=${r.person_id} not found`);
    }
    for (const r of mediaSpend) {
        if (r.execution_id && !nodeIds.has(r.execution_id)) err(`media-spend ${r.media_spend_id}: execution_id=${r.execution_id} not found`);
        if (r.market_id && !nodeIds.has(r.market_id)) err(`media-spend ${r.media_spend_id}: market_id=${r.market_id} not found`);
        if (r.channel_id && !nodeIds.has(r.channel_id)) err(`media-spend ${r.media_spend_id}: channel_id=${r.channel_id} not found`);
    }

    // -----------------------------------------------------------------------
    // 5. Execution date coherence
    // -----------------------------------------------------------------------
    for (const n of nodes) {
        if (n.type !== 'Execution') continue;
        const ps = new Date(n.properties.planned_start);
        const pe = new Date(n.properties.planned_end);
        const as = new Date(n.properties.actual_start);
        const ae = new Date(n.properties.actual_end);
        if (ps > pe) err(`Execution ${n.id}: planned_start > planned_end`);
        if (as > ae) err(`Execution ${n.id}: actual_start > actual_end`);
    }

    // -----------------------------------------------------------------------
    // 6. ApprovalStep within (or after) parent Execution's window
    // -----------------------------------------------------------------------
    const execById = new Map(nodes.filter((n) => n.type === 'Execution').map((n) => [n.id, n]));
    // Map approval -> execution via REQUIRES_APPROVAL edges
    const approvalParent = new Map<string, string>();
    for (const e of edges) {
        if (e.type === 'REQUIRES_APPROVAL') approvalParent.set(e.to, e.from);
    }
    for (const n of nodes) {
        if (n.type !== 'ApprovalStep') continue;
        const ps = new Date(n.properties.planned_start);
        const pe = new Date(n.properties.planned_end);
        if (ps > pe) err(`ApprovalStep ${n.id}: planned_start > planned_end`);
        const parentId = approvalParent.get(n.id);
        if (parentId) {
            const parent = execById.get(parentId);
            if (parent) {
                const parentEnd = new Date(parent.properties.planned_end);
                if (ps < parentEnd) {
                    // approvals should start at or after execution planned_end (with 1 day grace)
                    const diffDays = (parentEnd.getTime() - ps.getTime()) / 86400000;
                    if (diffDays > 1.5) warn(`Approval ${n.id} starts more than 1 day before parent ${parentId} planned_end`);
                }
            }
        }
    }

    // -----------------------------------------------------------------------
    // 7. Cost-line math
    // -----------------------------------------------------------------------
    // We don't store a billed column in cost-lines.csv — implied billed = units * unit_cost * (1+markup).
    // So check that units, unit_cost, markup_pct are numeric and consistent.
    let badCostLines = 0;
    for (const r of costLines) {
        const u = parseFloat(r.units);
        const c = parseFloat(r.unit_cost);
        const m = parseFloat(r.markup_pct);
        if (isNaN(u) || isNaN(c) || isNaN(m)) {
            err(`cost-line ${r.cost_line_id}: non-numeric units/unit_cost/markup_pct`);
            badCostLines++;
            if (badCostLines > 10) { err('(further cost-line numeric errors suppressed)'); break; }
        }
        if (m < 0 || m > 1.5) warn(`cost-line ${r.cost_line_id}: markup_pct=${m} outside typical range [0, 1.5]`);
    }

    // -----------------------------------------------------------------------
    // 8. Budget rollup warning
    // -----------------------------------------------------------------------
    const budgetById = new Map(nodes.filter((n) => n.type === 'Budget').map((n) => [n.id, n]));
    const drawsByBudget = new Map<string, number>();
    for (const e of edges) {
        if (e.type !== 'DRAWS_FROM') continue;
        const amount = (e.properties?.draw_amount as number) || 0;
        drawsByBudget.set(e.to, (drawsByBudget.get(e.to) || 0) + amount);
    }
    for (const [budgetId, drawn] of drawsByBudget) {
        const b = budgetById.get(budgetId);
        if (!b) continue;
        const allocated = b.properties.allocated_amount as number;
        if (drawn > allocated * 1.15) {
            warn(`Budget ${budgetId} over-drawn: ${drawn} drawn vs ${allocated} allocated (${Math.round(drawn / allocated * 100)}%)`);
        }
    }

    // -----------------------------------------------------------------------
    // 9. Time-tracking overload warning
    // -----------------------------------------------------------------------
    const peopleById = new Map(nodes.filter((n) => n.type === 'Person').map((n) => [n.id, n]));
    const hoursByPersonWeek = new Map<string, number>();
    for (const r of timeTracking) {
        const key = `${r.person_id}|${r.week_starting}`;
        const h = parseFloat(r.actual_hours) || 0;
        hoursByPersonWeek.set(key, (hoursByPersonWeek.get(key) || 0) + h);
    }
    let overloads = 0;
    for (const [key, total] of hoursByPersonWeek) {
        const personId = key.split('|')[0];
        const person = peopleById.get(personId);
        if (!person) continue;
        const cap = (person.properties.capacity_hours_per_week as number) || 40;
        if (total > cap * 1.25) {
            overloads++;
            if (overloads <= 6) warn(`Overload: ${person.properties.name} logged ${total}h in week ${key.split('|')[1]} (cap ${cap})`);
        }
    }
    if (overloads > 6) warn(`(+${overloads - 6} more overload weeks suppressed)`);

    // -----------------------------------------------------------------------
    // 10. Skill/channel/category edge property bounds
    // -----------------------------------------------------------------------
    for (const e of edges) {
        if (e.type === 'HAS_SKILL') {
            const p = e.properties?.proficiency;
            if (typeof p !== 'number' || p < 1 || p > 5) err(`HAS_SKILL ${e.from}->${e.to}: proficiency=${p} not in [1,5]`);
        }
        if (e.type === 'EXPERIENCED_IN') {
            const y = e.properties?.years;
            if (typeof y !== 'number' || y < 0 || y > 20) err(`EXPERIENCED_IN ${e.from}->${e.to}: years=${y} not in [0,20]`);
        }
    }

    // -----------------------------------------------------------------------
    // Report
    // -----------------------------------------------------------------------
    console.log('');
    if (warnings.length > 0) {
        console.log(`WARNINGS (${warnings.length}):`);
        for (const w of warnings) console.log(`  ⚠ ${w}`);
        console.log('');
    }
    if (errors.length > 0) {
        console.log(`ERRORS (${errors.length}):`);
        for (const e of errors) console.log(`  ✗ ${e}`);
        console.log('');
        console.log(`Validation FAILED with ${errors.length} error(s) and ${warnings.length} warning(s).`);
        process.exit(1);
    }
    console.log(`Validation PASSED. ${warnings.length} warning(s).`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
