import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export async function listEvents(params: { from?: string; to?: string; category?: string }) {
  const where: Prisma.CalendarEventWhereInput = {};
  if (params.category) where.category = params.category;
  if (params.from || params.to) {
    where.startAt = {};
    if (params.from) (where.startAt as any).gte = new Date(params.from);
    if (params.to) (where.startAt as any).lte = new Date(params.to);
  }
  const rows = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startAt: 'asc' },
    take: 500,
  });
  return rows.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    startAt: e.startAt,
    endAt: e.endAt,
    allDay: e.allDay,
    location: e.location,
    projectId: e.projectId,
    clientId: e.clientId,
  }));
}

export async function getCalendarSummary() {
  const [total, byCategory, upcoming] = await Promise.all([
    prisma.calendarEvent.count(),
    prisma.calendarEvent.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.calendarEvent.findMany({
      where: { startAt: { gte: new Date() } },
      orderBy: { startAt: 'asc' },
      take: 10,
    }),
  ]);
  return {
    total,
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all })).sort((a, b) => b.count - a.count),
    upcoming: upcoming.map((e) => ({
      id: e.id, title: e.title, category: e.category,
      startAt: e.startAt, allDay: e.allDay, location: e.location,
    })),
  };
}