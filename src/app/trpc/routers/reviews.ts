import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, baseProcedure } from '../init';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const reviewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      dealId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(3),
    }))
    .mutation(async ({ input, ctx }) => {
      const deal = await db.deal.findUnique({ where: { id: input.dealId } });
      if (!deal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' });
      }

      const existing = await db.review.findUnique({
        where: {
          userId_dealId: { userId: ctx.session.userId, dealId: input.dealId },
        },
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already reviewed this deal',
        });
      }

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

      // Recompute the vendor's average rating across all their deals' reviews.
      const agg = await db.review.aggregate({
        where: { deal: { vendorId: deal.vendorId } },
        _avg: { rating: true },
      });
      await db.vendor.update({
        where: { id: deal.vendorId },
        data: { rating: agg._avg.rating ?? 0 },
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
