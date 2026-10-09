import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListKnowledgeParams {
  page: number; pageSize: number; search?: string; category?: string;
}

export async function listArticles(params: ListKnowledgeParams) {
  const { page, pageSize, search, category } = params;
  const where: Prisma.KnowledgeArticleWhereInput = {};
  if (category) where.category = category;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { body: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }
  const [total, rows] = await Promise.all([
    prisma.knowledgeArticle.count({ where }),
    prisma.knowledgeArticle.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { viewCount: 'desc' },
    }),
  ]);
  const items = rows.map((a) => ({
    id: a.id, slug: a.slug, title: a.title, category: a.category,
    body: a.body, tags: a.tags, published: a.published, viewCount: a.viewCount,
    createdAt: a.createdAt, updatedAt: a.updatedAt,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getArticle(slug: string) {
  const a = await prisma.knowledgeArticle.findUnique({ where: { slug } });
  if (!a) return null;
  return { id: a.id, slug: a.slug, title: a.title, category: a.category, body: a.body, tags: a.tags, viewCount: a.viewCount, createdAt: a.createdAt, updatedAt: a.updatedAt };
}

export async function getKnowledgeSummary() {
  const [total, byCategory, topViewed] = await Promise.all([
    prisma.knowledgeArticle.count(),
    prisma.knowledgeArticle.groupBy({ by: ['category'], _count: { _all: true }, _sum: { viewCount: true } }),
    prisma.knowledgeArticle.findMany({ orderBy: { viewCount: 'desc' }, take: 5, select: { slug: true, title: true, viewCount: true, category: true } }),
  ]);
  return {
    total,
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all, totalViews: c._sum.viewCount || 0 })).sort((a, b) => b.count - a.count),
    topViewed: topViewed.map((t) => ({ slug: t.slug, title: t.title, viewCount: t.viewCount, category: t.category })),
  };
}