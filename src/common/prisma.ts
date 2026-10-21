import { PrismaClient, Prisma } from '@prisma/client';

const prismaClient = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

const convert = (obj: any): any => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(convert);
  if (obj instanceof Prisma.Decimal) return obj.toString();
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cloned: Record<string, any> = {};
    for (const key in obj) {
      cloned[key] = convert(obj[key]);
    }
    return cloned;
  }
  return obj;
};

// Global Decimal-to-String conversion extension
const prisma = prismaClient.$extends({
  query: {
    $allOperations: async ({ args, query }) => {
      const result = await query(args);
      return convert(result);
    },
  },
}) as unknown as PrismaClient;

export default prisma;
export { prisma, prismaClient };
