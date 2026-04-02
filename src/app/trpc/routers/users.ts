import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../init';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const usersRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20 } = input || {};

      const [users, total] = await Promise.all([
        db.user.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            vendor: { select: { companyName: true } },
          },
        }),
        db.user.count(),
      ]);

      return { users, total, page, totalPages: Math.ceil(total / limit) };
    }),

  updateRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.session.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot change your own role' });
      }

      const user = await db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      // Create vendor record if upgrading to vendor
      if (input.role === 'VENDOR') {
        const existingVendor = await db.vendor.findUnique({ where: { userId: input.userId } });
        if (!existingVendor) {
          await db.vendor.create({
            data: { userId: input.userId, companyName: user.username },
          });
        }
      }

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: `ROLE_CHANGED_TO_${input.role}` },
      });

      return user;
    }),

  delete: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.session.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete yourself' });
      }

      await db.user.delete({ where: { id: input.userId } });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'USER_DELETED' },
      });

      return { success: true };
    }),
});
