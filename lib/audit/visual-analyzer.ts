
import OpenAI from 'openai';
import { Finding } from '../types';
import path from 'path';
import { promises as fs } from 'fs';
// import uxRules from '../config/rules/ux.json'; // Removed in favor of DB
import personasConfig from '../config/personas.json';
import cialdiniConfig from '../config/cialdini.json';
import { supabase } from '../supabase';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Visual Analysis Result from AI
 */
interface AIAnalysisResult {
    visual: {
        hierarchy: { score: number; reason: string };
        whitespace: { score: number; reason: string };
        typography: { score: number; reason: string };
        color: { score: number; reason: string };
        grid: { score: number; reason: string };
        balance: { score: number; reason: string };
    };
    experience: {
        aboveFold: { score: number; reason: string };
        valueProp: { score: number; reason: string };
        cta: { score: number; reason: string };
        navigation: { score: number; reason: string };
        trust: { score: number; reason: string };
    };
    personas: Record<string, { score: number; reason: string }>;
    cialdini: Record<string, { score: number; reason: string }>;
}

/**
 * Perform AI Visual Analysis on a screenshot
 */
export async function auditVisualDesign(screenshot: string | Buffer): Promise<{ score: number; findings: Finding[] }> {
    const findings: Finding[] = [];

    try {
        console.log(`🤖 Starting AI Visual Analysis on: ${typeof screenshot === 'string' ? path.basename(screenshot) : 'in-memory screenshot'}`);

        // 0. Fetch Rules from DB
        const { data: rulesData, error: rulesError } = await supabase
            .from('ai_rules')
            .select('*')
            .eq('is_active', true);

        if (rulesError) {
            console.error('Error fetching AI rules:', rulesError);
        }

        // Create lookup map: RuleID -> Rule
        const rulesMap = new Map(rulesData?.map(r => [r.id, r]) || []);

        // 1. Read screenshot (from disk path or an in-memory buffer)
        const imageBuffer = typeof screenshot === 'string' ? await fs.readFile(screenshot) : screenshot;
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        // 2. prompt for GPT-4o
        const personasText = personasConfig.personas.map(p =>
            `- ${p.name} (${p.role}): Goal: "${p.goal}". Focus: "${p.focus}"`
        ).join('\n');

        const cialdiniText = cialdiniConfig.principles.map(p =>
            `- ${p.name}: ${p.description} Focus: "${p.focus}"`
        ).join('\n');

        const prompt = `
        Analyze this website screenshot for UI/UX best practices, specific User Personas, and Cialdini's Persuasion Principles.
        
        PART 1: Standard UI/UX Metrics (0-10)
        Rate Visual Design (Hierarchy, Whitespace, etc.) and Experience (Above Fold, Value Prop, etc.).

        PART 2: User Personas (0-10)
        Adopt the perspective of each persona and rate how well the site meets their specific needs and goals:
        ${personasText}

        PART 3: Cialdini's Persuasion Principles (0-10)
        Rate how effectively the site applies each principle:
        ${cialdiniText}

        Return PURE JSON format (no markdown):
        {
            "visual": {
                "hierarchy": { "score": 0-10, "reason": "..." },
                "whitespace": { "score": 0-10, "reason": "..." },
                "typography": { "score": 0-10, "reason": "..." },
                "color": { "score": 0-10, "reason": "..." },
                "grid": { "score": 0-10, "reason": "..." },
                "balance": { "score": 0-10, "reason": "..." }
            },
            "experience": {
                "aboveFold": { "score": 0-10, "reason": "..." },
                "valueProp": { "score": 0-10, "reason": "..." },
                "cta": { "score": 0-10, "reason": "..." },
                "navigation": { "score": 0-10, "reason": "..." },
                "trust": { "score": 0-10, "reason": "..." }
            },
            "personas": {
                "${personasConfig.personas[0].id}": { "score": 0-10, "reason": "..." },
                // ... include all persona IDs
            },
            "cialdini": {
                "${cialdiniConfig.principles[0].id}": { "score": 0-10, "reason": "..." },
                // ... include all principle IDs
            }
        }
        `;

        // 3. Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": dataUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500,
        });

        // 4. Parse result
        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from OpenAI");

        const result: AIAnalysisResult = JSON.parse(content);

        // 5. Map to Findings using DB rules

        // Helper to map score to status
        const getStatus = (score: number) => {
            if (score >= 8) return 'pass';
            if (score >= 5) return 'warning';
            return 'fail';
        };

        // Helper to create finding object
        const createFinding = (category: string, ruleId: string, scoreData?: { score: number; reason: string }): Finding | null => {
            const rule = rulesMap.get(ruleId);

            // If rule not in DB, return null (or fallback to code-defined default if you prefer)
            if (!rule) {
                // console.warn(`Rule ${ruleId} not found in DB`); // Optional logging
                return null;
            }

            if (!scoreData) return null;

            const status = scoreData.score >= 8 ? 'pass' : scoreData.score >= 5 ? 'warning' : 'fail';

            return {
                ruleId: rule.id,
                description: rule.rule_name, // DB column is rule_name
                level: rule.priority_level as any, // DB column is priority_level
                status: status,
                details: `Score: ${scoreData.score}/10. ${scoreData.reason}`,
                impact: rule.impact,
                recommendation: rule.recommendation,
            };
        };

        // VISUAL RULES
        const vFindings = [
            createFinding('visual', "UX-VIS-001", result.visual.hierarchy),
            createFinding('visual', "UX-VIS-002", result.visual.whitespace),
            createFinding('visual', "UX-VIS-003", result.visual.typography),
            createFinding('visual', "UX-VIS-004", result.visual.color),
            createFinding('visual', "UX-VIS-009", result.visual.grid),
            createFinding('visual', "UX-VIS-010", result.visual.balance),
        ].filter(Boolean) as Finding[];

        findings.push(...vFindings);

        // EXPERIENCE RULES
        const eFindings = [
            createFinding('experience', "UX-EXP-001", result.experience.aboveFold),
            createFinding('experience', "UX-EXP-002", result.experience.valueProp),
            createFinding('experience', "UX-EXP-003", result.experience.cta),
            createFinding('experience', "UX-EXP-004", result.experience.navigation),
            createFinding('experience', "UX-EXP-007", result.experience.trust),
        ].filter(Boolean) as Finding[];

        findings.push(...eFindings);

        // PERSONAS (Dynamic generation)
        if (result.personas) {
            Object.entries(result.personas).forEach(([personaId, data]) => {
                const persona = personasConfig.personas.find(p => p.id === personaId);
                if (persona) {
                    findings.push({
                        ruleId: `UX-PERSONA-${personaId.toUpperCase()}`,
                        description: `Persona: ${persona.name}`,
                        level: 'advisory',
                        status: getStatus(data.score),
                        details: `Score: ${data.score}/10. ${data.reason}`,
                        impact: `Site may not meet the needs of ${persona.role}.`,
                        recommendation: `Optimize for: ${persona.focus}`,
                    });
                }
            });
        }

        // CIALDINI (Dynamic generation)
        if (result.cialdini) {
            Object.entries(result.cialdini).forEach(([principleId, data]) => {
                const principle = cialdiniConfig.principles.find(p => p.id === principleId);
                if (principle) {
                    findings.push({
                        ruleId: `UX-CIALDINI-${principleId.toUpperCase()}`,
                        description: `Principle: ${principle.name}`,
                        level: 'advisory',
                        status: getStatus(data.score),
                        details: `Score: ${data.score}/10. ${data.reason}`,
                        impact: `Missed opportunity for persuasion via ${principle.name}.`,
                        recommendation: principle.focus,
                    });
                }
            });
        }

        console.log(`✅ AI Analysis complete. Generated ${findings.length} findings.`);

    } catch (error) {
        console.error('AI Visual Analysis failed:', error);
        // Don't fail the whole crawl, just return empty findings or a warning
        findings.push({
            ruleId: 'UX-AI-ERROR',
            description: 'AI Visual Analysis',
            level: 'advisory',
            status: 'warning',
            details: `AI analysis failed: ${(error as Error).message}`,
            impact: 'Cannot evaluate visual design metrics',
            recommendation: 'Check OpenAI API key and limits',
        });
    }

    const score = calculateScore(findings);

    return {
        score,
        findings
    };
}

/**
 * Calculate score from findings
 */
function calculateScore(findings: Finding[]): number {
    if (findings.length === 0) return 100;

    let totalWeight = 0;
    let earnedWeight = 0;

    findings.forEach(finding => {
        // Weight by level: mandatory = 3, advisory = 2, acceptable = 1
        const weight = finding.level === 'mandatory' ? 3 :
            finding.level === 'advisory' ? 2 : 1;

        totalWeight += weight;

        if (finding.status === 'pass') {
            earnedWeight += weight;
        } else if (finding.status === 'warning') {
            earnedWeight += weight * 0.5; // Partial credit for warnings
        }
        // 'fail' gets 0 points
    });

    return Math.round((earnedWeight / totalWeight) * 100);
}
