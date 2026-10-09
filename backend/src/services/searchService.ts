import { prisma } from '../config/prisma';

export interface SearchHit {
  kind: 'employee' | 'project' | 'client' | 'candidate' | 'knowledge';
  id: string;
  code: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface SearchContext {
  roles: string[];
  permissions: string[];
}

const SUPER_ROLES = new Set(['FOUNDER_CEO', 'DIRECTOR']);

function can(ctx: SearchContext, code: string): boolean {
  if (ctx.roles.some((r) => SUPER_ROLES.has(r))) return true;
  return ctx.permissions.includes(code);
}

export async function globalSearch(query: string, ctx: SearchContext, limitPerKind = 5) {
  const q = query.trim();
  if (!q || q.length < 2) return { hits: [], took: 0 };

  const startedAt = Date.now();
  const tasks: Promise<SearchHit[]>[] = [];

  if (can(ctx, 'employees.read')) {
    tasks.push(
      prisma.employee.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { employeeCode: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limitPerKind,
        select: {
          id: true, employeeCode: true, fullName: true, email: true,
          department: { select: { name: true } },
          location: { select: { city: true } },
        },
      }).then((rows) => rows.map((r) => ({
        kind: 'employee' as const,
        id: r.id,
        code: r.employeeCode,
        title: r.fullName,
        subtitle: r.department.name + ' · ' + r.location.city,
        link: '/employees/' + r.id,
      }))),
    );
  }

  if (can(ctx, 'projects.read')) {
    tasks.push(
      prisma.project.findMany({
        where: {
          OR: [
            { projectCode: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limitPerKind,
        select: {
          id: true, projectCode: true, name: true, status: true,
          client: { select: { companyName: true } },
        },
      }).then((rows) => rows.map((r) => ({
        kind: 'project' as const,
        id: r.id,
        code: r.projectCode,
        title: r.name,
        subtitle: r.client.companyName + ' · ' + r.status,
        link: '/projects/' + r.projectCode,
      }))),
    );
  }

  if (can(ctx, 'clients.read')) {
    tasks.push(
      prisma.client.findMany({
        where: {
          OR: [
            { clientCode: { contains: q, mode: 'insensitive' } },
            { companyName: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limitPerKind,
        select: { id: true, clientCode: true, companyName: true, country: true, industry: true },
      }).then((rows) => rows.map((r) => ({
        kind: 'client' as const,
        id: r.id,
        code: r.clientCode,
        title: r.companyName,
        subtitle: r.country + ' · ' + r.industry,
        link: '/clients/' + r.clientCode,
      }))),
    );
  }

  if (can(ctx, 'recruitment.read')) {
    tasks.push(
      prisma.candidate.findMany({
        where: {
          OR: [
            { candidateCode: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limitPerKind,
        select: { id: true, candidateCode: true, fullName: true, stage: true, job: { select: { title: true } } },
      }).then((rows) => rows.map((r) => ({
        kind: 'candidate' as const,
        id: r.id,
        code: r.candidateCode,
        title: r.fullName,
        subtitle: r.job.title + ' · ' + r.stage,
        link: '/recruitment/candidates/' + r.candidateCode,
      }))),
    );
  }

  if (can(ctx, 'knowledge.read')) {
    tasks.push(
      prisma.knowledgeArticle.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limitPerKind,
        select: { id: true, slug: true, title: true, category: true },
      }).then((rows) => rows.map((r) => ({
        kind: 'knowledge' as const,
        id: r.id,
        code: r.slug,
        title: r.title,
        subtitle: r.category,
        link: '/knowledge',
      }))),
    );
  }

  const results = await Promise.all(tasks);
  const hits = results.flat();
  return { hits, took: Date.now() - startedAt };
}