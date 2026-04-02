import { createTRPCRouter, adminProcedure } from '../init';
import { db } from '@/lib/db';
import { z } from 'zod';

export const auditLogsRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20 } = input || {};

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          orderBy: { timestamp: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { user: { select: { username: true, email: true, role: true } } },
        }),
        db.auditLog.count(),
      ]);

      return { logs, total, page, totalPages: Math.ceil(total / limit) };
    }),
});
