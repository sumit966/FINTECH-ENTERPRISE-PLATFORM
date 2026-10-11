import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as projectService from '../services/projectService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  industry: z.string().optional(),
  clientCode: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await projectService.listProjects(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await projectService.getProjectDetail(req.params.code);
    if (!p) { fail(res, 'Project not found', 404, 'NOT_FOUND'); return; }
    ok(res, p);
  } catch (e) { next(e); }
}

export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await projectService.getProjectsSummary()); } catch (e) { next(e); }
}


// ---------- Rule-based AI summary (no external LLM) ----------
// Reads real fields from the project and produces deterministic sentences.
// If you later configure AI_API_KEY, replace the body of this function to call
// your provider; the route signature stays the same.
export async function aiSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findUnique({
      where: { projectCode: req.params.code },
      include: {
        tasks: true,
        milestones: true,
        risks: true,
        invoices: true,
        members: true,
        client: true,
      },
    });
    if (!project) { res.status(404).json({ success: false, error: 'Project not found', code: 'NOT_FOUND' }); return; }

    const tasksDone = project.tasks.filter((t) => t.status === 'DONE').length;
    const totalTasks = project.tasks.length;
    const overdueMilestones = project.milestones.filter((m) => m.status !== 'COMPLETED' && new Date(m.dueDate) < new Date()).length;
    const highRisks = project.risks.filter((r) => r.severity === 'HIGH' || r.severity === 'CRITICAL').length;
    const totalInvoiced = project.invoices.reduce((s2, i) => s2 + Number(i.total), 0);
    const totalPaid = project.invoices.reduce((s2, i) => s2 + Number(i.paidAmount), 0);
    const outstanding = totalInvoiced - totalPaid;
    const burn = Number(project.budget) > 0 ? Number(project.cost) / Number(project.budget) : 0;

    const summary: string[] = [];
    summary.push(`${project.name} is a ${project.projectType.toLowerCase()} engagement for ${project.client.companyName} currently at ${project.progressPercent}% progress.`);

    const hs = project.healthScore != null ? Number(project.healthScore) : null;
    if (hs != null) {
      summary.push(hs >= 4.2
        ? `Health is strong (${(hs as number).toFixed(2)}/5). Portfolio manager reviews suggest the project is on track.`
        : hs >= 3.5
        ? `Health is moderate (${(hs as number).toFixed(2)}/5). Keep an eye on delivery pace.`
        : `Health is below target (${(hs as number).toFixed(2)}/5). Schedule a status review with the PM.`);
    }

    if (totalTasks > 0) {
      summary.push(`${tasksDone} of ${totalTasks} tasks complete (${Math.round((tasksDone / totalTasks) * 100)}%).`);
    }

    if (overdueMilestones > 0) {
      summary.push(`${overdueMilestones} milestone${overdueMilestones === 1 ? '' : 's'} are past their due date.`);
    }

    if (highRisks > 0) {
      summary.push(`${highRisks} high-severity risk${highRisks === 1 ? '' : 's'} on the register require mitigation planning.`);
    }

    if (Number(project.budget) > 0) {
      summary.push(burn > 0.9
        ? `Budget burn is ${Math.round(burn * 100)}% — spend is close to or above the allocation.`
        : `Budget burn is ${Math.round(burn * 100)}% — remaining headroom is available.`);
    }

    if (outstanding > 0) {
      summary.push(`Outstanding receivables: ₹${Math.round(outstanding).toLocaleString('en-IN')}.`);
    }

    res.json({
      success: true,
      data: {
        provider: 'rule-based',
        generatedAt: new Date().toISOString(),
        summary,
        signals: {
          progressPercent: project.progressPercent,
          healthScore: project.healthScore != null ? Number(project.healthScore) : null,
          riskScore: project.riskScore != null ? Number(project.riskScore) : null,
          tasksDone, totalTasks,
          overdueMilestones,
          highRisks,
          totalInvoiced, totalPaid, outstanding,
          budgetBurnPct: Math.round(burn * 100),
        },
        disclaimer: 'Rule-based summary generated from project records. No external LLM was invoked.',
      },
    });
  } catch (e) { next(e); }
}

// ---------- Code execution gateway ----------
// Does NOT execute code on this server. Forwards to EXECUTION_SERVICE_URL
// (Judge0/Piston/E2B) if configured. Otherwise returns an honest error.
export async function execute(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, language } = req.body as { code?: string; language?: string };
    if (!code || typeof code !== 'string' || code.length > 20000) {
      res.status(422).json({ success: false, error: 'code is required (max 20000 chars)', code: 'VALIDATION' }); return;
    }
    if (!language || typeof language !== 'string') {
      res.status(422).json({ success: false, error: 'language is required', code: 'VALIDATION' }); return;
    }
    const endpoint = process.env.EXECUTION_SERVICE_URL;
    if (!endpoint) {
      res.status(503).json({
        success: false,
        error: 'Execution backend not configured. Set EXECUTION_SERVICE_URL in backend/.env to enable code execution.',
        code: 'INTEGRATION_REQUIRED',
      });
      return;
    }
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      res.status(502).json({ success: false, error: 'Execution service error', code: 'UPSTREAM_ERROR', detail: data }); return;
    }
    res.json({ success: true, data });
  } catch (e: any) {
    next(Object.assign(new Error('Execution service unreachable: ' + e.message), { status: 502, code: 'UPSTREAM_UNREACHABLE' }));
  }
}
