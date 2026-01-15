// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Ti mostra nel terminale le query SQL che fa (comodo!)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma