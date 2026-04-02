import { z } from 'zod';
import { createTRPCRouter, baseProcedure, protectedProcedure } from '../init';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, createSession, destroySession, getSession } from '@/lib/auth';
import { TRPCError } from '@trpc/server';

export const authRouter = createTRPCRouter({
  register: baseProcedure
    .input(
      z.object({
        username: z.string().min(3).max(30),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['CUSTOMER', 'VENDOR']),
        companyName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.user.findFirst({
        where: {
          OR: [{ email: input.email }, { username: input.username }],
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: existing.email === input.email
            ? 'Email already registered'
            : 'Username already taken',
        });
      }

      const passwordHash = await hashPassword(input.password);

      const user = await db.user.create({
        data: {
          username: input.username,
          email: input.email,
          passwordHash,
          role: input.role,
        },
      });

      if (input.role === 'VENDOR') {
        await db.vendor.create({
          data: {
            userId: user.id,
            companyName: input.companyName || input.username,
          },
        });
      }

      await createSession(user.id, user.role);

      await db.auditLog.create({
        data: { userId: user.id, actionType: 'USER_REGISTERED' },
      });

      return { id: user.id, username: user.username, email: user.email, role: user.role };
    }),

  login: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);

      if (!valid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      await createSession(user.id, user.role);

      await db.auditLog.create({
        data: { userId: user.id, actionType: 'USER_LOGIN' },
      });

      return { id: user.id, username: user.username, email: user.email, role: user.role };
    }),

  logout: protectedProcedure.mutation(async () => {
    await destroySession();
    return { success: true };
  }),

  getSession: baseProcedure.query(async () => {
    const session = await getSession();
    if (!session) return null;

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, email: true, role: true, preferences: true },
    });

    return user;
  }),
});
