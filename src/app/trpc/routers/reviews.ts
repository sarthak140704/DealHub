import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, baseProcedure } from '../init';
import { db } from '@/lib/db';

export const reviewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      dealId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(3),
    }))
    .mutation(async ({ input, ctx }) => {
      const review = await db.review.create({
        data: {
          userId: ctx.session.userId,
          dealId: input.dealId,
          rating: input.rating,
          comment: input.comment,
        },
      });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'REVIEW_POSTED' },
      });

      return review;
    }),

  getByDeal: baseProcedure
    .input(z.object({ dealId: z.string() }))
    .query(async ({ input }) => {
      return db.review.findMany({
        where: { dealId: input.dealId },
        include: { user: { select: { username: true } } },
        orderBy: { id: 'desc' },
      });
    }),
});
