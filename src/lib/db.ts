import { PrismaClient } from "@prisma/client";

// Criando cliente Prisma usando variável de ambiente
// Configurado para evitar problemas com cache de planos após alterações de schema
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

