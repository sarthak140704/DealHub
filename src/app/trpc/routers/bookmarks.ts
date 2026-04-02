import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const bookmarksRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.object({ dealId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db.bookmark.findUnique({
        where: {
          userId_dealId: { userId: ctx.session.userId, dealId: input.dealId },
        },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already bookmarked' });
      }

      const bookmark = await db.bookmark.create({
        data: {
          userId: ctx.session.userId,
          dealId: input.dealId,
        },
      });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'DEAL_BOOKMARKED' },
      });

      return bookmark;
    }),

  remove: protectedProcedure
    .input(z.object({ dealId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.bookmark.deleteMany({
        where: {
          userId: ctx.session.userId,
          dealId: input.dealId,
        },
      });
      return { success: true };
    }),

  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await db.bookmark.findMany({
      where: { userId: ctx.session.userId },
      include: {
        deal: {
          include: {
            category: true,
            vendor: { include: { user: { select: { username: true } } } },
            store: true,
            _count: { select: { bookmarks: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    return bookmarks;
  }),

  isBookmarked: protectedProcedure
    .input(z.object({ dealId: z.string() }))
    .query(async ({ input, ctx }) => {
      const bookmark = await db.bookmark.findUnique({
        where: {
          userId_dealId: { userId: ctx.session.userId, dealId: input.dealId },
        },
      });
      return !!bookmark;
    }),
});
