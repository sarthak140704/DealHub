import { z } from 'zod';
import { createTRPCRouter, baseProcedure, protectedProcedure, vendorProcedure, adminProcedure } from '../init';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const dealsRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(
      z.object({
        q: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sort: z.enum(['newest', 'popular', 'discount', 'price_asc']).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
      }).optional()
    )
    .query(async ({ input }) => {
      const { q, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = input || {};

      const where: any = { status: 'ACTIVE' };

      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.category = { slug: category };
      }

      if (minPrice !== undefined) {
        where.discountPrice = { ...where.discountPrice, gte: minPrice };
      }
      if (maxPrice !== undefined) {
        where.discountPrice = { ...where.discountPrice, lte: maxPrice };
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'price_asc') orderBy = { discountPrice: 'asc' };
      if (sort === 'newest') orderBy = { createdAt: 'desc' };
      if (sort === 'discount') orderBy = { discountPrice: 'asc' };

      const [deals, total] = await Promise.all([
        db.deal.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            category: true,
            vendor: { include: { user: { select: { username: true } } } },
            store: true,
            _count: { select: { bookmarks: true, reviews: true } },
          },
        }),
        db.deal.count({ where }),
      ]);

      return { deals, total, page, totalPages: Math.ceil(total / limit) };
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const deal = await db.deal.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          vendor: { include: { user: { select: { username: true } } } },
          store: true,
          reviews: { include: { user: { select: { username: true } } } },
          _count: { select: { bookmarks: true, reviews: true } },
        },
      });

      if (!deal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' });
      }

      return deal;
    }),

  create: vendorProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        originalPrice: z.number().positive(),
        discountPrice: z.number().positive(),
        dealUrl: z.string().url(),
        expiryDate: z.string(),
        categoryId: z.string(),
        storeId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const vendor = await db.vendor.findUnique({
        where: { userId: ctx.session.userId },
      });

      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor profile not found' });
      }

      const deal = await db.deal.create({
        data: {
          title: input.title,
          description: input.description,
          originalPrice: input.originalPrice,
          discountPrice: input.discountPrice,
          dealUrl: input.dealUrl,
          expiryDate: new Date(input.expiryDate),
          categoryId: input.categoryId,
          vendorId: vendor.id,
          storeId: input.storeId || null,
          status: 'PENDING_APPROVAL',
        },
      });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'DEAL_SUBMITTED' },
      });

      return deal;
    }),

  update: vendorProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        originalPrice: z.number().positive().optional(),
        discountPrice: z.number().positive().optional(),
        dealUrl: z.string().url().optional(),
        expiryDate: z.string().optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const vendor = await db.vendor.findUnique({ where: { userId: ctx.session.userId } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' });

      const deal = await db.deal.findFirst({
        where: { id: input.id, vendorId: vendor.id },
      });

      if (!deal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found or not yours' });
      }

      const { id, expiryDate, ...rest } = input;
      const data: any = { ...rest };
      if (expiryDate) data.expiryDate = new Date(expiryDate);

      return db.deal.update({ where: { id }, data });
    }),

  delete: vendorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const vendor = await db.vendor.findUnique({ where: { userId: ctx.session.userId } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' });

      const deal = await db.deal.findFirst({
        where: { id: input.id, vendorId: vendor.id },
      });

      if (!deal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found or not yours' });
      }

      return db.deal.update({
        where: { id: input.id },
        data: { status: 'DELETED' },
      });
    }),

  approve: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deal = await db.deal.update({
        where: { id: input.id },
        data: { status: 'ACTIVE' },
      });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'DEAL_APPROVED' },
      });

      return deal;
    }),

  reject: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deal = await db.deal.update({
        where: { id: input.id },
        data: { status: 'REJECTED' },
      });

      await db.auditLog.create({
        data: { userId: ctx.session.userId, actionType: 'DEAL_REJECTED' },
      });

      return deal;
    }),

  // Admin: get all deals regardless of status
  getAllAdmin: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20 } = input || {};

      const [deals, total] = await Promise.all([
        db.deal.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            category: true,
            vendor: { include: { user: { select: { username: true } } } },
          },
        }),
        db.deal.count(),
      ]);

      return { deals, total, page, totalPages: Math.ceil(total / limit) };
    }),
});
