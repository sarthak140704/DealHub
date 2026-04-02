import { createTRPCRouter } from '../init';
import { authRouter } from './auth';
import { dealsRouter } from './deals';
import { bookmarksRouter } from './bookmarks';
import { categoriesRouter } from './categories';
import { usersRouter } from './users';
import { notificationsRouter } from './notifications';
import { reviewsRouter } from './reviews';
import { auditLogsRouter } from './auditLogs';
import { vendorRouter } from './vendor';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  deals: dealsRouter,
  bookmarks: bookmarksRouter,
  categories: categoriesRouter,
  users: usersRouter,
  notifications: notificationsRouter,
  reviews: reviewsRouter,
  auditLogs: auditLogsRouter,
  vendor: vendorRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;