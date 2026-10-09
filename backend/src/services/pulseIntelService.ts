import { prisma } from '../config/prisma';

export type KpiUnit = 'PERCENT' | 'COUNT' | 'CURRENCY_INR' | 'HOURS' | 'RATIO';

export async function listKpis(params: { category?: string }) {
  const where = params.category ? { category: params.category } : {};
  const kpis = await prisma.kpi.findMany({
    where,
    orderBy: [{ category: 'asc' }, { code: 'asc' }],
    include: { snapshots: { orderBy: { capturedAt: 'desc' }, take: 30 } },
  });
  return kpis.map((k) => ({
    id: k.id,
    code: k.code,
    name: k.name,
    category: k.category,
    unit: k.unit,
    formula: k.formula,
    targetValue: k.targetValue != null ? Number(k.targetValue) : null,
    currentValue: k.currentValue != null ? Number(k.currentValue) : null,
    trend: k.trend,
    updatedAt: k.updatedAt,
    snapshots: k.snapshots.map((s) => ({ id: s.id, value: Number(s.value), capturedAt: s.capturedAt })).reverse(),
  }));
}

export async function getKpiByCode(code: string) {
  const k = await prisma.kpi.findUnique({
    where: { code },
    include: { snapshots: { orderBy: { capturedAt: 'asc' } } },
  });
  if (!k) return null;
  return {
    id: k.id, code: k.code, name: k.name, category: k.category, unit: k.unit,
    formula: k.formula,
    targetValue: k.targetValue != null ? Number(k.targetValue) : null,
    currentValue: k.currentValue != null ? Number(k.currentValue) : null,
    trend: k.trend,
    updatedAt: k.updatedAt,
    snapshots: k.snapshots.map((s) => ({ id: s.id, value: Number(s.value), capturedAt: s.capturedAt })),
  };
}

// Category scores: average attainment of target across the KPIs in that category,
// with higher-is-better assumed. Current value / target value * 100, capped at 120.
function attainmentScore(current: number | null, target: number | null): number | null {
  if (current == null || target == null || target === 0) return null;
  const score = (current / target) * 100;
  return Math.max(0, Math.min(120, score));
}

export async function getCategoryScores() {
  const kpis = await prisma.kpi.findMany();
  const byCategory: Record<string, { sum: number; count: number; totalTarget: number; totalCurrent: number }> = {};
  for (const k of kpis) {
    const cur = k.currentValue != null ? Number(k.currentValue) : null;
    const tgt = k.targetValue != null ? Number(k.targetValue) : null;
    const att = attainmentScore(cur, tgt);
    if (!byCategory[k.category]) byCategory[k.category] = { sum: 0, count: 0, totalTarget: 0, totalCurrent: 0 };
    if (att != null) {
      byCategory[k.category].sum += att;
      byCategory[k.category].count += 1;
    }
    if (tgt != null) byCategory[k.category].totalTarget += tgt;
    if (cur != null) byCategory[k.category].totalCurrent += cur;
  }
  return Object.entries(byCategory).map(([category, agg]) => ({
    category,
    score: agg.count > 0 ? agg.sum / agg.count : null,
    kpiCount: agg.count,
    totalTarget: agg.totalTarget,
    totalCurrent: agg.totalCurrent,
  }));
}

export async function getCategoryKpis(category: string) {
  return listKpis({ category });
}

export async function getOverallHealth() {
  const scores = await getCategoryScores();
  const valid = scores.filter((s) => s.score != null);
  const overall = valid.length > 0 ? valid.reduce((s, x) => s + (x.score || 0), 0) / valid.length : null;
  return {
    overallScore: overall,
    categories: scores,
  };
}