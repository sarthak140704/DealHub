import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { db } from '@/lib/db';

export const notificationsRouter = createTRPCRouter({
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    return db.notification.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { sentAt: 'desc' },
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return db.notification.updateMany({
        where: { id: input.id, userId: ctx.session.userId },
        data: { isRead: true },
      });
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return db.notification.updateMany({
      where: { userId: ctx.session.userId, isRead: false },
      data: { isRead: true },
    });
  }),
});
