import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import prisma from '../config/prisma.js';

// Global mock for Better Auth
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test user',
    email: 'test@example.com',
    roles: ['ADMIN'],
  },
  session: {
    id: 'test-session-id',
    activeRole: 'ADMIN',
  },
};

vi.mock('../lib/auth.js', () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => mockSession),
    },
  },
}));

// Helper to truncate all tables
async function truncateTables() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';`;

  const tables = tablenames
    .map(({ tablename }) => `"${tablename}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}

beforeAll(async () => {
  // Ensure connection is established
  await prisma.$connect();
});

beforeEach(async () => {
  await truncateTables();
});

afterAll(async () => {
  await prisma.$disconnect();
});
