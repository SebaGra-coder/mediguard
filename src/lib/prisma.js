// lib/prisma.js
import { PrismaClient } from '@prisma/client'

// In JS non serve dire a "global" che tipo di dati contiene.
// Lo assegniamo direttamente.
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Mostra le query nel terminale (utile per debug)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;