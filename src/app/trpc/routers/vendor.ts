import { createTRPCRouter, vendorProcedure } from '../init';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const vendorRouter = createTRPCRouter({
  getDashboardStats: vendorProcedure.query(async ({ ctx }) => {
    const vendor = await db.vendor.findUnique({
      where: { userId: ctx.session.userId },
    });

    if (!vendor) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor profile not found' });
    }

    const [total, active, pending, expired] = await Promise.all([
      db.deal.count({ where: { vendorId: vendor.id } }),
      db.deal.count({ where: { vendorId: vendor.id, status: 'ACTIVE' } }),
      db.deal.count({ where: { vendorId: vendor.id, status: 'PENDING_APPROVAL' } }),
      db.deal.count({ where: { vendorId: vendor.id, status: 'EXPIRED' } }),
    ]);

    return { total, active, pending, expired, companyName: vendor.companyName };
  }),

  getMyDeals: vendorProcedure.query(async ({ ctx }) => {
    const vendor = await db.vendor.findUnique({
      where: { userId: ctx.session.userId },
    });

    if (!vendor) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor profile not found' });
    }

    return db.deal.findMany({
      where: { vendorId: vendor.id, status: { not: 'DELETED' } },
      include: {
        category: true,
        store: true,
        _count: { select: { bookmarks: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  getAnalytics: vendorProcedure.query(async ({ ctx }) => {
    const vendor = await db.vendor.findUnique({
      where: { userId: ctx.session.userId },
    });

    if (!vendor) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor profile not found' });
    }

    const deals = await db.deal.findMany({
      where: { vendorId: vendor.id, status: { not: 'DELETED' } },
      include: {
        _count: { select: { bookmarks: true, reviews: true } },
      },
    });

    // Mock click data since we don't have real analytics yet
    return deals.map((deal) => ({
      id: deal.id,
      title: deal.title,
      clicks: Math.floor(Math.random() * 500) + 50,
      saves: deal._count.bookmarks,
      reviews: deal._count.reviews,
      status: deal.status,
    }));
  }),
});
