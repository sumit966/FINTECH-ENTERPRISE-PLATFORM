import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export async function listNotifications(userId: string, params: { page: number; pageSize: number; type?: string; isRead?: string }) {
  const { page, pageSize, type, isRead } = params;
  const where: Prisma.NotificationWhereInput = { userId };
  if (type) where.type = type;
  if (isRead === 'true') where.isRead = true;
  if (isRead === 'false') where.isRead = false;

  const [total, rows, unreadCount] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  const items = rows.map((n) => ({
    id: n.id, type: n.type, title: n.title, body: n.body, link: n.link,
    isRead: n.isRead, readAt: n.readAt, createdAt: n.createdAt,
  }));
  return { ...paginated(items, page, pageSize, total), unreadCount };
}

export async function markAsRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}