import { z } from 'zod';
import { createTRPCRouter, baseProcedure, adminProcedure } from '../init';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const categoriesRouter = createTRPCRouter({
  getAll: baseProcedure.query(async () => {
    return db.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { deals: true } } },
    });
  }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db.category.findFirst({
        where: { OR: [{ name: input.name }, { slug: input.slug }] },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Category already exists' });
      }

      const category = await db.category.create({ data: input });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'CATEGORY_CREATED' },
      });

      return category;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.category.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const dealsCount = await db.deal.count({ where: { categoryId: input.id } });
      if (dealsCount > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete category with ${dealsCount} deals`,
        });
      }

      await db.category.delete({ where: { id: input.id } });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'CATEGORY_DELETED' },
      });

      return { success: true };
    }),
});
