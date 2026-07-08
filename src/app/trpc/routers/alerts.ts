import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const alertsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.dealAlert.findMany({
      where: { userId: ctx.session.userId },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }),

  create: protectedProcedure
    .input(
      z
        .object({
          categoryId: z.string().optional(),
          keyword: z.string().trim().min(2).max(60).optional(),
        })
        .refine((d) => d.categoryId || d.keyword, {
          message: 'Provide a category, a keyword, or both',
        })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db.dealAlert.findFirst({
        where: {
          userId: ctx.session.userId,
          categoryId: input.categoryId ?? null,
          keyword: input.keyword ?? null,
        },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'You already have this alert' });
      }

      return db.dealAlert.create({
        data: {
          userId: ctx.session.userId,
          categoryId: input.categoryId ?? null,
          keyword: input.keyword ?? null,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.dealAlert.deleteMany({
        where: { id: input.id, userId: ctx.session.userId },
      });
      return { success: true };
    }),
});
