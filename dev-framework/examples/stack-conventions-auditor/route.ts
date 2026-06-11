// Example file — part of `examples/stack-conventions-auditor/` in the Dev Framework.
// When adopting: copy to a project's `app/api/cron/conventions-audit/route.ts`.

import { Anthropic } from '@anthropic-ai/sdk';
import { Octokit } from '@octokit/rest';
import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min — audits can take time

// -- Environment validation -----------------------------------------------

const envSchema = z.object({
  CRON_SECRET: z.string().min(32),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  GITHUB_TOKEN: z.string().min(10),
  GITHUB_OWNER: z.string(),
  GITHUB_REPO: z.string(),
  CLAUDE_MD_PATH: z.string().default('CLAUDE.md'),
  AUDIT_DIR: z.string().default('audits'),
  BASE_BRANCH: z.string().default('main'),
});

// -- The audit prompt -----------------------------------------------------

const AUDIT_SYSTEM_PROMPT = `You are the stack-conventions-auditor skill running headlessly via Vercel Cron.

Your task: audit the supplied CLAUDE.md against current Next.js, Vercel, and Neon documentation. Produce a structured Markdown report following the exact format in your SKILL.md.

Critical rules:
1. Cite every claim with the URL it came from. Use web_search and web_fetch to verify CURRENT state — do not rely on training data for any claim about "current" behavior.
2. Always fetch the npm registry for current package versions.
3. Be conservative on MAJOR classifications — only if there's a clear behavior change or breaking change in current docs.
4. Propose exact replacement text the user can copy-paste, not vague guidance.
5. If the CLAUDE.md lacks the audit: metadata block or anchors: block, return a report explaining what's missing — do not invent anchors.

Output ONLY the Markdown report. No preamble, no postamble.`;

// -- Route handler --------------------------------------------------------

export async function GET(request: Request) {
  // 1. Authenticate the cron invocation
  const authHeader = request.headers.get('authorization');
  const env = envSchema.safeParse(process.env);

  if (!env.success) {
    return NextResponse.json(
      { error: 'Server misconfigured', missing: env.error.flatten() },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${env.data.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    ANTHROPIC_API_KEY,
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    CLAUDE_MD_PATH,
    AUDIT_DIR,
    BASE_BRANCH,
  } = env.data;

  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    // 2. Fetch current CLAUDE.md from the repo
    const { data: fileData } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: CLAUDE_MD_PATH,
      ref: BASE_BRANCH,
    });

    if (Array.isArray(fileData) || fileData.type !== 'file') {
      throw new Error(`${CLAUDE_MD_PATH} is not a file`);
    }

    const claudeMdContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const claudeMdSha = fileData.sha;

    // 3. Load the skill instructions (bundled at build time)
    let skillBody = '';
    try {
      skillBody = readFileSync(
        process.cwd() + '/skills/stack-conventions-auditor/SKILL.md',
        'utf-8'
      );
    } catch {
      // Skill not bundled — fall back to system prompt only
      skillBody = '';
    }

    // 4. Run the audit via Claude with web search enabled
    const today = new Date().toISOString().slice(0, 10);
    const userPrompt = [
      skillBody && `Skill instructions:\n\n${skillBody}`,
      `Audit the following CLAUDE.md as of ${today}:`,
      '```markdown',
      claudeMdContent,
      '```',
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      system: AUDIT_SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: userPrompt }],
    });

    // 5. Extract the report text from all content blocks
    const report = response.content
      .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
      .map((block) => block.text)
      .join('\n\n');

    if (!report.trim()) {
      throw new Error('Empty audit report from Claude');
    }

    // 6. Decide whether to open a PR
    //    Skip if the report has zero MAJOR / MINOR / NEW / BROKEN findings.
    const hasFindings = /^\s*-\s*Findings:\s*[1-9]/m.test(report) ||
      /## (Major|Minor|New|Broken)/i.test(report);

    if (!hasFindings) {
      return NextResponse.json({
        status: 'ok',
        action: 'no-pr',
        message: 'Audit complete — no changes needed.',
        date: today,
      });
    }

    // 7. Create a branch, commit the report, open a PR
    const branchName = `audit/conventions-${today}`;

    // Get base branch SHA
    const { data: baseRef } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${BASE_BRANCH}`,
    });

    // Create the branch
    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    // Commit the audit report
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: `${AUDIT_DIR}/${today}-conventions-audit.md`,
      message: `audit: conventions review ${today}`,
      content: Buffer.from(report, 'utf-8').toString('base64'),
      branch: branchName,
    });

    // Update the last_reviewed date in CLAUDE.md
    const updatedClaudeMd = claudeMdContent.replace(
      /last_reviewed:\s*\d{4}-\d{2}-\d{2}/,
      `last_reviewed: ${today}`
    );
    if (updatedClaudeMd !== claudeMdContent) {
      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: CLAUDE_MD_PATH,
        message: `audit: bump last_reviewed to ${today}`,
        content: Buffer.from(updatedClaudeMd, 'utf-8').toString('base64'),
        sha: claudeMdSha,
        branch: branchName,
      });
    }

    // Open the PR
    const { data: pr } = await octokit.pulls.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: `🔍 Stack conventions audit — ${today}`,
      head: branchName,
      base: BASE_BRANCH,
      body: report,
    });

    return NextResponse.json({
      status: 'ok',
      action: 'pr-opened',
      pr_url: pr.html_url,
      pr_number: pr.number,
      date: today,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[conventions-audit cron] failed:', error);
    return NextResponse.json(
      { status: 'error', error: message },
      { status: 500 }
    );
  }
}
